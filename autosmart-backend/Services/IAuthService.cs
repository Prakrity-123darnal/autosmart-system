using AutoSmart.API.DTOs.Auth;

namespace AutoSmart.API.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task LogoutAsync(string token, CancellationToken ct);
    Task<bool> ValidateTokenAsync(string token, CancellationToken ct);
}
