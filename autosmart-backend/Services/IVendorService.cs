using AutoSmart.API.DTOs.Vendors;

namespace AutoSmart.API.Services;

public interface IVendorService
{
    Task<VendorResponse> CreateAsync(CreateVendorRequest request, CancellationToken ct = default);
    Task<List<VendorResponse>> GetAllAsync(CancellationToken ct = default);
    Task<VendorResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<VendorResponse?> UpdateAsync(int id, UpdateVendorRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
