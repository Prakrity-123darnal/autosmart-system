using Microsoft.EntityFrameworkCore;
using AutoSmart.API.Data;
using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public sealed class PartRepository : IPartRepository
{
    private readonly AppDbContext _db;

    public PartRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Part> AddAsync(Part part, CancellationToken ct = default)
    {
        _db.Parts.Add(part);
        await _db.SaveChangesAsync(ct);
        return part;
    }

    public Task<List<Part>> GetAllAsync(CancellationToken ct = default)
    {
        return _db.Parts
            .AsNoTracking()
            .OrderByDescending(p => p.Id)
            .ToListAsync(ct);
    }

    public Task<Part?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _db.Parts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public Task<Part?> GetByIdTrackedAsync(int id, CancellationToken ct = default)
    {
        return _db.Parts
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
    {
        return _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var part = await GetByIdTrackedAsync(id, ct);
        if (part is null)
            throw new ArgumentException("Part not found.", nameof(id));

        _db.Parts.Remove(part);
        await _db.SaveChangesAsync(ct);
    }
}
