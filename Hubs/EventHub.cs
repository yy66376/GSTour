using GDTour.Hubs.Clients;
using Microsoft.AspNetCore.SignalR;

namespace GDTour.Hubs;

public class EventHub : Hub<IEventClient>
{
    public async Task SubscribeToEvent(int eventId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"event-{eventId}");
    }
}