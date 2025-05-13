namespace SmartBooking.API.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class CreateReservationDto
    {
        [Required]
        public int AuditoriumId { get; set; }

        [Required]
        public string AuditoriumName { get; set; } = default!;

        [Required]
        public string FirstName { get; set; } = default!;

        [Required]
        public string LastName { get; set; } = default!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        public string Phone { get; set; } = default!;

        [Required]
        public string PrivateNumber { get; set; } = default!;

        [Required]
        public string Signature { get; set; } = default!;

        [Required]
        public DateTime StartTime { get; set; } = DateTime.Now;
    }


}
