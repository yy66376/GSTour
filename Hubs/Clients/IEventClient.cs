namespace GDTour.Hubs.Clients;

public interface IEventClient
{
    Task ReceiveParticipant(string participantName);
}