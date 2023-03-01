using GDTour.Hubs.Clients;
using Microsoft.AspNetCore.SignalR;

namespace GDTour.Hubs;

public class BracketHub : Hub<IBracketClient>
{
    public async Task SubscribeToBracket(int eventId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"bracket-{eventId}");
    }
}