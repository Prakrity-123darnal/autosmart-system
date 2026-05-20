using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public interface IPartRepository
{
    Task<Part> AddAsync(Part part, CancellationToken ct = default);
    Task<List<Part>> GetAllAsync(CancellationToken ct = default);
    Task<Part?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Part?> GetByIdTrackedAsync(int id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
