namespace AutoSmart.API.DTOs.Sales;

public sealed class SalesInvoiceResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<SalesItemResponse> Items { get; set; } = new();
}
