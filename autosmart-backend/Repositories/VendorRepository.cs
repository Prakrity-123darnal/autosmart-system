using Microsoft.EntityFrameworkCore;
using AutoSmart.API.Data;
using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public sealed class VendorRepository : IVendorRepository
{
    private readonly AppDbContext _db;

    public VendorRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Vendor> AddAsync(Vendor vendor, CancellationToken ct = default)
    {
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync(ct);
        return vendor;
    }

    public Task<List<Vendor>> GetAllAsync(CancellationToken ct = default)
    {
        return _db.Vendors
            .AsNoTracking()
            .OrderByDescending(v => v.Id)
            .ToListAsync(ct);
    }

    public Task<Vendor?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _db.Vendors
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public Task<Vendor?> GetByIdTrackedAsync(int id, CancellationToken ct = default)
    {
        return _db.Vendors
            .FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
    {
        return _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var vendor = await GetByIdTrackedAsync(id, ct);
        if (vendor is null)
            throw new ArgumentException("Vendor not found.", nameof(id));

        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync(ct);
    }
}
