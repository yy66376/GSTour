using GDTour.Hubs.Clients;
using GDTour.Models.Utility;
using Microsoft.AspNetCore.SignalR;

namespace GDTour.Hubs;

public class NotificationHub : Hub<INotificationClient>
{
}