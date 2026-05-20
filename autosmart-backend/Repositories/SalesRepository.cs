using AutoSmart.API.Data;
using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public sealed class SalesRepository : ISalesRepository
{
    private readonly AppDbContext _db;

    public SalesRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SalesInvoice> AddAsync(SalesInvoice invoice, CancellationToken ct = default)
    {
        _db.SalesInvoices.Add(invoice);
        await _db.SaveChangesAsync(ct);
        return invoice;
    }
}
