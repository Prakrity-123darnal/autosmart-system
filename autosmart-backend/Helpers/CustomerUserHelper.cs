using System.Security.Claims;
using AutoSmart.API.Data;
using AutoSmart.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Helpers;

public static class CustomerUserHelper
{
    public static bool IsStaff(ClaimsPrincipal user) =>
        user.IsInRole("admin") || user.IsInRole("staff");

    public static async Task<int?> GetCustomerIdAsync(
        ClaimsPrincipal user,
        AppDbContext db,
        CancellationToken ct)
    {
        var email = user.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return null;

        var normalized = email.Trim().ToLower();

        var customer = await db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Email.ToLower() == normalized, ct);

        if (customer is not null)
            return customer.Id;

        if (!user.IsInRole("customer"))
            return null;

        var accountUser = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Email.ToLower() == normalized && u.Role.ToLower() == "customer",
                ct);

        if (accountUser is null)
            return null;

        var created = new Customer
        {
            Name = accountUser.Name,
            Email = accountUser.Email,
            Phone = accountUser.Phone,
        };

        db.Customers.Add(created);
        await db.SaveChangesAsync(ct);

        return created.Id;
    }
}
