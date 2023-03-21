using GDTour.Models.Utility;

namespace GDTour.Models.Repositories;

public interface IEventsRepository
{
    Task<Event?> GetEventByIdAsync(int id);
    Task<(IEnumerable<Event>, int)> GetEventsByNameLimitAsync(string name);

    Task<PaginatedList<Event>> GetEventsBySearchAsync(string search = "", int page = 1, string sort = "",
        int pageSize = 10, string filter = "", string? userId = null);

    Task<IEnumerable<Event>> GetAllEventsAsync();
    void DeleteEvent(Event e);
    Task AddEventAsync(Event e);
    Task SaveChangesAsync();
}