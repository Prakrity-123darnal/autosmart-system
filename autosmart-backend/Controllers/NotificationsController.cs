using System.Security.Claims;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Notifications;
using AutoSmart.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<NotificationItemDto>>> GetNotifications(
        [FromQuery] int threshold = 10,
        CancellationToken ct = default)
    {
        var role = User.FindFirstValue(ClaimTypes.Role)?.ToLowerInvariant();

        if (role == "customer")
            return Ok(await GetCustomerNotificationsAsync(ct));

        var lowStockParts = await _db.Parts
            .AsNoTracking()
            .Where(p => p.Stock < threshold)
            .OrderBy(p => p.Stock)
            .ToListAsync(ct);

        var notifications = lowStockParts.Select((p, idx) => new NotificationItemDto
        {
            Id = idx + 1,
            Type = "alert",
            Title = "Low Stock Alert",
            Message = $"{p.Name} stock is below {threshold} units. Please reorder soon.",
            Time = "just now",
            Read = false
        }).ToList();

        return Ok(notifications);
    }

    private async Task<List<NotificationItemDto>> GetCustomerNotificationsAsync(
        CancellationToken ct)
    {
        var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
        if (customerId is null)
            return new List<NotificationItemDto>();

        var notifications = new List<NotificationItemDto>();
        var id = 1;
        var now = DateTime.UtcNow;

        var unpaid = await _db.SalesInvoices
            .AsNoTracking()
            .Where(i => i.CustomerId == customerId && !i.IsPaid)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

        foreach (var invoice in unpaid)
        {
            notifications.Add(new NotificationItemDto
            {
                Id = id++,
                Type = "alert",
                Title = "Payment Due",
                Message = $"Credit payment of Rs. {invoice.TotalAmount:N0} is due for invoice #{invoice.Id}.",
                Time = invoice.CreatedAt.ToString("MMM d, yyyy"),
                Read = false,
            });
        }

        var upcoming = await _db.Appointments
            .AsNoTracking()
            .Where(a =>
                a.CustomerId == customerId &&
                a.AppointmentDate >= now &&
                a.Status != "cancelled" &&
                a.Status != "completed")
            .OrderBy(a => a.AppointmentDate)
            .Take(5)
            .ToListAsync(ct);

        foreach (var appt in upcoming)
        {
            notifications.Add(new NotificationItemDto
            {
                Id = id++,
                Type = "info",
                Title = "Upcoming Appointment",
                Message = $"{appt.ServiceType} scheduled for {appt.AppointmentDate:MMM d, yyyy h:mm tt}.",
                Time = appt.AppointmentDate.ToString("MMM d, yyyy"),
                Read = false,
            });
        }

        return notifications;
    }
}
