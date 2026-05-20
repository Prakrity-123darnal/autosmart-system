using AutoSmart.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Data;

public static class DbSeeder
{
    public const string DefaultAdminEmail = "admin@autosmart.com";
    public const string DefaultAdminPassword = "admin123";

    public static async Task SeedAdminAsync(AppDbContext db, CancellationToken ct = default)
    {
        var exists = await db.Users
            .AnyAsync(u => u.Email.ToLower() == DefaultAdminEmail, ct);

        if (exists)
            return;

        db.Users.Add(new User
        {
            Name = "System Admin",
            Email = DefaultAdminEmail,
            Password = DefaultAdminPassword,
            Phone = "9800000000",
            Role = "admin",
            CreatedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync(ct);
    }
}
