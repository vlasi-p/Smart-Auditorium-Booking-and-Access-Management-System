using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Models;

namespace SmartBooking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Student> Students { get; set; }
        public DbSet<Auditorium> Auditoriums { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<Admin> Admins { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Student entity
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.Email).IsRequired();
                
                entity.Property(e => e.Phone).IsRequired(false);
                entity.Property(e => e.PrivateNumber).IsRequired(false);
            });

            // Configure Reservation entity
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.AuditoriumId).IsRequired();
                entity.Property(e => e.AuditoriumName).IsRequired();
                entity.Property(e => e.StartTime).IsRequired();
                entity.Property(e => e.EndTime).IsRequired(false);
                entity.Property(e => e.Status).IsRequired().HasDefaultValue("pending");
                entity.Property(e => e.SecurityCode).IsRequired(false);

                // Relationship with Auditorium
                entity.HasOne<Auditorium>()
                      .WithMany()
                      .HasForeignKey(r => r.AuditoriumId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Log entity
            modelBuilder.Entity<Log>(entity =>
            {
                entity.HasKey(e => e.ReservationId);
                entity.Property(e => e.CheckInTime).IsRequired(false);
                entity.Property(e => e.CheckOutTime).IsRequired(false);

                // Relationship with Reservation (1:1)
                entity.HasOne(l => l.Reservation)
                      .WithOne()
                      .HasForeignKey<Log>(l => l.ReservationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Auditorium entity
            modelBuilder.Entity<Auditorium>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasDefaultValue("available");
            });

            // Configure Admin entity
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Email).IsRequired();
            });
        }
    }
    
}
