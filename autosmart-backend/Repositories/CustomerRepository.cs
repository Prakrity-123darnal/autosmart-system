using Microsoft.EntityFrameworkCore;
using AutoSmart.API.Data;
using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public sealed class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _db;

    public CustomerRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Customer> AddAsync(Customer customer, CancellationToken ct = default)
    {
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);
        return customer;
    }

    public Task<List<Customer>> GetAllAsync(CancellationToken ct = default)
    {
        return _db.Customers
            .AsNoTracking()
            .OrderByDescending(c => c.Id)
            .ToListAsync(ct);
    }

    public Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public Task<Customer?> GetByIdWithVehiclesAsync(int id, CancellationToken ct = default)
    {
        return _db.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public Task<Customer?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default)
    {
        return _db.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles)
            .Include(c => c.SalesInvoices)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public Task<List<Customer>> SearchAsync(string query, CancellationToken ct = default)
    {
        var normalized = query.Trim().ToLower();
        int.TryParse(normalized, out var idQuery);

        return _db.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles)
            .Where(c =>
                c.Name.ToLower().Contains(normalized) ||
                c.Phone.ToLower().Contains(normalized) ||
                c.Email.ToLower().Contains(normalized) ||
                (idQuery > 0 && c.Id == idQuery) ||
                c.Vehicles.Any(v => v.VehicleNumber.ToLower().Contains(normalized)))
            .OrderByDescending(c => c.Id)
            .ToListAsync(ct);
    }

    public Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLower();
        return _db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Email.ToLower() == normalized, ct);
    }
}