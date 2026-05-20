using System.Net;
using System.Net.Mail;

namespace AutoSmart.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string body)
    {
        var host = _config["Email:Host"] ?? "smtp.gmail.com";
        var port = int.Parse(_config["Email:Port"] ?? "587");
        var username = _config["Email:Username"] ?? "";
        var password = _config["Email:Password"] ?? "";
        var from = _config["Email:From"] ?? username;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var msg = new MailMessage
        {
            From = new MailAddress(from, "AutoSmart"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        msg.To.Add(new MailAddress(toEmail, toName));
        await client.SendMailAsync(msg);
    }
}