using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoSmart.API.DTOs.Customers;
using AutoSmart.API.Services;

namespace AutoSmart.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create(
        [FromBody] CreateCustomerRequest request,
        CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerResponse>>> GetAll(CancellationToken ct)
    {
        var customers = await _service.GetAllAsync(ct);
        return Ok(customers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDetailsResponse>> GetById(int id, CancellationToken ct)
    {
        var customer = await _service.GetDetailsByIdAsync(id, ct);
        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<CustomerResponse>>> Search(
        [FromQuery] string query,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CustomerResponse>> Me(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var customer = await _service.GetOrCreateByUserEmailAsync(email, ct);
        if (customer is null)
        {
            return NotFound(new
            {
                message = "No customer account found for this login. Please register as a customer or contact staff.",
            });
        }

        return Ok(customer);
    }

    [HttpGet("me/dashboard")]
    [Authorize(Roles = "customer")]
    public async Task<ActionResult<CustomerDashboardResponse>> MyDashboard(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var profile = await _service.GetOrCreateByUserEmailAsync(email, ct);
        if (profile is null)
        {
            return NotFound(new
            {
                message = "No customer account found for this login.",
            });
        }

        var dashboard = await _service.GetDashboardAsync(profile.Id, ct);
        return dashboard is null ? NotFound() : Ok(dashboard);
    }

    [HttpGet("me/details")]
    [Authorize(Roles = "customer")]
    public async Task<ActionResult<CustomerDetailsResponse>> MyDetails(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var profile = await _service.GetOrCreateByUserEmailAsync(email, ct);
        if (profile is null)
            return NotFound(new { message = "No customer account found for this login." });

        var details = await _service.GetDetailsByIdAsync(profile.Id, ct);
        return details is null ? NotFound() : Ok(details);
    }

    [HttpPut("me")]
    [Authorize(Roles = "customer")]
    public async Task<ActionResult<CustomerResponse>> UpdateMe(
        [FromBody] UpdateCustomerProfileRequest request,
        CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var profile = await _service.GetOrCreateByUserEmailAsync(email, ct);
        if (profile is null)
            return NotFound(new { message = "No customer account found for this login." });

        try
        {
            var updated = await _service.UpdateProfileAsync(profile.Id, request, ct);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("me/vehicles")]
    [Authorize(Roles = "customer")]
    public async Task<ActionResult<CustomerVehicleResponse>> AddMyVehicle(
        [FromBody] AddCustomerVehicleRequest request,
        CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var profile = await _service.GetOrCreateByUserEmailAsync(email, ct);
        if (profile is null)
            return NotFound(new { message = "No customer account found for this login." });

        try
        {
            var vehicle = await _service.AddVehicleAsync(profile.Id, request, ct);
            return Ok(vehicle);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("with-vehicle")]
    public async Task<ActionResult<CustomerResponse>> CreateWithVehicle(
        [FromBody] CreateCustomerWithVehicleRequest request,
        CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateWithVehicleAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

