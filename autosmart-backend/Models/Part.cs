namespace AutoSmart.API.Models;

public class Part
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }

    public int VendorId { get; set; }
    public Vendor? Vendor { get; set; }
}
