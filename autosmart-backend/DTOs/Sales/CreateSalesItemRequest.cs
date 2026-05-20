namespace AutoSmart.API.DTOs.Sales;

public sealed class CreateSalesItemRequest
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
}
