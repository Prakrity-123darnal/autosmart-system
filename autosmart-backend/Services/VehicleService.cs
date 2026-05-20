using AutoSmart.API.DTOs.Vehicles;
using AutoSmart.API.Models;
using AutoSmart.API.Repositories;

namespace AutoSmart.API.Services;

public sealed class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepo;
    private readonly ICustomerRepository _customerRepo;

    public VehicleService(IVehicleRepository vehicleRepo, ICustomerRepository customerRepo)
    {
        _vehicleRepo = vehicleRepo;
        _customerRepo = customerRepo;
    }

    public async Task<VehicleResponse> CreateAsync(CreateVehicleRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.VehicleNumber))
            throw new ArgumentException("Vehicle number is required.", nameof(request));

        var make = string.IsNullOrWhiteSpace(request.Make)
            ? request.Brand.Trim()
            : request.Make.Trim();
        if (string.IsNullOrWhiteSpace(make))
            throw new ArgumentException("Make is required.", nameof(request));

        var customer = await _customerRepo.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            throw new ArgumentException("Customer not found.", nameof(request));

        var vehicle = new Vehicle
        {
            VehicleNumber = request.VehicleNumber.Trim(),
            Brand = make,
            Make = make,
            Model = request.Model?.Trim() ?? "",
            Year = request.Year > 0 ? request.Year : DateTime.UtcNow.Year,
            CustomerId = request.CustomerId
        };

        var created = await _vehicleRepo.AddAsync(vehicle, ct);
        return ToResponse(created);
    }

    public async Task<List<VehicleResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var vehicles = await _vehicleRepo.GetAllAsync(ct);
        return vehicles.Select(ToResponse).ToList();
    }

    public async Task<List<VehicleResponse>> GetByCustomerIdAsync(
        int customerId,
        CancellationToken ct = default)
    {
        var vehicles = await _vehicleRepo.GetByCustomerIdAsync(customerId, ct);
        return vehicles.Select(ToResponse).ToList();
    }

    public async Task<VehicleResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(id, ct);
        return vehicle is null ? null : ToResponse(vehicle);
    }

    public async Task<VehicleResponse?> UpdateAsync(int id, UpdateVehicleRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.VehicleNumber))
            throw new ArgumentException("Vehicle number is required.", nameof(request));

        var make = string.IsNullOrWhiteSpace(request.Make)
            ? request.Brand.Trim()
            : request.Make.Trim();
        if (string.IsNullOrWhiteSpace(make))
            throw new ArgumentException("Make is required.", nameof(request));

        var customer = await _customerRepo.GetByIdAsync(request.CustomerId, ct);
        if (customer is null)
            throw new ArgumentException("Customer not found.", nameof(request.CustomerId));

        var vehicle = await _vehicleRepo.GetByIdTrackedAsync(id, ct);
        if (vehicle is null)
            return null;

        vehicle.VehicleNumber = request.VehicleNumber.Trim();
        vehicle.Brand = make;
        vehicle.Make = make;
        vehicle.Model = request.Model?.Trim() ?? "";
        vehicle.Year = request.Year > 0 ? request.Year : vehicle.Year;
        vehicle.CustomerId = request.CustomerId;

        await _vehicleRepo.SaveChangesAsync(ct);
        return ToResponse(vehicle);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        await _vehicleRepo.DeleteAsync(id, ct);
    }

    private static VehicleResponse ToResponse(Vehicle v)
    {
        return new VehicleResponse
        {
            Id = v.Id,
            VehicleNumber = v.VehicleNumber,
            Brand = v.Brand,
            Make = string.IsNullOrEmpty(v.Make) ? v.Brand : v.Make,
            Model = v.Model,
            Year = v.Year,
            CustomerId = v.CustomerId
        };
    }
}
