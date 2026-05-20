using AutoSmart.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Services;

public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationBackgroundService> _logger;

    public NotificationBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndNotify();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Notification check failed: {msg}", ex.Message);
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
        catch (TaskCanceledException)
        {
            _logger.LogInformation("Notification background service stopping.");
        }
    }

    private async Task CheckAndNotify()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var email = scope.ServiceProvider.GetRequiredService<IEmailService>();

        const int lowStockThreshold = 10;
        var lowStockParts = await db.Parts
            .Where(p => p.Stock < lowStockThreshold)
            .ToListAsync();

        var adminEmail = scope.ServiceProvider
            .GetRequiredService<IConfiguration>()["Email:AdminEmail"];

        if (!string.IsNullOrWhiteSpace(adminEmail) && lowStockParts.Count > 0)
        {
            var list = string.Join("<br/>", lowStockParts.Select(p =>
                $"{p.Name}: {p.Stock} units remaining"));
            try
            {
                await email.SendAsync(
                    adminEmail,
                    "Admin",
                    "AutoSmart Low Stock Alert",
                    $"<p>The following parts are below {lowStockThreshold} units:</p><p>{list}</p>");
                _logger.LogInformation("Sent low stock alert for {count} parts", lowStockParts.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not send low stock alert: {msg}", ex.Message);
            }
        }

        var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);

        var overdueInvoices = await db.SalesInvoices
            .Include(i => i.Customer)
            .Where(i => i.IsPaid == false && i.CreatedAt < oneMonthAgo)
            .ToListAsync();

        foreach (var inv in overdueInvoices)
        {
            if (inv.Customer == null) continue;
            if (string.IsNullOrWhiteSpace(inv.Customer.Email)) continue;

            try
            {
                await email.SendAsync(
                    inv.Customer.Email,
                    inv.Customer.Name,
                    "Payment Reminder - AutoSmart",
                    $"<p>Dear {inv.Customer.Name},</p>" +
                    $"<p>This is a reminder that your invoice <b>#{inv.Id}</b> " +
                    $"of <b>Rs. {inv.TotalAmount:N2}</b> is overdue for more than 1 month.</p>" +
                    $"<p>Please visit us to clear the balance.</p>" +
                    $"<p>Thank you,<br/>AutoSmart Team</p>"
                );

                _logger.LogInformation("Sent overdue email to {email}", inv.Customer.Email);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not send email to {email}: {msg}",
                    inv.Customer.Email, ex.Message);
            }
        }
    }
}