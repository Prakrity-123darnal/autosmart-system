namespace AutoSmart.API.DTOs.Sales;

public sealed class SalesItemResponse
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
