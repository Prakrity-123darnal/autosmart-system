using AutoSmart.API.Models;

namespace AutoSmart.API.Repositories;

public interface ICustomerRepository
{
    Task<Customer> AddAsync(Customer customer, CancellationToken ct = default);
    Task<List<Customer>> GetAllAsync(CancellationToken ct = default);
    Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Customer?> GetByIdWithVehiclesAsync(int id, CancellationToken ct = default);
    Task<Customer?> GetByIdWithDetailsAsync(int id, CancellationToken ct = default);
    Task<List<Customer>> SearchAsync(string query, CancellationToken ct = default);
    Task<Customer?> GetByEmailAsync(string email, CancellationToken ct = default);
}

