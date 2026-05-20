using System.Security.Claims;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Vehicles;
using AutoSmart.API.Helpers;
using AutoSmart.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class VehiclesController : ControllerBase
{
    private readonly IVehicleService _service;
    private readonly AppDbContext _db;

    public VehiclesController(IVehicleService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult<VehicleResponse>> Create(
        [FromBody] CreateVehicleRequest request,
        CancellationToken ct)
    {
        try
        {
            if (!CustomerUserHelper.IsStaff(User))
            {
                var ownId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
                if (ownId is null)
                    return BadRequest(new { message = "No customer profile found." });
                request.CustomerId = ownId.Value;
            }

            var created = await _service.CreateAsync(request, ct);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<VehicleResponse>>> GetAll(CancellationToken ct)
    {
        if (!CustomerUserHelper.IsStaff(User))
        {
            var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
            if (customerId is null)
                return Ok(new List<VehicleResponse>());

            var own = await _service.GetByCustomerIdAsync(customerId.Value, ct);
            return Ok(own);
        }

        var vehicles = await _service.GetAllAsync(ct);
        return Ok(vehicles);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehicleResponse>> GetById(int id, CancellationToken ct)
    {
        var vehicle = await _service.GetByIdAsync(id, ct);
        if (vehicle is null)
            return NotFound();

        if (!await CanAccessVehicleAsync(vehicle.CustomerId, ct))
            return Forbid();

        return Ok(vehicle);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VehicleResponse>> Update(
        int id,
        [FromBody] UpdateVehicleRequest request,
        CancellationToken ct)
    {
        try
        {
            var existing = await _service.GetByIdAsync(id, ct);
            if (existing is null)
                return NotFound();

            if (!await CanAccessVehicleAsync(existing.CustomerId, ct))
                return Forbid();

            if (!CustomerUserHelper.IsStaff(User))
                request.CustomerId = existing.CustomerId;

            var updated = await _service.UpdateAsync(id, request, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, CancellationToken ct)
    {
        try
        {
            var existing = await _service.GetByIdAsync(id, ct);
            if (existing is null)
                return NotFound();

            if (!await CanAccessVehicleAsync(existing.CustomerId, ct))
                return Forbid();

            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private async Task<bool> CanAccessVehicleAsync(int vehicleCustomerId, CancellationToken ct)
    {
        if (CustomerUserHelper.IsStaff(User))
            return true;

        var customerId = await CustomerUserHelper.GetCustomerIdAsync(User, _db, ct);
        return customerId is not null && customerId.Value == vehicleCustomerId;
    }
}
