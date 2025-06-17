using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;
using SmartBooking.API.DTOs;
using SmartBooking.API.Models;
using System.Threading.Tasks;

namespace SmartBooking.API.Controllers
{
    [ApiController]
    [Route("reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("request-reservation")]
        public async Task<ActionResult<Reservation>> CreateReservationAsync([FromBody] CreateReservationDto dto)
        {
            var georgianTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Georgian Standard Time");

            // Convert incoming UTC StartTime to Georgian Time (if needed)
            var localStartTime = TimeZoneInfo.ConvertTimeFromUtc(dto.StartTime.ToUniversalTime(), georgianTimeZone);

            var reservation = new Reservation
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                AuditoriumId = dto.AuditoriumId,
                AuditoriumName = dto.AuditoriumName,
                Email = dto.Email,
                StartTime = localStartTime,
                Status = "pending",
                SecurityCode = GenerateSecurityCode(),
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();

            return reservation;
        }
        [HttpGet("by-email/{email}")]
        public async Task<ActionResult<Reservation[]>> GetByEmail(string email)
        {
            var reservations = await _context.Reservations
                .Where(r => r.Email == email && r.Status == "approved")
                .OrderByDescending(r => r.StartTime)
                .ToArrayAsync();

            return Ok(reservations);
        }


        private string GenerateSecurityCode()
        {
            return Guid.NewGuid().ToString("N")[..6].ToUpper();
        }
        [HttpPost("checkout/{reservationId}")]
        public async Task<ActionResult> Checkout(int reservationId)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if (reservation == null)
                return NotFound("Reservation not found.");

            if (reservation.Status != "approved")
                return BadRequest("Only approved reservations can be checked out.");

            // Update end time
            reservation.EndTime = DateTime.Now;
            reservation.Status = "completed";

            // Update auditorium status if you track it
            var auditorium = await _context.Auditoriums.FindAsync(reservation.AuditoriumId);
            if (auditorium != null)
            {
                auditorium.Status = "available";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Checkout successful.",
                EndTime = reservation.EndTime
            });
        }

    }
}
