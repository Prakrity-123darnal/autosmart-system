namespace AutoSmart.API.DTOs.Vendors;

public sealed class CreateVendorRequest
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
