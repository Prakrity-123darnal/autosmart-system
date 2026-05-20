namespace AutoSmart.API.DTOs.Reports;

public sealed class CustomerReportsResponse
{
    public List<CustomerReportRow> RegularCustomers { get; set; } = new();
    public List<CustomerReportRow> TopSpenders { get; set; } = new();
    public List<CustomerReportRow> PendingCredit { get; set; } = new();
}

public sealed class CustomerReportRow
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int PurchaseCount { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal PendingAmount { get; set; }
}
