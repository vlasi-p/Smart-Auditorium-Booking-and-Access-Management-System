using System.Collections.Concurrent;

public class OtpService
{
    private readonly ConcurrentDictionary<string, string> _otpStorage = new();

    public string GenerateOtp(string email)
    {
        var random = new Random();
        var otp = random.Next(100000, 999999).ToString(); // 6-digit OTP

        _otpStorage[email] = otp; // Save OTP against email
        return otp;
    }

    public bool VerifyOtp(string email, string otp)
    {
        return _otpStorage.TryGetValue(email, out var storedOtp) && storedOtp == otp;
    }

    public void RemoveOtp(string email)
    {
        _otpStorage.TryRemove(email, out _);
    }
}
