namespace AutoSmart.API.DTOs.Customers;

public sealed class AddCustomerVehicleRequest
{
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
}
