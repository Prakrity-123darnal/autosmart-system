using Microsoft.AspNetCore.Mvc;
using AutoSmart.API.DTOs.Vendors;
using AutoSmart.API.Services;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class VendorsController : ControllerBase
{
    private readonly IVendorService _service;

    public VendorsController(IVendorService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<VendorResponse>> Create(
        [FromBody] CreateVendorRequest request,
        CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<VendorResponse>>> GetAll(CancellationToken ct)
    {
        var vendors = await _service.GetAllAsync(ct);
        return Ok(vendors);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VendorResponse>> GetById(int id, CancellationToken ct)
    {
        var vendor = await _service.GetByIdAsync(id, ct);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VendorResponse>> Update(
        int id,
        [FromBody] UpdateVendorRequest request,
        CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return Ok(updated);
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
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
