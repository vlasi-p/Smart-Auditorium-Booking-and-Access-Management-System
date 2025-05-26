using Microsoft.EntityFrameworkCore;
using SmartBooking.API.Data;

namespace SmartBooking.API.Services
{
    public class ReservationCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReservationCleanupService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(1); // Run every hour

        public ReservationCleanupService(
            IServiceProvider serviceProvider,
            ILogger<ReservationCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reservation cleanup service started");

            using var timer = new PeriodicTimer(_period);
            
            while (!stoppingToken.IsCancellationRequested &&
                   await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    await CleanupOldReservations();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during reservation cleanup");
                }
            }
        }

        private async Task CleanupOldReservations()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = DateTime.UtcNow;
            var oneDayAgo = now.AddDays(-1);
            var oneMonthAgo = now.AddDays(-30);

            // Find reservations to delete
            var rejectedToDelete = await context.Reservations
                .Where(r => r.Status == "rejected" && 
                           r.RejectedAt.HasValue && 
                           r.RejectedAt.Value < oneDayAgo)
                .ToListAsync();

            var completedToDelete = await context.Reservations
                .Where(r => r.Status == "completed" && 
                           r.EndTime.HasValue && 
                           r.EndTime.Value < oneMonthAgo)
                .ToListAsync();

            var totalToDelete = rejectedToDelete.Count + completedToDelete.Count;

            if (totalToDelete > 0)
            {
                _logger.LogInformation($"Cleaning up {rejectedToDelete.Count} rejected and {completedToDelete.Count} completed reservations");

                // Delete the reservations
                context.Reservations.RemoveRange(rejectedToDelete);
                context.Reservations.RemoveRange(completedToDelete);
                
                await context.SaveChangesAsync();

                _logger.LogInformation($"Successfully deleted {totalToDelete} old reservations");
            }
            else
            {
                _logger.LogDebug("No reservations to clean up");
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reservation cleanup service is stopping");
            await base.StopAsync(stoppingToken);
        }
    }
}