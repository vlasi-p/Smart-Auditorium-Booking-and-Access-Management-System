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
        
        // New fields for cleanup tracking
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RejectedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        // Helper properties for cleanup logic
        public bool ShouldBeDeleted
        {
            get
            {
                var now = DateTime.UtcNow;
                
                // Delete rejected reservations after 24 hours
                if (Status == "rejected" && RejectedAt.HasValue)
                {
                    return RejectedAt.Value.AddDays(1) < now;
                }
                
                // Delete completed reservations after 30 days
                if (Status == "completed" && EndTime.HasValue)
                {
                    return EndTime.Value.AddDays(30) < now;
                }
                
                return false;
            }
        }
        
        public TimeSpan? TimeUntilDeletion
        {
            get
            {
                var now = DateTime.UtcNow;
                
                if (Status == "rejected" && RejectedAt.HasValue)
                {
                    var deletionTime = RejectedAt.Value.AddDays(1);
                    return deletionTime > now ? deletionTime - now : TimeSpan.Zero;
                }
                
                if (Status == "completed" && EndTime.HasValue)
                {
                    var deletionTime = EndTime.Value.AddDays(30);
                    return deletionTime > now ? deletionTime - now : TimeSpan.Zero;
                }
                
                return null;
            }
        }
    }
}