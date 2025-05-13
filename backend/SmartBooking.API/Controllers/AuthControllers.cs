using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NETCore.MailKit.Core;
using SmartBooking.API.Data;
using System.Threading.Tasks;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly OtpService _otpService;
    private readonly JwtService _jwtService;
    private readonly AppDbContext _dbContext;
    private readonly EmailService _emailService; // Inject EmailService

    public AuthController(OtpService otpService, JwtService jwtService, AppDbContext dbContext, EmailService emailService)
    {
        _otpService = otpService;
        _jwtService = jwtService;
        _dbContext = dbContext;
        _emailService = emailService;
    }

    [HttpPost("request-otp")]
    public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto request)
    {
        if (string.IsNullOrEmpty(request.Email) || !request.Email.EndsWith("@kiu.edu.ge"))
        {
            return BadRequest("Invalid university email address.");
        }

        // Check if the email exists in the database
        var user = await _dbContext.Students
            .FirstOrDefaultAsync(u => u.Email == request.Email); // Assuming Users table has an Email column

        if (user == null)
        {
            return BadRequest("Email not found in the system.");
        }

        // Generate OTP if email exists
        var otp = _otpService.GenerateOtp(request.Email);

        // Send OTP to email
        string subject = "Your OTP Code";
        string body = $"Your OTP code is: {otp}";

        await _emailService.SendEmailAsync(request.Email, subject, body);

        // You can also store the OTP in memory or a database for persistence
        // _otpStorage[request.Email] = otp;

        return Ok(new { message = "OTP sent successfully." });
    }

    [HttpPost("verify-otp")]
    public IActionResult VerifyOtp([FromBody] VerifyOtpDto request)
    {
        if (!_otpService.VerifyOtp(request.Email, request.Otp))
        {
            return Unauthorized(new { message = "Invalid OTP." });
        }

        _otpService.RemoveOtp(request.Email); // Clean up OTP after successful login

        var token = _jwtService.GenerateToken(request.Email);

        return Ok(new { token });
    }
}
