namespace AutoSmart.API.DTOs.Reports;

public sealed class TopCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public int Purchases { get; set; }
    public decimal Amount { get; set; }
}

