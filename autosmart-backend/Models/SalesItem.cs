namespace AutoSmart.API.Models;

public class SalesItem
{
    public int Id { get; set; }
    public int SalesInvoiceId { get; set; }
    public int PartId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }

    public SalesInvoice? SalesInvoice { get; set; }
    public Part? Part { get; set; }
}
