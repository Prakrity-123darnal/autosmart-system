using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public interface IVendorRepository
{
    Task<Vendor> AddAsync(Vendor vendor, CancellationToken ct = default);
    Task<List<Vendor>> GetAllAsync(CancellationToken ct = default);
    Task<Vendor?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Vendor?> GetByIdTrackedAsync(int id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
