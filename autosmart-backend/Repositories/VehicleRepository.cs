using Microsoft.EntityFrameworkCore;
using AutoSmart.API.Data;
using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public sealed class VehicleRepository : IVehicleRepository
{
    private readonly AppDbContext _db;

    public VehicleRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Vehicle> AddAsync(Vehicle vehicle, CancellationToken ct = default)
    {
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync(ct);
        return vehicle;
    }

    public Task<List<Vehicle>> GetAllAsync(CancellationToken ct = default)
    {
        return _db.Vehicles
            .AsNoTracking()
            .OrderByDescending(v => v.Id)
            .ToListAsync(ct);
    }

    public Task<List<Vehicle>> GetByCustomerIdAsync(int customerId, CancellationToken ct = default)
    {
        return _db.Vehicles
            .AsNoTracking()
            .Where(v => v.CustomerId == customerId)
            .OrderByDescending(v => v.Id)
            .ToListAsync(ct);
    }

    public Task<Vehicle?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _db.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public Task<Vehicle?> GetByIdTrackedAsync(int id, CancellationToken ct = default)
    {
        return _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
    {
        return _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var vehicle = await GetByIdTrackedAsync(id, ct);
        if (vehicle is null)
            throw new ArgumentException("Vehicle not found.", nameof(id));

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync(ct);
    }
}
