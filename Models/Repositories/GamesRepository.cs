using GDTour.Data;
using GDTour.Models.Utility;
using Microsoft.EntityFrameworkCore;

namespace GDTour.Models.Repositories;

public class GamesRepository : IGamesRepository
{
    private const int SearchResultLimit = 7;
    private readonly GDTourContext _context;

    public GamesRepository(GDTourContext context)
    {
        _context = context;
    }

    public async Task<Game?> GetGameByIdAsync(int id)
    {
        return await _context.Games
            .Include(g => g.Screenshots)
            .Include(g => g.Movies)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<IEnumerable<Game>> GetAllGamesAsync()
    {
        return await _context.Games.ToListAsync();
    }

    public async Task AddGameAsync(Game game)
    {
        await _context.Games.AddAsync(game);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<Game>, int)> GetGamesByNameLimitAsync(string name)
    {
        var gameQuery = _context.Games.Where(g => g.Name.Contains(name)).AsNoTracking();
        var count = await gameQuery.CountAsync();
        var games = await gameQuery.Take(SearchResultLimit).ToListAsync();
        return (games, count);
    }

    public async Task<IEnumerable<(int, string, string?)>> GetGamesByNameAllAsync(string name)
    {
        var gameQuery = _context.Games.Where(g => g.Name.Contains(name)).AsNoTracking();
        var games = await gameQuery.Select(g => new { g.Id, g.Name, g.HeaderImageUrl }).ToListAsync();
        return games.Select(g => (g.Id, g.Name, g.HeaderImageUrl));
    }

    public async Task<PaginatedList<Game>> GetGamesBySearchAsync(
        string search = "",
        int page = 1,
        string sort = "",
        int pageSize = 10
    )
    {
        var games = from g in _context.Games select g;
        if (!string.IsNullOrEmpty(search))
            games = games.Where(g => g.Name.Contains(search));

        games = sort switch
        {
            "name_asc" => games.OrderBy(g => g.Name).ThenBy(g => g.Id),
            "name_desc" => games.OrderByDescending(g => g.Name).ThenBy(g => g.Id),
            "date_asc" => games.OrderBy(g => g.ReleaseDate).ThenBy(g => g.Id),
            "date_desc" => games.OrderByDescending(g => g.ReleaseDate).ThenBy(g => g.Id),
            "price_asc" => games.OrderBy(g => g.FinalPrice).ThenBy(g => g.Id),
            "price_desc" => games.OrderByDescending(g => g.FinalPrice).ThenBy(g => g.Id),
            _ => games
        };

        return await PaginatedList<Game>.CreateAsync(games.AsNoTracking(), page, pageSize);
    }
}