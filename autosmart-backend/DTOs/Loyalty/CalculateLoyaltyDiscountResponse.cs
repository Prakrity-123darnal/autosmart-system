namespace AutoSmart.API.DTOs.Loyalty;

public sealed class CalculateLoyaltyDiscountResponse
{
    public decimal DiscountRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAfterDiscount { get; set; }
}

