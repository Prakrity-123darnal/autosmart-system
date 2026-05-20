namespace AutoSmart.API.DTOs.Sales;

public sealed class UpdateSalesInvoiceRequest
{
    public int CustomerId { get; set; }
    public int VehicleId { get; set; }
    public List<SalesInvoiceItemRequest> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public DateTime InvoiceDate { get; set; }
}

public sealed class SalesInvoiceItemRequest
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
