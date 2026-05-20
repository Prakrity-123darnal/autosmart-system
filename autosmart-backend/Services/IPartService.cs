using AutoSmart.API.DTOs.Parts;

namespace AutoSmart.API.Services;

public interface IPartService
{
    Task<PartResponse> CreateAsync(CreatePartRequest request, CancellationToken ct = default);
    Task<List<PartResponse>> GetAllAsync(CancellationToken ct = default);
    Task<PartResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PartResponse?> UpdateAsync(int id, UpdatePartRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
