namespace SmartBooking.API.Models
{
    public class Auditorium
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
       
        public string Status { get; set; } = "available"; // available | occupied | maintenance

        
       
    }
}
