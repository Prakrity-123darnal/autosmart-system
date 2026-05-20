using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public interface IVehicleRepository
{
    Task<Vehicle> AddAsync(Vehicle vehicle, CancellationToken ct = default);
    Task<List<Vehicle>> GetAllAsync(CancellationToken ct = default);
    Task<List<Vehicle>> GetByCustomerIdAsync(int customerId, CancellationToken ct = default);
    Task<Vehicle?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Vehicle?> GetByIdTrackedAsync(int id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
