namespace AutoSmart.API.DTOs.Maintenance;

public sealed class MaintenanceRecommendationDto
{
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "warning"; // warning | alert | info | success
    public string Action { get; set; } = string.Empty;
}

