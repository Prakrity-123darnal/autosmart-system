using AutoSmart.API.DTOs.Loyalty;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class LoyaltyController : ControllerBase
{
    [HttpPost("calculate-discount")]
    [Authorize]
    public ActionResult<CalculateLoyaltyDiscountResponse> CalculateDiscount(
        [FromBody] CalculateLoyaltyDiscountRequest request)
    {
        var subtotal = request.Subtotal;
        if (subtotal <= 0)
            return new CalculateLoyaltyDiscountResponse
            {
                DiscountRate = 0m,
                DiscountAmount = 0m,
                TotalAfterDiscount = 0m
            };

        // Simple loyalty rule until customer/account linkage is modeled:
        // 10% discount if subtotal > 5000.
        var discountRate = subtotal > 5000m ? 0.10m : 0m;
        var discountAmount = subtotal * discountRate;
        var totalAfterDiscount = subtotal - discountAmount;

        return Ok(new CalculateLoyaltyDiscountResponse
        {
            DiscountRate = discountRate,
            DiscountAmount = discountAmount,
            TotalAfterDiscount = totalAfterDiscount
        });
    }
}

