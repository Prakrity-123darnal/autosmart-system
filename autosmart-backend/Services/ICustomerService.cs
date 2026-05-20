using AutoSmart.API.DTOs.Customers;

namespace AutoSmart.API.Services;

public interface ICustomerService
{
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, CancellationToken ct = default);
    Task<CustomerResponse> CreateWithVehicleAsync(CreateCustomerWithVehicleRequest request, CancellationToken ct = default);
    Task<List<CustomerResponse>> GetAllAsync(CancellationToken ct = default);
    Task<CustomerResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CustomerDetailsResponse?> GetDetailsByIdAsync(int id, CancellationToken ct = default);
    Task<List<CustomerResponse>> SearchAsync(string query, CancellationToken ct = default);
    Task<CustomerResponse?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<CustomerResponse?> GetOrCreateByUserEmailAsync(string email, CancellationToken ct = default);
    Task<CustomerDashboardResponse?> GetDashboardAsync(int customerId, CancellationToken ct = default);
    Task<CustomerResponse> UpdateProfileAsync(int customerId, UpdateCustomerProfileRequest request, CancellationToken ct = default);
    Task<CustomerVehicleResponse> AddVehicleAsync(int customerId, AddCustomerVehicleRequest request, CancellationToken ct = default);
}

