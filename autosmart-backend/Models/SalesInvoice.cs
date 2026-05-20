namespace AutoSmart.API.Models;

public class SalesInvoice
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Customer? Customer { get; set; }
    public List<SalesItem> Items { get; set; } = new();
}