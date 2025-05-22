using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public interface IJwtService
{
    string GenerateToken(int userId, string email, bool isAdmin);
}

public class JwtService : IJwtService
{
    private readonly string _secretKey;
    private readonly string _issuer;

    public JwtService(IConfiguration config)
    {
        _secretKey = config["Jwt:Key"]
            ?? throw new ArgumentNullException(nameof(config), "JWT Key not configured.");
        _issuer = config["Jwt:Issuer"]
            ?? throw new ArgumentNullException(nameof(config), "JWT Issuer not configured.");
    }

    /// <summary>
    /// Generates a JWT containing:
    ///  - sub (NameIdentifier): userId
    ///  - email: user's email
    ///  - user: "admin" or "student"
    ///  - jti: unique token identifier
    /// </summary>
    public string GenerateToken(int userId, string email, bool isAdmin)
    {
        // 1) Define claims
        var claims = new[]
        {
                new Claim(JwtRegisteredClaimNames.Sub,      userId.ToString()),
                new Claim(ClaimTypes.NameIdentifier,        userId.ToString()),
                new Claim(ClaimTypes.Email,                 email),
                new Claim("user",                           isAdmin ? "admin" : "student"),
                new Claim(JwtRegisteredClaimNames.Jti,      Guid.NewGuid().ToString())
            };

        // 2) Create signing credentials
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 3) Create token
        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _issuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        // 4) Return serialized token
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}