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
        var events = _context.Events
            .Include(ev => ev.Game)
            .Include(ev=>ev.Organizer);
        //if (!string.IsNullOrEmpty(search))
        //    events = events.Where(ev => ev.Name.Contains(search));

        //events = events.OrderBy(ev => ev.Date.Year).ThenBy(ev => ev.Date.Month).ThenBy(ev=>ev.Date.Day);

        var result = await PaginatedList<Event>.CreateAsync(events.AsNoTracking(), page, pageSize);

        return new EventPageDTO()
        {
            PageIndex = result.PageIndex,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage,
            TotalResults = result.TotalItems,
            Events = result.Select(ev => new EventListDTO
            {
                Id = ev.Id,
                Name = ev.Name,
                Date = ev.Date,
                Description = ev.Description,
                Location = ev.Location,
                OrganizerId = ev.OrganizerId,
                OrganizerName = ev.Organizer.UserName,
                HeaderImageUrl = ev.Game.HeaderImageUrl
            }).ToArray()
        };
    }

    //GET: api/Events/Details/5

    [HttpGet]
    [Route("Details/{id}")]
    public async Task<ActionResult<Event>> GetEventDetails(int id)
    {
        var ev = await _context.Events
            .Include(ev => ev.Organizer)
            .Include(ev => ev.Game)
            .Include(ev => ev.UserEvents)
            .FirstOrDefaultAsync(ev => ev.Id == id);

        return ev;
    }

    // GET: api/Events/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EventDetailDTO>> GetEvent(int id)
    {
        var ev = await _context.Events
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
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> PatchEvent(int id,[FromBody] EventEditorDTO @event)
    {
        Event Event = await _context.Events.FindAsync(id);
        if (id != Event.Id)
            return BadRequest();

        Event currentEvent = await _context.Events.FindAsync(id);
        currentEvent.Name = @event.Name;
        currentEvent.FirstRoundGameCount = @event.FirstRoundGameCount;
        currentEvent.Location = @event.Location;
        currentEvent.Date = @event.Date;
        currentEvent.Description = @event.Description;
        

        //_context.Entry(ev).State = EntityState.Modified;

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
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Event>> PostEvent(EventCreatorDTO eventCreator)
    {

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var currentUser = await _userManager.FindByIdAsync(currentUserId);

        var game = await _context.Games.FindAsync(eventCreator.GameId);

        Event ev = new Event
        {
            Name = eventCreator.Name,
            Date = eventCreator.Date,
            Description = eventCreator.Description,
            Location = eventCreator.Location,
            FirstRoundGameCount = eventCreator.FirstRoundGameCount,
            ParticipantsPerGame = 2,
            GameId = game.Id,
            Game = game,
            OrganizerId = currentUser.Id,
            Participants = new List<GDTourUser>(),
            
        };

        await _context.Events.AddAsync(ev);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetEvent", new { id = ev.Id }, ev);
    }

    // POST: api/Events/Apply/5
    [HttpPost]
    [Authorize]
    [Route("Apply/{id}")]
    public async Task<ActionResult> ApplyEvent(int id) 
    {

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var currentUser = await _userManager.FindByIdAsync(currentUserId);
        var currentEvent = await _context.Events.FindAsync(id);

        var u = await _context.UserEvents.Where(ue => ue.ParticipantId == currentUserId).FirstOrDefaultAsync();

        if(u != null)
        {
            return Ok();
        }

        UserEvent userEvent = new UserEvent {
            ParticipantId = currentUserId,
            Participant = currentUser,
            EventId = id,
            Event = currentEvent
        };
        await _context.UserEvents.AddAsync(userEvent);
        await _context.SaveChangesAsync();
        return Ok();
    }


    // DELETE: api/Events/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteEvent(int id)
    {

        if (_context.Events == null)
            return NotFound();
        var Event = await _context.Events.FindAsync(id);
        if (Event == null)
            return NotFound();

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        if(currentUserId != Event.OrganizerId)
        {
            return Forbid();
        }

        var userEvents = await _context.UserEvents.Where(ue => ue.EventId == id).ToListAsync();

        _context.UserEvents.RemoveRange(userEvents);

        _context.Events.Remove(Event);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool EventExists(int id)
    {
        return (_context.Events?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}

