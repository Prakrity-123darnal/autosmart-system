using AutoSmart.API.DTOs.Sales;

namespace AutoSmart.API.Services;

public interface ISalesService
{
    Task<SalesInvoiceResponse> CreateAsync(CreateSalesInvoiceRequest request, CancellationToken ct = default);
    Task<List<SalesInvoiceResponse>> GetAllAsync(CancellationToken ct = default);
    Task<SalesInvoiceResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SalesInvoiceResponse?> UpdateAsync(int id, UpdateSalesInvoiceRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
