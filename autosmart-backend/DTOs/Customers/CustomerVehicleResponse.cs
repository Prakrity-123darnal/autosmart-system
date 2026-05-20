namespace AutoSmart.API.DTOs.Customers;

public sealed class CustomerVehicleResponse
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
}
