using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public interface ISalesRepository
{
    Task<SalesInvoice> AddAsync(SalesInvoice invoice, CancellationToken ct = default);
}
