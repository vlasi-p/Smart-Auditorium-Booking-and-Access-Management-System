namespace SmartBooking.API.DTOs
{
    public class AdminDecisionDto
    {
        public int ReservationId { get; set; }
        public string Decision { get; set; } = default!; // "approve" or "reject"
    }
}
