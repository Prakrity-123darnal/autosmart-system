namespace AutoSmart.API.DTOs.Customers;

public sealed class CustomerDetailsResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<CustomerVehicleResponse> Vehicles { get; set; } = new();
    public List<CustomerPurchaseResponse> PurchaseHistory { get; set; } = new();
}

public sealed class CustomerPurchaseResponse
{
    public int InvoiceId { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public DateTime CreatedAt { get; set; }
}
