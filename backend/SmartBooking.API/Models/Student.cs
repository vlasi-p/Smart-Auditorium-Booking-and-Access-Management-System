namespace SmartBooking.API.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string StudentId { get; set; } = default!;

        // Relationships
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
