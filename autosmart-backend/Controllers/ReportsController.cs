using System.Globalization;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    [Authorize(Roles = "admin,staff")]
    public async Task<ActionResult<ReportSummaryResponse>> GetSummary(
        [FromQuery] string period = "monthly",
        CancellationToken ct = default)
    {
        var normalizedPeriod = (period ?? string.Empty).Trim().ToLowerInvariant();
        if (normalizedPeriod is not ("daily" or "monthly" or "yearly"))
            normalizedPeriod = "monthly";

        var now = DateTime.UtcNow;

        DateTime start;
        DateTime end;
        DateTime prevStart;
        DateTime prevEnd;

        if (normalizedPeriod == "daily")
        {
            start = now.Date.AddDays(-6);
            end = now.Date.AddDays(1);
            prevStart = start.AddDays(-7);
            prevEnd = start;
        }
        else if (normalizedPeriod == "yearly")
        {
            start = new DateTime(now.Year - 4, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            end = new DateTime(now.Year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            prevStart = new DateTime(start.Year - 5, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            prevEnd = start;
        }
        else
        {
            // monthly
            start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
            end = start.AddMonths(6);
            prevStart = start.AddMonths(-6);
            prevEnd = start;
        }

        var invoices = await _db.SalesInvoices
            .Include(i => i.Items)
            .Where(i => i.CreatedAt >= start && i.CreatedAt < end)
            .ToListAsync(ct);

        var prevRevenue = await _db.SalesInvoices
            .Where(i => i.CreatedAt >= prevStart && i.CreatedAt < prevEnd)
            .SumAsync(i => (decimal?)i.TotalAmount, ct) ?? 0m;

        var totalRevenue = invoices.Sum(i => i.TotalAmount);
        var distinctCustomerCount = invoices.Select(i => i.CustomerId).Distinct().Count();
        var partsSold = invoices.Sum(i => i.Items.Sum(it => it.Quantity));

        var growthRate = prevRevenue == 0m ? 0m : ((totalRevenue - prevRevenue) / prevRevenue) * 100m;

        var response = new ReportSummaryResponse
        {
            TotalRevenue = totalRevenue,
            TotalCustomers = distinctCustomerCount,
            PartsSold = partsSold,
            GrowthRate = growthRate
        };

        // Build time buckets + series.
        List<DateTime> buckets = new();
        if (normalizedPeriod == "daily")
        {
            buckets = Enumerable.Range(0, 7).Select(offset => start.AddDays(offset)).ToList();
        }
        else if (normalizedPeriod == "yearly")
        {
            buckets = Enumerable.Range(0, 5).Select(offset => start.AddYears(offset)).ToList();
        }
        else
        {
            buckets = Enumerable.Range(0, 6).Select(offset => start.AddMonths(offset)).ToList();
        }

        foreach (var bucket in buckets)
        {
            if (normalizedPeriod == "daily")
            {
                var bucketStart = bucket;
                var bucketEnd = bucket.AddDays(1);
                var bucketInvoices = invoices.Where(i => i.CreatedAt >= bucketStart && i.CreatedAt < bucketEnd).ToList();
                var sales = bucketInvoices.Sum(i => i.TotalAmount);
                var customers = bucketInvoices.Select(i => i.CustomerId).Distinct().Count();

                response.SalesSeries.Add(new TimeSeriesPoint
                {
                    Label = bucket.ToString("dd MMM", CultureInfo.InvariantCulture),
                    Sales = sales,
                    Customers = customers
                });
            }
            else if (normalizedPeriod == "yearly")
            {
                var bucketStart = new DateTime(bucket.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var bucketEnd = new DateTime(bucket.Year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var bucketInvoices = invoices.Where(i => i.CreatedAt >= bucketStart && i.CreatedAt < bucketEnd).ToList();
                var sales = bucketInvoices.Sum(i => i.TotalAmount);
                var customers = bucketInvoices.Select(i => i.CustomerId).Distinct().Count();

                response.SalesSeries.Add(new TimeSeriesPoint
                {
                    Label = bucket.Year.ToString(CultureInfo.InvariantCulture),
                    Sales = sales,
                    Customers = customers
                });
            }
            else
            {
                var bucketStart = new DateTime(bucket.Year, bucket.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var bucketEnd = bucketStart.AddMonths(1);
                var bucketInvoices = invoices.Where(i => i.CreatedAt >= bucketStart && i.CreatedAt < bucketEnd).ToList();
                var sales = bucketInvoices.Sum(i => i.TotalAmount);
                var customers = bucketInvoices.Select(i => i.CustomerId).Distinct().Count();

                response.SalesSeries.Add(new TimeSeriesPoint
                {
                    Label = bucket.ToString("MMM", CultureInfo.InvariantCulture),
                    Sales = sales,
                    Customers = customers
                });
            }
        }

        // Customer series mirrors the same buckets, but customers-only values.
        response.CustomerSeries = response.SalesSeries
            .Select(p => new TimeSeriesPoint { Label = p.Label, Sales = p.Sales, Customers = p.Customers })
            .ToList();

        // Top Parts
        var partNames = await _db.Parts.AsNoTracking().ToDictionaryAsync(p => p.Id, p => p.Name, ct);
        response.TopParts = invoices
            .SelectMany(i => i.Items)
            .GroupBy(it => it.PartId)
            .Select(g => new TopPartDto
            {
                Name = partNames.TryGetValue(g.Key, out var name) ? name : $"Part #{g.Key}",
                Value = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.Value)
            .Take(5)
            .ToList();

        // Top Customers
        var customerNames = await _db.Customers.AsNoTracking().ToDictionaryAsync(c => c.Id, c => c.Name, ct);
        response.TopCustomers = invoices
            .GroupBy(i => i.CustomerId)
            .Select(g => new TopCustomerDto
            {
                Name = customerNames.TryGetValue(g.Key, out var name) ? name : $"Customer #{g.Key}",
                Purchases = g.Count(),
                Amount = g.Sum(x => x.TotalAmount)
            })
            .OrderByDescending(x => x.Amount)
            .Take(5)
            .ToList();

        return Ok(response);
    }

    [HttpGet("customers")]
    [Authorize(Roles = "admin,staff")]
    public async Task<ActionResult<CustomerReportsResponse>> GetCustomerReports(CancellationToken ct = default)
    {
        var invoices = await _db.SalesInvoices
            .Include(i => i.Customer)
            .AsNoTracking()
            .ToListAsync(ct);

        var grouped = invoices
            .GroupBy(i => i.CustomerId)
            .Select(g =>
            {
                var customer = g.First().Customer;
                return new
                {
                    CustomerId = g.Key,
                    Name = customer?.Name ?? $"Customer #{g.Key}",
                    Phone = customer?.Phone ?? "",
                    PurchaseCount = g.Count(),
                    TotalSpent = g.Sum(x => x.TotalAmount),
                    PendingAmount = g.Where(x => !x.IsPaid).Sum(x => x.TotalAmount),
                };
            })
            .ToList();

        var response = new CustomerReportsResponse
        {
            RegularCustomers = grouped
                .Where(c => c.PurchaseCount >= 2)
                .OrderByDescending(c => c.PurchaseCount)
                .Select(c => new CustomerReportRow
                {
                    CustomerId = c.CustomerId,
                    Name = c.Name,
                    Phone = c.Phone,
                    PurchaseCount = c.PurchaseCount,
                    TotalSpent = c.TotalSpent,
                    PendingAmount = c.PendingAmount,
                })
                .ToList(),
            TopSpenders = grouped
                .OrderByDescending(c => c.TotalSpent)
                .Take(10)
                .Select(c => new CustomerReportRow
                {
                    CustomerId = c.CustomerId,
                    Name = c.Name,
                    Phone = c.Phone,
                    PurchaseCount = c.PurchaseCount,
                    TotalSpent = c.TotalSpent,
                    PendingAmount = c.PendingAmount,
                })
                .ToList(),
            PendingCredit = grouped
                .Where(c => c.PendingAmount > 0)
                .OrderByDescending(c => c.PendingAmount)
                .Select(c => new CustomerReportRow
                {
                    CustomerId = c.CustomerId,
                    Name = c.Name,
                    Phone = c.Phone,
                    PurchaseCount = c.PurchaseCount,
                    TotalSpent = c.TotalSpent,
                    PendingAmount = c.PendingAmount,
                })
                .ToList(),
        };

        return Ok(response);
    }
}

