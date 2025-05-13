using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Models;
using System.Threading.Tasks;

namespace SmartBooking.API.Controllers
{
    [Route("admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public AdminController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("decide-reservation")]
        public async Task<IActionResult> DecideReservation([FromBody] AdminDecisionDto dto)
        {
            var reservation = await _context.Reservations.FindAsync(dto.ReservationId);
            if (reservation == null)
                return NotFound("Reservation not found.");

            if (reservation.Status != "pending")
                return BadRequest("Only pending reservations can be modified.");

            string decision = dto.Decision.ToLower();
            string subject, message;

            if (decision == "approve")
            {
                reservation.Status = "approved";
                subject = "Reservation Approved";
                message = $"Your reservation for auditorium {reservation.AuditoriumName} at {reservation.StartTime} has been approved.\nConfirmation Code: {reservation.SecurityCode}";

                // Update auditorium status
                var auditorium = await _context.Auditoriums.FindAsync(reservation.AuditoriumId);
                if (auditorium != null)
                {
                    auditorium.Status = "reserved"; // or "busy"
                }
            }
            else if (decision == "reject")
            {
                reservation.Status = "rejected";
                subject = "Reservation Rejected";
                message = $"Your reservation for auditorium {reservation.AuditoriumName} at {reservation.StartTime} has been rejected.";
            }
            else
            {
                return BadRequest("Invalid decision. Use 'approve' or 'reject'.");
            }

            await _context.SaveChangesAsync();
            await _emailService.SendEmailAsync(reservation.Email, subject, message);

            return Ok(new
            {
                Message = $"Reservation {decision}d successfully and email sent to {reservation.Email}."
            });
        }

        [HttpGet("all-reservations")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetAllReservations()
        {
            var reservations = await _context.Reservations
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();

            return Ok(reservations);
        }

    }
}
