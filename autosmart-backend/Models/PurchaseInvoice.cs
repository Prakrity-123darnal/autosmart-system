namespace AutoSmart.API.Models;

public class PurchaseInvoice
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Vendor? Vendor { get; set; }
    public List<PurchaseItem> Items { get; set; } = new();
}