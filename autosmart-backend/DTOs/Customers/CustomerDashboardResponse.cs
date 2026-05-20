namespace AutoSmart.API.DTOs.Customers;

public sealed class CustomerDashboardResponse
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<CustomerVehicleResponse> Vehicles { get; set; } = new();
    public List<CustomerPurchaseResponse> PurchaseHistory { get; set; } = new();
    public List<CustomerAppointmentSummary> UpcomingAppointments { get; set; } = new();
    public List<CustomerServiceHistoryItem> ServiceHistory { get; set; } = new();
    public CustomerDashboardStats Stats { get; set; } = new();
}

public sealed class CustomerDashboardStats
{
    public int VehicleCount { get; set; }
    public int UpcomingAppointments { get; set; }
    public decimal PendingPayments { get; set; }
    public int NotificationCount { get; set; }
}

public sealed class CustomerAppointmentSummary
{
    public int Id { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public sealed class CustomerServiceHistoryItem
{
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal? Amount { get; set; }
    public string Type { get; set; } = string.Empty;
}
