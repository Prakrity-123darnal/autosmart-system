using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Customers;
using AutoSmart.API.Models;
using AutoSmart.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Services;

public sealed class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repo;
    private readonly AppDbContext _db;

    public CustomerService(ICustomerRepository repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone is required.", nameof(request));

        var customer = new Customer
        {
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim() ?? string.Empty,
        };

        var created = await _repo.AddAsync(customer, ct);
        return ToResponse(created);
    }

    public async Task<CustomerResponse> CreateWithVehicleAsync(
        CreateCustomerWithVehicleRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.VehicleNumber))
            throw new ArgumentException("Vehicle number is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Make))
            throw new ArgumentException("Make is required.", nameof(request));

        var make = request.Make.Trim();

        var customer = new Customer
        {
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim() ?? string.Empty,
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);

        var vehicle = new Vehicle
        {
            CustomerId = customer.Id,
            VehicleNumber = request.VehicleNumber.Trim(),
            Make = make,
            Model = request.Model?.Trim() ?? "",
            Year = request.Year > 0 ? request.Year : DateTime.UtcNow.Year,
            Brand = make,
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync(ct);

        return ToResponse(customer);
    }

    public async Task<List<CustomerResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var customers = await _repo.GetAllAsync(ct);
        return customers.Select(ToResponse).ToList();
    }

    public async Task<CustomerResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var customer = await _repo.GetByIdAsync(id, ct);
        return customer is null ? null : ToResponse(customer);
    }

    public async Task<CustomerDetailsResponse?> GetDetailsByIdAsync(int id, CancellationToken ct = default)
    {
        var customer = await _repo.GetByIdWithDetailsAsync(id, ct);
        if (customer is null)
            return null;

        return new CustomerDetailsResponse
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Vehicles = customer.Vehicles.Select(v => new CustomerVehicleResponse
            {
                Id = v.Id,
                VehicleNumber = v.VehicleNumber,
                Brand = v.Brand,
                Make = string.IsNullOrEmpty(v.Make) ? v.Brand : v.Make,
                Model = v.Model,
                Year = v.Year,
            }).ToList(),
            PurchaseHistory = customer.SalesInvoices
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new CustomerPurchaseResponse
                {
                    InvoiceId = i.Id,
                    TotalAmount = i.TotalAmount,
                    IsPaid = i.IsPaid,
                    CreatedAt = i.CreatedAt,
                }).ToList(),
        };
    }

    public async Task<List<CustomerResponse>> SearchAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<CustomerResponse>();

        var customers = await _repo.SearchAsync(query, ct);
        return customers.Select(ToResponse).ToList();
    }

    public async Task<CustomerResponse?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        var customer = await _repo.GetByEmailAsync(email, ct);
        return customer is null ? null : ToResponse(customer);
    }

    public async Task<CustomerResponse?> GetOrCreateByUserEmailAsync(
        string email,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        var existing = await GetByEmailAsync(email, ct);
        if (existing is not null)
            return existing;

        var normalized = email.Trim().ToLower();
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Email.ToLower() == normalized &&
                     u.Role.ToLower() == "customer",
                ct);

        if (user is null)
            return null;

        var customer = new Customer
        {
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);

        return ToResponse(customer);
    }

    public async Task<CustomerDashboardResponse?> GetDashboardAsync(
        int customerId,
        CancellationToken ct = default)
    {
        var customer = await _repo.GetByIdWithDetailsAsync(customerId, ct);
        if (customer is null)
            return null;

        var now = DateTime.UtcNow;

        var appointments = await _db.Appointments
            .AsNoTracking()
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync(ct);

        var upcoming = appointments
            .Where(a =>
                a.AppointmentDate >= now &&
                a.Status != "cancelled" &&
                a.Status != "completed")
            .OrderBy(a => a.AppointmentDate)
            .Select(a => new CustomerAppointmentSummary
            {
                Id = a.Id,
                ServiceType = a.ServiceType,
                AppointmentDate = a.AppointmentDate,
                Status = a.Status,
            })
            .ToList();

        var purchaseHistory = customer.SalesInvoices
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new CustomerPurchaseResponse
            {
                InvoiceId = i.Id,
                TotalAmount = i.TotalAmount,
                IsPaid = i.IsPaid,
                CreatedAt = i.CreatedAt,
            })
            .ToList();

        var pendingPayments = customer.SalesInvoices
            .Where(i => !i.IsPaid)
            .Sum(i => i.TotalAmount);

        var serviceHistory = new List<CustomerServiceHistoryItem>();

        foreach (var appt in appointments.Where(a => a.Status == "completed"))
        {
            serviceHistory.Add(new CustomerServiceHistoryItem
            {
                Title = appt.ServiceType,
                Date = appt.AppointmentDate,
                Type = "service",
            });
        }

        foreach (var invoice in customer.SalesInvoices)
        {
            serviceHistory.Add(new CustomerServiceHistoryItem
            {
                Title = $"Parts purchase (Invoice #{invoice.Id})",
                Date = invoice.CreatedAt,
                Amount = invoice.TotalAmount,
                Type = "purchase",
            });
        }

        serviceHistory = serviceHistory
            .OrderByDescending(s => s.Date)
            .Take(15)
            .ToList();

        var notificationCount =
            customer.SalesInvoices.Count(i => !i.IsPaid) + upcoming.Count;

        return new CustomerDashboardResponse
        {
            CustomerId = customer.Id,
            Name = customer.Name,
            Vehicles = customer.Vehicles.Select(v => new CustomerVehicleResponse
            {
                Id = v.Id,
                VehicleNumber = v.VehicleNumber,
                Brand = v.Brand,
                Make = string.IsNullOrEmpty(v.Make) ? v.Brand : v.Make,
                Model = v.Model,
                Year = v.Year,
            }).ToList(),
            PurchaseHistory = purchaseHistory,
            UpcomingAppointments = upcoming,
            ServiceHistory = serviceHistory,
            Stats = new CustomerDashboardStats
            {
                VehicleCount = customer.Vehicles.Count,
                UpcomingAppointments = upcoming.Count,
                PendingPayments = pendingPayments,
                NotificationCount = notificationCount,
            },
        };
    }

    public async Task<CustomerResponse> UpdateProfileAsync(
        int customerId,
        UpdateCustomerProfileRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone is required.", nameof(request));

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == customerId, ct)
            ?? throw new ArgumentException("Customer not found.");

        var previousEmail = customer.Email;
        var newEmail = request.Email?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(newEmail))
        {
            var emailTaken = await _db.Customers.AnyAsync(
                c => c.Id != customerId && c.Email.ToLower() == newEmail.ToLower(),
                ct);
            if (emailTaken)
                throw new ArgumentException("Email is already used by another customer.");

            var userTaken = await _db.Users.AnyAsync(
                u => u.Email.ToLower() == newEmail.ToLower() &&
                     u.Email.ToLower() != customer.Email.ToLower(),
                ct);
            if (userTaken)
                throw new ArgumentException("Email is already used by another account.");
        }

        customer.Name = request.Name.Trim();
        customer.Phone = request.Phone.Trim();
        customer.Email = newEmail;

        var user = await _db.Users.FirstOrDefaultAsync(
            u => u.Email.ToLower() == previousEmail.ToLower(),
            ct);

        if (user is not null)
        {
            user.Name = customer.Name;
            user.Phone = customer.Phone;
            if (!string.IsNullOrWhiteSpace(newEmail))
                user.Email = newEmail;
        }

        await _db.SaveChangesAsync(ct);
        return ToResponse(customer);
    }

    public async Task<CustomerVehicleResponse> AddVehicleAsync(
        int customerId,
        AddCustomerVehicleRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.VehicleNumber))
            throw new ArgumentException("Vehicle number is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Make))
            throw new ArgumentException("Make is required.", nameof(request));

        var customer = await _repo.GetByIdAsync(customerId, ct)
            ?? throw new ArgumentException("Customer not found.");

        var make = request.Make.Trim();
        var vehicle = new Vehicle
        {
            CustomerId = customer.Id,
            VehicleNumber = request.VehicleNumber.Trim(),
            Make = make,
            Model = request.Model?.Trim() ?? "",
            Year = request.Year > 0 ? request.Year : DateTime.UtcNow.Year,
            Brand = make,
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync(ct);

        return new CustomerVehicleResponse
        {
            Id = vehicle.Id,
            VehicleNumber = vehicle.VehicleNumber,
            Brand = vehicle.Brand,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Year = vehicle.Year,
        };
    }

    private static CustomerResponse ToResponse(Customer c)
    {
        return new CustomerResponse
        {
            Id = c.Id,
            Name = c.Name,
            Phone = c.Phone,
            Email = c.Email,
        };
    }
}
