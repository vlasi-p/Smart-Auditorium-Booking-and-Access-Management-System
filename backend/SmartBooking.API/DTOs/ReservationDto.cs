namespace SmartBooking.API.DTOs
{
    public class ReservationDto
    {
        public int AuditoriumId { get; set; }
        public int StudentId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

}
