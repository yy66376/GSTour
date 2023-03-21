using GDTour.Models;
using GDTour.Models.Repositories;
using GDTour.Models.Utility;
using Microsoft.AspNetCore.Mvc;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GamesController : ControllerBase
{
    private readonly IGamesRepository _repository;

    public GamesController(IGamesRepository gamesRepository)
    {
        _repository = gamesRepository;
    }

    [HttpGet]
    [Route("Search")]
    public async Task<ActionResult<GameSearchResults>> SearchGames(string q = "")
    {
        if (string.IsNullOrEmpty(q))
            return BadRequest();
        var (games, count) = await _repository.GetGamesByNameLimitAsync(q);
        var searchResult = new GameSearchResults { Count = count, Items = games.Select(GameToGameSearchDto) };
        if (count == 0)
            return NotFound(searchResult);

        return Ok(searchResult);
    }

    [HttpGet]
    [Route("SearchAll")]
    public async Task<ActionResult<IEnumerable<GameSelectDTO>>> SearchGamesAll(string q = "")
    {
        if (string.IsNullOrEmpty(q))
            return BadRequest();

        var games = await _repository.GetGamesByNameAllAsync(q);

        var results = games.Select(g =>
        {
            var (id, name, headerImageUrl) = g;
            return new GameSelectDTO
            {
                Id = id,
                Name = name,
                HeaderImageUrl = headerImageUrl
            };
        });

        if (!results.Any())
            return NotFound(results);

        return Ok(results);
    }

    // GET: api/Games
    [HttpGet]
    public async Task<ActionResult<GamePageDTO>> GetGames(
        string search = "",
        int page = 1,
        string sort = "",
        int pageSize = 10
    )
    {
        var result = await _repository.GetGamesBySearchAsync(search, page, sort, pageSize);
        var gamePageDto = new GamePageDTO
        {
            PageIndex = result.PageIndex,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage,
            TotalResults = result.TotalItems,
            Games = result.ToArray()
        };
        if (result.TotalItems == 0)
            return NotFound(gamePageDto);

        return Ok(gamePageDto);
    }

    // GET: api/Games/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GameDetailDTO>> GetGame(int id)
    {
        var game = await _repository.GetGameByIdAsync(id);

        if (game == null)
            return NotFound();

        return Ok(new GameDetailDTO
        {
            Id = game.Id,
            Name = game.Name,
            SteamId = game.SteamId,
            ReleaseDate = game.ReleaseDate,
            ShortDescription = game.ShortDescription,
            AboutTheGame = game.AboutTheGame,
            FinalPrice = game.FinalPrice,
            InitialPrice = game.InitialPrice,
            HeaderImageUrl = game.HeaderImageUrl,
            IsFree = game.IsFree,
            LinuxSupport = game.LinuxSupport,
            MacSupport = game.MacSupport,
            WindowsSupport = game.WindowsSupport,
            MetacriticScore = game.MetacriticScore,
            MetacriticUrl = game.MetacriticUrl,
            Movies = game.Movies
                .Select(
                    m =>
                        new MovieDetailDTO
                        {
                            Id = m.Id,
                            MaxVideoUrl = m.MaxVideoUrl,
                            MinVideoUrl = m.MinVideoUrl,
                            ThumbnailUrl = m.ThumbnailUrl,
                            MinVideoWebmUrl = m.MinVideoWebmUrl,
                            MaxVideoWebmUrl = m.MaxVideoWebmUrl
                        }
                )
                .ToArray(),
            Screenshots = game.Screenshots
                .Select(
                    s =>
                        new ScreenshotDetailDTO
                        {
                            Id = s.Id,
                            FullUrl = s.FullUrl,
                            ThumbnailUrl = s.FullUrl
                        }
                )
                .ToArray()
        });
    }

    public static GameSearchDto GameToGameSearchDto(Game g) =>
        new()
        {
            Id = g.Id,
            FinalPrice = g.FinalPrice,
            HeaderImageUrl = g.HeaderImageUrl,
            Name = g.Name
        };
}