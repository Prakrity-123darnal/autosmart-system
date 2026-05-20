namespace AutoSmart.API.DTOs.Sales;

public sealed class CreateSalesInvoiceRequest
{
    public int CustomerId { get; set; }
    public List<CreateSalesItemRequest> Items { get; set; } = new();
}
