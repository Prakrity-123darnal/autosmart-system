namespace AutoSmart.API.DTOs.Notifications;

public sealed class NotificationItemDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // alert | warning | info | success
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public bool Read { get; set; }
}

