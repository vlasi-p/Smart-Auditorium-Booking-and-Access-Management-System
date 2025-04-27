// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("auth")]


public class AuthController : ControllerBase
{
    private readonly OtpService _otpService;
    private readonly JwtService _jwtService;

    public AuthController(OtpService otpService, JwtService jwtService)
    {
        _otpService = otpService;
        _jwtService = jwtService;
    }

    [HttpPost("request-otp")]
    public IActionResult RequestOtp([FromBody] RequestOtpDto request)
    {
        if (string.IsNullOrEmpty(request.Email) || !request.Email.EndsWith("@kiu.edu.ge"))
        {
            return BadRequest("Invalid university email address.");
        }

        var otp = _otpService.GenerateOtp(request.Email);

        // For now, just print it in the console
        Console.WriteLine($"Generated OTP for {request.Email}: {otp}");

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
