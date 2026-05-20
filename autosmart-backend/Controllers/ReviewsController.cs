using AutoSmart.API.Data;
using AutoSmart.API.Helpers;
using AutoSmart.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _db.Reviews
            .Include(r => r.Customer)
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(
        [FromBody] CreateReviewRequest req,
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

        var review = new Review
        {
            CustomerId = customerId,
            Rating = req.Rating,
            Comment = req.Comment
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(review).Reference(r => r.Customer).LoadAsync(ct);

        return Ok(review);
    }
}

public record CreateReviewRequest(int CustomerId, int Rating, string Comment);