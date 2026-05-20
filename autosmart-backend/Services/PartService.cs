using AutoSmart.API.DTOs.Parts;
using AutoSmart.API.Models;
using AutoSmart.API.Repositories;

namespace AutoSmart.API.Services;

public sealed class PartService : IPartService
{
    private readonly IPartRepository _partRepo;
    private readonly IVendorRepository _vendorRepo;

    public PartService(IPartRepository partRepo, IVendorRepository vendorRepo)
    {
        _partRepo = partRepo;
        _vendorRepo = vendorRepo;
    }

    public async Task<PartResponse> CreateAsync(CreatePartRequest request, CancellationToken ct = default)
    {
        ValidatePartInput(request.Name, request.Price, request.Stock);

        var vendor = await _vendorRepo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null)
            throw new ArgumentException("Vendor not found.", nameof(request));

        var part = new Part
        {
            Name = request.Name.Trim(),
            Price = request.Price,
            Stock = request.Stock,
            VendorId = request.VendorId
        };

        var created = await _partRepo.AddAsync(part, ct);
        return ToResponse(created);
    }

    public async Task<List<PartResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var parts = await _partRepo.GetAllAsync(ct);
        return parts.Select(ToResponse).ToList();
    }

    public async Task<PartResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var part = await _partRepo.GetByIdAsync(id, ct);
        return part is null ? null : ToResponse(part);
    }

    public async Task<PartResponse?> UpdateAsync(int id, UpdatePartRequest request, CancellationToken ct = default)
    {
        ValidatePartInput(request.Name, request.Price, request.Stock);

        var vendor = await _vendorRepo.GetByIdAsync(request.VendorId, ct);
        if (vendor is null)
            throw new ArgumentException("Vendor not found.", nameof(request));

        var part = await _partRepo.GetByIdTrackedAsync(id, ct);
        if (part is null)
            return null;

        part.Name = request.Name.Trim();
        part.Price = request.Price;
        part.Stock = request.Stock;
        part.VendorId = request.VendorId;

        await _partRepo.SaveChangesAsync(ct);
        return ToResponse(part);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        // Repository will throw if the entity doesn't exist.
        await _partRepo.DeleteAsync(id, ct);
    }

    private static void ValidatePartInput(string name, decimal price, int stock)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.");

        if (price <= 0)
            throw new ArgumentException("Price must be greater than 0.");

        if (stock < 0)
            throw new ArgumentException("Stock cannot be negative.");
    }

    private static PartResponse ToResponse(Part part)
    {
        return new PartResponse
        {
            Id = part.Id,
            Name = part.Name,
            Price = part.Price,
            Stock = part.Stock,
            VendorId = part.VendorId
        };
    }
}
