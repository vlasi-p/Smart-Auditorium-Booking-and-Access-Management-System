using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

public class EmailService
{
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;

    public EmailService(string smtpServer, int smtpPort, string smtpUser, string smtpPass, string fromEmail)
    {
        _smtpServer = smtpServer;
        _smtpPort = smtpPort;
        _smtpUser = smtpUser;
        _smtpPass = smtpPass;
        _fromEmail = fromEmail;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress("Smart Auditorium System", _fromEmail));
        emailMessage.To.Add(new MailboxAddress("User", toEmail));
        emailMessage.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            TextBody = body // OTP message
        };

        emailMessage.Body = bodyBuilder.ToMessageBody();

        using (var client = new SmtpClient())
        {
            await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPass);
            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);
        }
    }
}
