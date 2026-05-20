using AutoSmart.API.DTOs.Vendors;
using AutoSmart.API.Models;
using AutoSmart.API.Repositories;

namespace AutoSmart.API.Services;

public sealed class VendorService : IVendorService
{
    private readonly IVendorRepository _repo;

    public VendorService(IVendorRepository repo)
    {
        _repo = repo;
    }

    public async Task<VendorResponse> CreateAsync(CreateVendorRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone is required.", nameof(request));

        var vendor = new Vendor
        {
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim()
        };

        var created = await _repo.AddAsync(vendor, ct);
        return ToResponse(created);
    }

    public async Task<List<VendorResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var vendors = await _repo.GetAllAsync(ct);
        return vendors.Select(ToResponse).ToList();
    }

    public async Task<VendorResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var vendor = await _repo.GetByIdAsync(id, ct);
        return vendor is null ? null : ToResponse(vendor);
    }

    public async Task<VendorResponse?> UpdateAsync(int id, UpdateVendorRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone is required.", nameof(request));

        var vendor = await _repo.GetByIdTrackedAsync(id, ct);
        if (vendor is null)
            return null;

        vendor.Name = request.Name.Trim();
        vendor.Phone = request.Phone.Trim();

        await _repo.SaveChangesAsync(ct);
        return ToResponse(vendor);
    }

    public Task DeleteAsync(int id, CancellationToken ct = default)
    {
        return _repo.DeleteAsync(id, ct);
    }

    private static VendorResponse ToResponse(Vendor vendor)
    {
        return new VendorResponse
        {
            Id = vendor.Id,
            Name = vendor.Name,
            Phone = vendor.Phone
        };
    }
}
