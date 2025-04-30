namespace SmartBooking.API.Models
{
    public class Log
    {
        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; } = default!;

        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
    }
}
