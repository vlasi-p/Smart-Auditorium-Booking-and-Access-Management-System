namespace SmartBooking.API.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        public required string FirstName { get; set; }
       public required string LastName { get; set; }
        public int AuditoriumId { get; set; }
        public required string AuditoriumName { get; set; }
        public string Email { get; set; }
        public DateTime StartTime { get; set; } = DateTime.Now;
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "pending"; // pending | approved | rejected | completed
        public string? SecurityCode { get; set; }

        
    }
}
