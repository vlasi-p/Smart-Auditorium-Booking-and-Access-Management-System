using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;

using System.Threading.Tasks;

namespace SmartBooking.API.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly OtpService _otpService;
        private readonly JwtService _jwtService;
        private readonly AppDbContext _dbContext;
        private readonly EmailService _emailService;

        public AuthController(
            OtpService otpService,
            JwtService jwtService,
            AppDbContext dbContext,
            EmailService emailService)
        {
            _otpService = otpService;
            _jwtService = jwtService;
            _dbContext = dbContext;
            _emailService = emailService;
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] RequestOtpDto request)
        {
            if (string.IsNullOrEmpty(request.Email) ||
                !request.Email.EndsWith("@kiu.edu.ge", System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Invalid university email address.");
            }

            // 1) Try Admins
            var admin = await _dbContext.Admins
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email == request.Email);

            // 2) If not admin, try Students
            var student = admin == null
                ? await _dbContext.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Email == request.Email)
                : null;

            if (admin == null && student == null)
                return BadRequest("Email not found in the system.");

            // 3) Generate and send OTP
            var otp = _otpService.GenerateOtp(request.Email);
            string subject = "Your SmartBooking OTP Code";
            string body = $"Your one-time login code is: {otp}";

            await _emailService.SendEmailAsync(request.Email, subject, body);

            return Ok(new { message = "OTP sent successfully." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            // 1) Validate OTP
            if (!_otpService.VerifyOtp(request.Email, request.Otp))
                return Unauthorized(new { message = "Invalid OTP." });

            _otpService.RemoveOtp(request.Email);

            // 2) Lookup Admin first
            var admin = await _dbContext.Admins
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email == request.Email);

            // 3) If not admin, lookup student
            var student = admin == null
                ? await _dbContext.Students
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Email == request.Email)
                : null;

            if (admin == null && student == null)
                return Unauthorized(new { message = "User not found after OTP verification." });

            // 4) Determine user type and build token
            bool isAdmin = admin != null;
            int userId = isAdmin ? admin.Id : student!.Id;
            string email = isAdmin ? admin.Email : student!.Email;
            string firstName = isAdmin ? "" : student!.Name;
            string lastName = isAdmin ? "" : student!.LastName;

            var token = _jwtService.GenerateToken(userId, email, isAdmin);

            return Ok(new { token });
        }
    }
}
