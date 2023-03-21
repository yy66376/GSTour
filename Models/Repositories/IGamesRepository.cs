using GDTour.Models.Utility;

namespace GDTour.Models.Repositories;

public interface IGamesRepository
{
    Task<Game?> GetGameByIdAsync(int id);
    Task<(IEnumerable<Game>, int)> GetGamesByNameLimitAsync(string name);
    Task<IEnumerable<(int, string, string?)>> GetGamesByNameAllAsync(string name);

    Task<PaginatedList<Game>> GetGamesBySearchAsync(string search = "", int page = 1, string sort = "",
        int pageSize = 10);

    Task<IEnumerable<Game>> GetAllGamesAsync();
    Task AddGameAsync(Game game);
    Task SaveChangesAsync();
}