using Microsoft.AspNetCore.Mvc;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Models;

namespace SmartBooking.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReservationsController : Controller
    {
        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationDto dto)
        {
            var reservation = new Reservation
            {
                AuditoriumId = dto.AuditoriumId,
                StudentId = dto.StudentId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation created", reservation.Id });
        }
    }
}
