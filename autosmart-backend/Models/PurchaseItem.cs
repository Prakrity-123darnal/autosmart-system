namespace AutoSmart.API.Models;

public class PurchaseItem
{
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}