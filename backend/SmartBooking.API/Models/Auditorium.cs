namespace SmartBooking.API.Models
{
    public class Auditorium
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public int Capacity { get; set; }
        public string Status { get; set; } = "available"; // available | occupied | maintenance

        // Relationships
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
