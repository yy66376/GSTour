using AutoMapper.Configuration.Conventions;
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
using GDTour.Areas.Identity.Data;
using System.Collections;
using Microsoft.AspNetCore.Identity;
using Duende.IdentityServer.Extensions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventsController : Controller
{
    private readonly GDTourContext _context;
    private readonly UserManager<GDTourUser> _userManager;
    private const int SearchResultLimit = 7;

    public EventsController(GDTourContext context, UserManager<GDTourUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: api/Events
    [HttpGet]
    public async Task<ActionResult<EventPageDTO>> GetEvents(
        string search = "",
        int page = 1,
        string sort = "",
        int pageSize = 10
    )
    {
        var events = _context.Event.Select(ev => ev).Include(ev => ev.Game).Include(ev=>ev.Organizer);
        //if (!string.IsNullOrEmpty(search))
        //    events = events.Where(ev => ev.Name.Contains(search));

        //events = events.OrderBy(ev => ev.Date.Year).ThenBy(ev => ev.Date.Month).ThenBy(ev=>ev.Date.Day);

        var result = await PaginatedList<Event>.CreateAsync(events.AsNoTracking(), page, pageSize);
        EventListDTO[] EventsList = new EventListDTO[result.Count];
        int x = 0;
        foreach(var ev in result.ToArray())
        {
            EventsList[x++] = new EventListDTO
            {
                Id = ev.Id,
                Name = ev.Name,
                Date = ev.Date,
                Description = ev.Description,
                Location = ev.Location,
                OrganizerId = ev.OrganizerId,
                OrganizerName = ev.Organizer.UserName,
                HeaderImageUrl = ev.Game.HeaderImageUrl
            };
        }
        return new EventPageDTO()
        {
            PageIndex = result.PageIndex,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage,
            TotalResults = result.TotalItems,
            Events = EventsList
        };
    }

    // GET: api/Events/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EventDetailDTO>> GetEvent(int id)
    {
        var ev = await _context.Event
            .Include(ev => ev.Organizer)
            .Include(ev => ev.Game)
            .FirstOrDefaultAsync(ev => ev.Id == id);

        var participants = _context.UserEvents.Where(ue => ue.EventId == id).Select(ue=>ue.Participant);
        string[] participantNames = new string[participants.Count()];
        int x = 0;
        foreach(var ue in participants)
        {
            participantNames[x++] = ue.UserName;
        }


        if (ev == null)
            return NotFound();

        return new EventDetailDTO()
        {
            Id = ev.Id,
            Name = ev.Name,
            Date = ev.Date,
            Description = ev.Description,
            Location = ev.Location,
            ParticipantsPerGame = ev.ParticipantsPerGame,
            FirstRoundGameCount = ev.FirstRoundGameCount,
            OrganizerId = ev.OrganizerId,
            GameId = ev.GameId,
            HeaderImageUrl = ev.Game.HeaderImageUrl,
            Participants = participantNames
        };
    }

    // PUT: api/Events/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEvent(int id,[FromForm] Event ev)
    {
        if (id != ev.Id)
            return BadRequest();

        _context.Entry(ev).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!EventExists(id))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    // POST: api/Events
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost("post.{format}"),FormatFilter]
    public async Task<ActionResult<Event>> PostEvent([FromForm] EventCreatorDTO eventCreator)
    {

        GDTourUser current = _context.GDTourUsers.Where(u => u.Id == "1053ab87-b30e-447e-8e71-7f065461c5c7").FirstOrDefault();
        Game game = _context.Games.Where(g => g.Id == 1).FirstOrDefault();

        Event ev = new Event
        {
            Name = eventCreator.Name,
            Date = eventCreator.Date,
            Description = eventCreator.Description,
            Location = eventCreator.Location,
            FirstRoundGameCount = eventCreator.FirstRoundGameCount,
            ParticipantsPerGame = 2,
            GameId = game.Id,
            OrganizerId = current.Id,
        };


        if (_context.Event == null)
            return Problem("Entity set 'GDTourContext.Events'  is null.");
        _context.Event.Add(ev);
        await _context.SaveChangesAsync();

        var response = CreatedAtAction("GetEvent", new { id = ev.Id }, ev);

        return response;
    }

    // DELETE: api/Events/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        if (_context.Event == null)
            return NotFound();
        var Event = await _context.Event.FindAsync(id);
        if (Event == null)
            return NotFound();

        _context.Event.Remove(Event);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EventExists(int id)
    {
        return (_context.Event?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}

