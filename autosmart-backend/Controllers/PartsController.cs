using Microsoft.AspNetCore.Mvc;
using AutoSmart.API.DTOs.Parts;
using AutoSmart.API.Services;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PartsController : ControllerBase
{
    private readonly IPartService _service;

    public PartsController(IPartService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<PartResponse>> Create(
        [FromBody] CreatePartRequest request,
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
    public async Task<ActionResult<List<PartResponse>>> GetAll(CancellationToken ct)
    {
        var parts = await _service.GetAllAsync(ct);
        return Ok(parts);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PartResponse>> GetById(int id, CancellationToken ct)
    {
        var part = await _service.GetByIdAsync(id, ct);
        return part is null ? NotFound() : Ok(part);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PartResponse>> Update(
        int id,
        [FromBody] UpdatePartRequest request,
        CancellationToken ct)
    {
        try
        {
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
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
