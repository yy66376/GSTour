using GDTour.Models.Utility;

namespace GDTour.Hubs.Clients;

public interface INotificationClient
{
    Task ReceiveNotification(AlertDetailDTO alert);
    Task DeleteNotification(int alertId, bool isFulfilled);
    Task EditNotification(int alertId, bool isFulfilled, bool email, bool browser, decimal priceThreshold);
    Task ReadNotification(int alertId);
}