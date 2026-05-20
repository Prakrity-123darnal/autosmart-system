using System.Security.Claims;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Maintenance;
using AutoSmart.API.Helpers;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class MaintenanceController : ControllerBase
{
    private readonly AppDbContext _db;

    public MaintenanceController(AppDbContext db)
    {
        _db = db;
    }

    // Derives maintenance recommendations from recent sales + current low-stock parts.
    // This is intentionally lightweight until vehicle/service records exist in the database.
    [HttpGet("recommendations")]
    [Authorize(Roles = "customer")]
    public async Task<ActionResult<List<MaintenanceRecommendationDto>>> GetRecommendations(
        CancellationToken ct = default)
    {
        var role = User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant();
        if (role != "customer")
            return Ok(new List<MaintenanceRecommendationDto>());

        var threshold = 10;

        var lowStockParts = await _db.Parts
            .AsNoTracking()
            .Where(p => p.Stock < threshold)
            .ToListAsync(ct);

        var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);

        var invoiceQuery = _db.SalesInvoices
            .Include(i => i.Items)
            .AsNoTracking()
            .Where(i => i.CreatedAt >= DateTime.UtcNow.AddDays(-30));

        if (customerId is not null)
            invoiceQuery = invoiceQuery.Where(i => i.CustomerId == customerId.Value);

        var recentInvoices = await invoiceQuery.ToListAsync(ct);

        var partNames = await _db.Parts
            .AsNoTracking()
            .ToDictionaryAsync(p => p.Id, p => p.Name, ct);

        var topSoldPartIds = recentInvoices
            .SelectMany(i => i.Items)
            .GroupBy(it => it.PartId)
            .Select(g => new { PartId = g.Key, Qty = g.Sum(x => x.Quantity) })
            .OrderByDescending(x => x.Qty)
            .Take(3)
            .Select(x => x.PartId)
            .ToList();

        // Create a small, deterministic set of cards for the UI.
        var recommendations = new List<MaintenanceRecommendationDto>();

        foreach (var part in lowStockParts)
        {
            if (recommendations.Count >= 3) break;

            var name = part.Name;
            if (name.Contains("Oil", StringComparison.OrdinalIgnoreCase))
            {
                recommendations.Add(new MaintenanceRecommendationDto
                {
                    Type = "warning",
                    Message = "Your next service may be due soon. Consider an oil check/oil change based on recent purchases and current part availability.",
                    Action = "Book Now"
                });
            }
            else if (name.Contains("Brake", StringComparison.OrdinalIgnoreCase) || name.Contains("Pad", StringComparison.OrdinalIgnoreCase))
            {
                recommendations.Add(new MaintenanceRecommendationDto
                {
                    Type = "alert",
                    Message = "Brake service inspection is recommended soon due to low brake-part inventory.",
                    Action = "Schedule Inspection"
                });
            }
            else
            {
                recommendations.Add(new MaintenanceRecommendationDto
                {
                    Type = "info",
                    Message = $"Consider a maintenance check for parts like \"{name}\" soon (based on recent sales and current stock levels).",
                    Action = "View Details"
                });
            }
        }

        // If low-stock didn’t produce enough, fall back to top sold parts.
        foreach (var partId in topSoldPartIds)
        {
            if (recommendations.Count >= 3) break;
            if (!partNames.TryGetValue(partId, out var name))
                continue;

            recommendations.Add(new MaintenanceRecommendationDto
            {
                Type = "info",
                Message = $"Maintenance recommendation: a check for \"{name}\" based on the latest 30-day demand.",
                Action = "View Recommendation"
            });
        }

        return Ok(recommendations);
    }
}

