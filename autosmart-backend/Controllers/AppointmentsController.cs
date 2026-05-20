using AutoSmart.API.Data;
using AutoSmart.API.Helpers;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var query = _db.Appointments
            .Include(a => a.Customer)
            .AsNoTracking()
            .AsQueryable();

        if (!CustomerUserHelper.IsStaff(User))
        {
            var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
            if (customerId is null)
                return Ok(Array.Empty<Appointment>());

            query = query.Where(a => a.CustomerId == customerId);
        }

        var list = await query
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(
        [FromBody] CreateAppointmentRequest req,
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

        var appt = new Appointment
        {
            CustomerId = customerId,
            ServiceType = req.ServiceType,
            AppointmentDate = req.AppointmentDate,
            Notes = req.Notes ?? string.Empty,
            Status = "pending"
        };

        _db.Appointments.Add(appt);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(appt).Reference(a => a.Customer).LoadAsync(ct);

        return Ok(appt);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateAppointmentStatusRequest req,
        CancellationToken ct)
    {
        var appt = await _db.Appointments.FindAsync(new object[] { id }, ct);
        if (appt is null) return NotFound();

        appt.Status = req.Status;
        await _db.SaveChangesAsync(ct);

        return Ok(appt);
    }
}

public record CreateAppointmentRequest(
    int CustomerId,
    string ServiceType,
    DateTime AppointmentDate,
    string? Notes);

public record UpdateAppointmentStatusRequest(string Status);
