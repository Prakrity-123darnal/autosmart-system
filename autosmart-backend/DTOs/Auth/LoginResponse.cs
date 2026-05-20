using System.ComponentModel.DataAnnotations;

namespace AutoSmart.API.DTOs.Auth;

public class LoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserResponse? User { get; set; }
    public string? Token { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class LogoutRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
}
