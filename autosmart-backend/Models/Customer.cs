namespace AutoSmart.API.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<Vehicle> Vehicles { get; set; } = new();
    public List<SalesInvoice> SalesInvoices { get; set; } = new();
}