using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using AutoSmart.API.Data;
using AutoSmart.API.DTOs.Auth;
using AutoSmart.API.Models;

namespace AutoSmart.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == request.Email.ToLower() &&
                    u.Password == request.Password, ct);

            if (user == null)
                return new LoginResponse { Success = false, Message = "Invalid email or password" };

            if (user.Role.ToLower() != request.Role.ToLower())
                return new LoginResponse { Success = false, Message = $"Access denied. User is {user.Role} but trying to login as {request.Role}" };

            if (user.Role.Equals("customer", StringComparison.OrdinalIgnoreCase))
            {
                var hasCustomer = await _context.Customers
                    .AnyAsync(c => c.Email.ToLower() == user.Email.ToLower(), ct);

                if (!hasCustomer)
                {
                    _context.Customers.Add(new Customer
                    {
                        Name = user.Name,
                        Email = user.Email,
                        Phone = user.Phone,
                    });
                    await _context.SaveChangesAsync(ct);
                }
            }

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }
        catch (Exception)
        {
            return new LoginResponse { Success = false, Message = "Login failed" };
        }
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        try
        {
            var exists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), ct);

            if (exists)
                return new LoginResponse { Success = false, Message = "Email already exists" };

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = request.Password,
                Phone = request.Phone ?? string.Empty,
                Role = request.Role?.ToLower() ?? "customer",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(ct);

            if (user.Role.Equals("customer", StringComparison.OrdinalIgnoreCase))
            {
                var hasCustomer = await _context.Customers
                    .AnyAsync(c => c.Email.ToLower() == user.Email.ToLower(), ct);

                if (!hasCustomer)
                {
                    _context.Customers.Add(new Customer
                    {
                        Name = user.Name,
                        Email = user.Email,
                        Phone = user.Phone,
                    });
                    await _context.SaveChangesAsync(ct);
                }
            }

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Success = true,
                Message = "Registration successful",
                Token = token,
                User = new UserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }
        catch (Exception ex)
        {
            return new LoginResponse
            {
                Success = false,
                Message = $"Registration failed: {ex.InnerException?.Message ?? ex.Message}"
            };
        }
    }

    public async Task LogoutAsync(string token, CancellationToken ct)
    {
        await Task.CompletedTask;
    }

    public async Task<bool> ValidateTokenAsync(string token, CancellationToken ct)
    {
        await Task.CompletedTask;
        return !string.IsNullOrWhiteSpace(token);
    }

    private string GenerateJwtToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "defaultkey");
        var issuer = _configuration["Jwt:Issuer"] ?? "autosmart";
        var audience = _configuration["Jwt:Audience"] ?? "autosmart";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}