using System.Security.Claims;
using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Models.Utility;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GDTour.Models.Repositories;

public class EventsRepository : IEventsRepository
{
    private const int SearchResultLimit = 7;
    private readonly GDTourContext _context;
    private readonly UserManager<GDTourUser> _userManager;
    private static readonly string[] AcceptableFilters = { "participating", "organized" };

    public EventsRepository(GDTourContext context, UserManager<GDTourUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IEnumerable<Event>> GetAllEventsAsync() =>
        await _context.Events.ToListAsync();

    public async Task<Event?> GetEventByIdAsync(int id) =>
        await _context.Events
            .Include(ev => ev.Organizer)
            .Include(ev => ev.Game)
            .Include(ev => ev.Participants)
            .FirstOrDefaultAsync(ev => ev.Id == id);

    public async Task<(IEnumerable<Event>, int)> GetEventsByNameLimitAsync(string name)
    {
        var eventQuery = _context.Events.Include(e => e.Game).Where(e => e.Name.Contains(name)).AsNoTracking();
        var count = await eventQuery.CountAsync();
        var events = await eventQuery.Take(SearchResultLimit).ToListAsync();
        return (events, count);
    }

    public async Task<PaginatedList<Event>> GetEventsBySearchAsync(string search = "", int page = 1, string sort = "",
        int pageSize = 10, string filter = "", string? userId = null)
    {
        var events = from e in _context.Events select e;
        
        var filterApplied = false;
        if (!string.IsNullOrEmpty(userId) && AcceptableFilters.Contains(filter))
        {
            var user = filter switch
            {
                "participating" => (await _userManager.Users
                    .Include(u => u.ParticipatingEvents)
                    .ThenInclude(e => e.Game)
                    .Include(u => u.ParticipatingEvents)
                    .ThenInclude(e => e.Organizer)
                    .FirstOrDefaultAsync(u => u.Id == userId))!,
                _ => (await _userManager.Users
                    .Include(u => u.OrganizedEvents)
                    .ThenInclude(e => e.Game)
                    .FirstOrDefaultAsync(u => u.Id == userId))!,
            };

            events = filter switch
            {
                "organized" => user.OrganizedEvents.AsQueryable(),
                _ => user.ParticipatingEvents.AsQueryable(),
            };
            filterApplied = true;
        }
        
        if (!string.IsNullOrEmpty(search))
            events = events.Where(ev => ev.Name.ToLower().Contains(search));

        events = sort switch
        {
            "name_asc" => events.OrderBy(ev => ev.Name).ThenBy(g => g.Id),
            "name_desc" => events.OrderByDescending(ev => ev.Name).ThenBy(g => g.Id),
            "date_asc" => events.OrderBy(ev => ev.Date).ThenBy(g => g.Id),
            "date_desc" => events.OrderByDescending(ev => ev.Date).ThenBy(g => g.Id),
            "creation_date_asc" => events.OrderBy(ev => ev.CreationDateTime).ThenBy(g => g.Id),
            "creation_date_desc" => events.OrderByDescending(ev => ev.CreationDateTime).ThenBy(g => g.Id),
            _ => events.OrderBy(ev => ev.Id)
        };

        return filterApplied
            ? PaginatedList<Event>.Create(events, page, pageSize)
            : await PaginatedList<Event>.CreateAsync(
                events.Include(e => e.Game).Include(e => e.Organizer).AsNoTracking(), page, pageSize);
    }

    public void DeleteEvent(Event e) =>
        _context.Events.Remove(e);

    public async Task AddEventAsync(Event e) =>
        await _context.Events.AddAsync(e);

    public async Task SaveChangesAsync() =>
        await _context.SaveChangesAsync();
}