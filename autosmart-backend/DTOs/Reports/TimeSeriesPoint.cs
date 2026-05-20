namespace AutoSmart.API.DTOs.Reports;

public sealed class TimeSeriesPoint
{
    public string Label { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public int Customers { get; set; }
}

