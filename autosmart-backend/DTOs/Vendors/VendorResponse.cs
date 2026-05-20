namespace AutoSmart.API.DTOs.Vendors;

public sealed class VendorResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
