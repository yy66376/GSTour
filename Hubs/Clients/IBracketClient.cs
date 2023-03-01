namespace GDTour.Hubs.Clients;

public interface IBracketClient
{
    Task ReceiveBracket(string bracketJson);
}