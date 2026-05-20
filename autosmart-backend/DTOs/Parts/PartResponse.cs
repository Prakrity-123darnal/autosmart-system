namespace AutoSmart.API.DTOs.Parts;

public sealed class PartResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int VendorId { get; set; }
}
