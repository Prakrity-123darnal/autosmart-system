namespace AutoSmart.API.DTOs.Reports;

public sealed class ReportSummaryResponse
{
    public decimal TotalRevenue { get; set; }
    public int TotalCustomers { get; set; }
    public int PartsSold { get; set; }
    public decimal GrowthRate { get; set; }

    public List<TimeSeriesPoint> SalesSeries { get; set; } = new();
    public List<TimeSeriesPoint> CustomerSeries { get; set; } = new();

    public List<TopPartDto> TopParts { get; set; } = new();
    public List<TopCustomerDto> TopCustomers { get; set; } = new();
}

