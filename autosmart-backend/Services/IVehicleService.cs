using AutoSmart.API.DTOs.Vehicles;

namespace AutoSmart.API.Services;

public interface IVehicleService
{
    Task<VehicleResponse> CreateAsync(CreateVehicleRequest request, CancellationToken ct = default);
    Task<List<VehicleResponse>> GetAllAsync(CancellationToken ct = default);
    Task<List<VehicleResponse>> GetByCustomerIdAsync(int customerId, CancellationToken ct = default);
    Task<VehicleResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<VehicleResponse?> UpdateAsync(int id, UpdateVehicleRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
