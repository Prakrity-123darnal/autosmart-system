using System.Globalization;
using Microsoft.EntityFrameworkCore;
using AutoSmart.API.DTOs.Sales;
using AutoSmart.API.Data;
using AutoSmart.API.Models;
using AutoSmart.API.Repositories;

namespace AutoSmart.API.Services;

public sealed class SalesService : ISalesService
{
    private readonly AppDbContext _db;
    private readonly ICustomerRepository _customerRepo;
    private readonly IPartRepository _partRepo;

    public SalesService(
        AppDbContext db,
        ICustomerRepository customerRepo,
        IPartRepository partRepo)
    {
        _db = db;
        _customerRepo = customerRepo;
        _partRepo = partRepo;
    }

    public async Task<SalesInvoiceResponse> CreateAsync(CreateSalesInvoiceRequest request, CancellationToken ct = default)
    {
        if (request.Items.Count == 0)
            throw new ArgumentException("At least one sales item is required.", nameof(request));

        var customer = await _customerRepo.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            throw new ArgumentException("Customer not found.", nameof(request));

        var salesItems = new List<SalesItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(request));

            var part = await _partRepo.GetByIdTrackedAsync(item.PartId, ct);
            if (part is null)
                throw new ArgumentException($"Part not found: {item.PartId}.", nameof(request));

            if (part.Stock < item.Quantity)
                throw new ArgumentException($"Not enough stock for part '{part.Name}'.", nameof(request));

            part.Stock -= item.Quantity;

            var lineTotal = part.Price * item.Quantity;
            totalAmount += lineTotal;

            salesItems.Add(new SalesItem
            {
                PartId = part.Id,
                Quantity = item.Quantity,
                Price = part.Price
            });
        }

        // Loyalty: 10% discount when purchase exceeds Rs. 5000
        if (totalAmount > 5000m)
            totalAmount *= 0.9m;

        var invoice = new SalesInvoice
        {
            CustomerId = request.CustomerId,
            TotalAmount = totalAmount,
            CreatedAt = DateTime.UtcNow,
            Items = salesItems
        };

        _db.SalesInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);
        return ToResponse(invoice);
    }

    public async Task<List<SalesInvoiceResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var invoices = await _db.SalesInvoices
            .Include(i => i.Items)
            .AsNoTracking()
            .OrderByDescending(i => i.Id)
            .ToListAsync(ct);

        return invoices.Select(ToResponse).ToList();
    }

    public async Task<SalesInvoiceResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var invoice = await _db.SalesInvoices
            .Include(i => i.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        return invoice is null ? null : ToResponse(invoice);
    }

    public async Task<SalesInvoiceResponse?> UpdateAsync(int id, UpdateSalesInvoiceRequest request, CancellationToken ct = default)
    {
        var invoice = await _db.SalesInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice is null)
            return null;

        if (request.Items.Count == 0)
            throw new ArgumentException("At least one sales item is required.", nameof(request));

        // Restore stock from existing items first, then apply the new ones.
        foreach (var existingItem in invoice.Items)
        {
            var part = await _partRepo.GetByIdTrackedAsync(existingItem.PartId, ct);
            if (part is null)
                throw new ArgumentException($"Part not found: {existingItem.PartId}.", nameof(request));

            part.Stock += existingItem.Quantity;
        }

        // Remove old items.
        _db.SalesItems.RemoveRange(invoice.Items);
        invoice.Items.Clear();

        var newItems = new List<SalesItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(request));

            var part = await _partRepo.GetByIdTrackedAsync(item.PartId, ct);
            if (part is null)
                throw new ArgumentException($"Part not found: {item.PartId}.", nameof(request));

            if (part.Stock < item.Quantity)
                throw new ArgumentException($"Not enough stock for part '{part.Name}'.", nameof(request));

            part.Stock -= item.Quantity;

            var lineTotal = part.Price * item.Quantity;
            totalAmount += lineTotal;

            newItems.Add(new SalesItem
            {
                PartId = part.Id,
                Quantity = item.Quantity,
                Price = part.Price
            });
        }

        var customer = await _customerRepo.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            throw new ArgumentException("Customer not found.", nameof(request));

        invoice.CustomerId = request.CustomerId;
        invoice.TotalAmount = totalAmount;
        invoice.CreatedAt = request.InvoiceDate == default ? DateTime.UtcNow : request.InvoiceDate;
        invoice.Items = newItems;

        await _db.SaveChangesAsync(ct);
        return ToResponse(invoice);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var invoice = await _db.SalesInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice is null)
            throw new ArgumentException("Sales invoice not found.", nameof(id));

        // Restore stock before deleting the invoice.
        foreach (var item in invoice.Items)
        {
            var part = await _partRepo.GetByIdTrackedAsync(item.PartId, ct);
            if (part is null)
                throw new ArgumentException($"Part not found: {item.PartId}.", nameof(id));

            part.Stock += item.Quantity;
        }

        _db.SalesInvoices.Remove(invoice);
        await _db.SaveChangesAsync(ct);
    }

    private static SalesInvoiceResponse ToResponse(SalesInvoice invoice)
    {
        return new SalesInvoiceResponse
        {
            Id = invoice.Id,
            CustomerId = invoice.CustomerId,
            TotalAmount = invoice.TotalAmount,
            CreatedAt = invoice.CreatedAt,
            Items = invoice.Items.Select(i => new SalesItemResponse
            {
                PartId = i.PartId,
                Quantity = i.Quantity,
                UnitPrice = i.Price,
                LineTotal = i.Price * i.Quantity
            }).ToList()
        };
    }
}
