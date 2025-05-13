using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;

namespace SmartBooking.API.Controllers
{
    [ApiController]
    [Route("auditoriums")]
    public class AuditoriumsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditoriumsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/auditoriums/available
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableAuditoriums()
        {
            var availableAuditoriums = await _context.Auditoriums
                .Where(a => a.Status.ToLower() == "available")
                .ToListAsync();

            return Ok(availableAuditoriums);
        }
    }
}
