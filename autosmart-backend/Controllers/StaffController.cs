using AutoSmart.API.Data;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StaffController : ControllerBase
{
    private readonly AppDbContext _db;

    public StaffController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var staff = await _db.Users
            .AsNoTracking()
            .Where(u => u.Role == "staff" || u.Role == "admin")
            .Select(u => new {
                u.Id,
                u.Name,
                u.Email,
                u.Phone,
                u.Role,
                u.CreatedAt
            })
            .OrderByDescending(u => u.Id)
            .ToListAsync(ct);

        return Ok(staff);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateStaffRequest request,
        CancellationToken ct)
    {
        var exists = await _db.Users
            .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), ct);

        if (exists)
            return BadRequest(new { message = "Email already exists" });

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Password = request.Password,
            Role = "staff",
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return Ok(new {
            user.Id,
            user.Name,
            user.Email,
            user.Phone,
            user.Role,
            user.CreatedAt
        });
    }

    [HttpPut("{id:int}/role")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRole(
        int id,
        [FromBody] UpdateRoleRequest request,
        CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user is null) return NotFound();

        user.Role = request.Role.ToLower();
        await _db.SaveChangesAsync(ct);

        return Ok(new { user.Id, user.Name, user.Role });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var user = await _db.Users.FindAsync(new object[] { id }, ct);
        if (user is null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}

public record CreateStaffRequest(string Name, string Email, string Phone, string Password);
public record UpdateRoleRequest(string Role);