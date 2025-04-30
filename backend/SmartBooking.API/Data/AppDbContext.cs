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

            
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.StudentId).IsUnique();
            });

            
            modelBuilder.Entity<Auditorium>(entity =>
            {
                entity.Property(a => a.Status)
                      .HasDefaultValue("available");
            });

            
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.Property(r => r.Status)
                      .HasDefaultValue("pending");

                entity.HasIndex(r => r.SecurityCode)
                      .IsUnique();

                entity.HasOne(r => r.Student)
                      .WithMany(s => s.Reservations)
                      .HasForeignKey(r => r.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Auditorium)
                      .WithMany(a => a.Reservations)
                      .HasForeignKey(r => r.AuditoriumId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Log)
                      .WithOne(l => l.Reservation)
                      .HasForeignKey<Log>(l => l.ReservationId);
            });

            
            modelBuilder.Entity<Log>(entity =>
            {
                entity.HasKey(l => l.ReservationId); 
            });

            
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasIndex(a => a.Email).IsUnique();
            });
        }
    }
}
