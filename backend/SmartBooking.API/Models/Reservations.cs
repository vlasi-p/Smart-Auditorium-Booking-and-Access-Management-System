namespace SmartBooking.API.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public Student Student { get; set; } = default!;

        public int AuditoriumId { get; set; }
        public Auditorium Auditorium { get; set; } = default!;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "pending"; // pending | approved | rejected | completed
        public string? SecurityCode { get; set; }

        // Relationships
        public Log? Log { get; set; }
    }
}
