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
                // Set rejection timestamp for cleanup tracking
                reservation.RejectedAt = DateTime.UtcNow;
                
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
            // Clean up old reservations before returning data
            await CleanupOldReservations();

            var reservations = await _context.Reservations
                .OrderByDescending(r => r.StartTime)
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpPost("cleanup-old-reservations")]
        public async Task<IActionResult> CleanupOldReservations()
        {
            var now = DateTime.UtcNow;
            var oneDayAgo = now.AddDays(-1);
            var oneMonthAgo = now.AddDays(-30);

            // Delete rejected reservations older than 24 hours
            var rejectedToDelete = await _context.Reservations
                .Where(r => r.Status == "rejected" && 
                           r.RejectedAt.HasValue && 
                           r.RejectedAt.Value < oneDayAgo)
                .ToListAsync();

            // Delete completed reservations older than 30 days
            var completedToDelete = await _context.Reservations
                .Where(r => r.Status == "completed" && 
                           r.EndTime.HasValue && 
                           r.EndTime.Value < oneMonthAgo)
                .ToListAsync();

            var totalDeleted = rejectedToDelete.Count + completedToDelete.Count;

            if (totalDeleted > 0)
            {
                _context.Reservations.RemoveRange(rejectedToDelete);
                _context.Reservations.RemoveRange(completedToDelete);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Message = $"Cleanup completed. Deleted {rejectedToDelete.Count} rejected reservations and {completedToDelete.Count} completed reservations.",
                RejectedDeleted = rejectedToDelete.Count,
                CompletedDeleted = completedToDelete.Count,
                TotalDeleted = totalDeleted
            });
        }

        [HttpGet("cleanup-status")]
        public async Task<IActionResult> GetCleanupStatus()
        {
            var now = DateTime.UtcNow;
            var oneDayAgo = now.AddDays(-1);
            var oneMonthAgo = now.AddDays(-30);

            var rejectedToDelete = await _context.Reservations
                .CountAsync(r => r.Status == "rejected" && 
                            r.RejectedAt.HasValue && 
                            r.RejectedAt.Value < oneDayAgo);

            var completedToDelete = await _context.Reservations
                .CountAsync(r => r.Status == "completed" && 
                            r.EndTime.HasValue && 
                            r.EndTime.Value < oneMonthAgo);

            var totalRejected = await _context.Reservations
                .CountAsync(r => r.Status == "rejected");

            var totalCompleted = await _context.Reservations
                .CountAsync(r => r.Status == "completed");

            return Ok(new
            {
                RejectedPendingDeletion = rejectedToDelete,
                CompletedPendingDeletion = completedToDelete,
                TotalRejected = totalRejected,
                TotalCompleted = totalCompleted,
                CleanupThresholds = new
                {
                    RejectedAfterHours = 24,
                    CompletedAfterDays = 30
                }
            });
        }
    }
}