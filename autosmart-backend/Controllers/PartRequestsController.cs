using AutoSmart.API.Data;
using AutoSmart.API.Helpers;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PartRequestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PartRequestsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var query = _db.PartRequests
            .Include(p => p.Customer)
            .AsNoTracking()
            .AsQueryable();

        if (!CustomerUserHelper.IsStaff(User))
        {
            var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
            if (customerId is null)
                return Ok(Array.Empty<PartRequest>());

            query = query.Where(p => p.CustomerId == customerId);
        }

        var list = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(
        [FromBody] CreatePartRequestRequest req,
        CancellationToken ct)
    {
        var customerId = req.CustomerId;
        if (!CustomerUserHelper.IsStaff(User))
        {
            var ownId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
            if (ownId is null)
                return BadRequest(new { message = "No customer profile found for your account." });
            customerId = ownId.Value;
        }

        var pr = new PartRequest
        {
            CustomerId = customerId,
            PartName = req.PartName,
            Description = req.Description ?? string.Empty
        };

        _db.PartRequests.Add(pr);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(pr).Reference(p => p.Customer).LoadAsync(ct);

        return Ok(pr);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdatePartRequestStatusRequest req,
        CancellationToken ct)
    {
        var pr = await _db.PartRequests.FindAsync(new object[] { id }, ct);
        if (pr is null) return NotFound();

        pr.Status = req.Status;
        await _db.SaveChangesAsync(ct);

        return Ok(pr);
    }
}

public record CreatePartRequestRequest(int CustomerId, string PartName, string? Description);
public record UpdatePartRequestStatusRequest(string Status);
