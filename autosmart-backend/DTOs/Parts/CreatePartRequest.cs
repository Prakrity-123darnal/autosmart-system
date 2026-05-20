namespace AutoSmart.API.DTOs.Parts;

public sealed class CreatePartRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int VendorId { get; set; }
}
