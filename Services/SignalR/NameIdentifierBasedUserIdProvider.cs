using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace GDTour.Services.SignalR;

public class NameIdentifierBasedUserIdProvider : IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
    }
}