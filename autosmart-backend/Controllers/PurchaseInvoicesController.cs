using AutoSmart.API.Data;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/purchase-invoices")]
public sealed class PurchaseInvoicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PurchaseInvoicesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var invoices = await _db.PurchaseInvoices
            .Include(p => p.Items)
            .Include(p => p.Vendor)
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePurchaseRequest req,
        CancellationToken ct)
    {
        var vendor = await _db.Vendors.FindAsync(new object[] { req.VendorId }, ct);
        if (vendor is null)
            return BadRequest(new { message = "Vendor not found" });

        var invoice = new PurchaseInvoice
        {
            VendorId = req.VendorId,
            CreatedAt = DateTime.UtcNow,
            Items = req.Items.Select(i => new PurchaseItem
            {
                PartName = i.PartName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        invoice.TotalAmount = invoice.Items.Sum(i => i.Quantity * i.UnitPrice);

        // Auto update stock for matching parts
        foreach (var item in invoice.Items)
        {
            var part = await _db.Parts.FirstOrDefaultAsync(p =>
                p.Name.ToLower() == item.PartName.ToLower(), ct);
            if (part != null)
                part.Stock += item.Quantity;
        }

        _db.PurchaseInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);

        return Ok(invoice);
    }
}

public record CreatePurchaseItemRequest(string PartName, int Quantity, decimal UnitPrice);
public record CreatePurchaseRequest(int VendorId, List<CreatePurchaseItemRequest> Items);