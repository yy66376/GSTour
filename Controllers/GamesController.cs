using GDTour.Data;
using GDTour.Models;
using GDTour.Models.Utility;
using GDTour.Services.Steam;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GamesController : ControllerBase
{
    private readonly GDTourContext _context;
    private const int SearchResultLimit = 7;

    public GamesController(GDTourContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Route("Search")]
    public async Task<ActionResult<SearchResults<Game>>> SearchGames(string q = "")
    {
        var gameQuery = from g in _context.Games select g;

        if (string.IsNullOrEmpty(q))
            return BadRequest();

        gameQuery = gameQuery.Where(g => g.Name.Contains(q)).AsNoTracking();
        var count = await gameQuery.CountAsync();
        var games = await gameQuery.Take(SearchResultLimit).ToListAsync();
        var searchResult = new SearchResults<Game>() { Count = count, Items = games };
        if (count == 0)
            return NotFound(searchResult);

        return Ok(searchResult);
    }

    [HttpGet]
    [Route("SearchAll")]
    public async Task<ActionResult<IEnumerable<Game>>> SearchGamesAll(string q = "")
    {
        var gameQuery = from g in _context.Games select g;

        if (string.IsNullOrEmpty(q))
            return BadRequest();

        gameQuery = gameQuery.Where(g => g.Name.Contains(q)).AsNoTracking();
        var games = await gameQuery.Select(g => new { g.Id, g.Name, g.HeaderImageUrl }).ToListAsync();

        var results = games.Select(g => new GameSelectDTO
        {
            Id = g.Id,
            Name = g.Name,
            HeaderImageUrl = g.HeaderImageUrl
        });

        if (results.Count() == 0)
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

        var result = await PaginatedList<Game>.CreateAsync(games.AsNoTracking(), page, pageSize);
        return new GamePageDTO()
        {
            PageIndex = result.PageIndex,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage,
            TotalResults = result.TotalItems,
            Games = result.ToArray()
        };
    }

    // GET: api/Games/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GameDetailDTO>> GetGame(int id)
    {
        var game = await _context.Games
            .Include(g => g.Movies)
            .Include(g => g.Screenshots)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null)
            return NotFound();

        return new GameDetailDTO()
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
                        new MovieDetailDTO()
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
                        new ScreenshotDetailDTO()
                        {
                            Id = s.Id,
                            FullUrl = s.FullUrl,
                            ThumbnailUrl = s.FullUrl
                        }
                )
                .ToArray()
        };
    }

    // DELETE: api/Games/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        if (_context.Games == null)
            return NotFound();
        var game = await _context.Games.FindAsync(id);
        if (game == null)
            return NotFound();

        _context.Games.Remove(game);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool GameExists(int id)
    {
        return (_context.Games?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}