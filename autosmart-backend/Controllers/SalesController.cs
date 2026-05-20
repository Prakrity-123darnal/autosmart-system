using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Sales;
using AutoSmart.API.Services;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SalesController : ControllerBase
{
    private readonly ISalesService _service;
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public SalesController(ISalesService service, AppDbContext db, IEmailService email)
    {
        _service = service;
        _db = db;
        _email = email;
    }

    [HttpPost]
    public async Task<ActionResult<SalesInvoiceResponse>> Create(
        [FromBody] CreateSalesInvoiceRequest request,
        CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<SalesInvoiceResponse>>> GetAll(CancellationToken ct)
    {
        var sales = await _service.GetAllAsync(ct);
        return Ok(sales);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SalesInvoiceResponse>> GetById(int id, CancellationToken ct)
    {
        var sale = await _service.GetByIdAsync(id, ct);
        return sale is null ? NotFound() : Ok(sale);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SalesInvoiceResponse>> Update(
        int id,
        [FromBody] UpdateSalesInvoiceRequest request,
        CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/email")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> SendInvoiceEmail(int id, CancellationToken ct)
    {
        var invoice = await _db.SalesInvoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

        if (invoice is null)
            return NotFound(new { message = "Invoice not found" });

        if (invoice.Customer is null || string.IsNullOrWhiteSpace(invoice.Customer.Email))
            return BadRequest(new { message = "Customer has no email address on file" });

        var partNames = await _db.Parts.AsNoTracking().ToDictionaryAsync(p => p.Id, p => p.Name, ct);
        var rows = string.Join("", invoice.Items.Select(item =>
            $"<tr><td>{partNames.GetValueOrDefault(item.PartId, $"Part #{item.PartId}")}</td>" +
            $"<td>{item.Quantity}</td><td>Rs. {item.Price:N2}</td>" +
            $"<td>Rs. {(item.Price * item.Quantity):N2}</td></tr>"));

        var body =
            $"<h2>AutoSmart Invoice #{invoice.Id}</h2>" +
            $"<p>Dear {invoice.Customer.Name},</p>" +
            $"<p>Thank you for your purchase. Invoice details:</p>" +
            "<table border='1' cellpadding='8' cellspacing='0'><tr><th>Part</th><th>Qty</th><th>Price</th><th>Total</th></tr>" +
            rows +
            $"</table><p><strong>Total: Rs. {invoice.TotalAmount:N2}</strong></p>" +
            "<p>Regards,<br/>AutoSmart Team</p>";

        await _email.SendAsync(
            invoice.Customer.Email,
            invoice.Customer.Name,
            $"Your AutoSmart Invoice #{invoice.Id}",
            body);

        return Ok(new { message = "Invoice emailed successfully" });
    }
}
