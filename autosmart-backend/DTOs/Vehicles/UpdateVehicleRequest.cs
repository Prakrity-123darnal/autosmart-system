namespace AutoSmart.API.DTOs.Vehicles;

public sealed class UpdateVehicleRequest
{
    public string VehicleNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int CustomerId { get; set; }
}
