using AutoMapper.Configuration.Conventions;
using Duende.IdentityServer.Extensions;
using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Hubs;
using GDTour.Hubs.Clients;
using GDTour.Models;
using GDTour.Models.Utility;
using GDTour.Services.Steam;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventsController : Controller
{
    private readonly GDTourContext _context;
    private readonly UserManager<GDTourUser> _userManager;
    private readonly IHubContext<BracketHub, IBracketClient> _bracketHub;
    private const int SearchResultLimit = 7;

    public EventsController(GDTourContext context, UserManager<GDTourUser> userManager,
        IHubContext<BracketHub, IBracketClient> bracketHub)
    {
        _context = context;
        _userManager = userManager;
        _bracketHub = bracketHub;
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
            .Include(ev => ev.Organizer);
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
                OrganizerName = $"{ev.Organizer.FirstName} {ev.Organizer.LastName} ({ev.Organizer.UserName})",
                HeaderImageUrl = ev.Game.HeaderImageUrl,
                FirstRoundGameCount = ev.FirstRoundGameCount
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

        var participants = await _context.UserEvents
            .Where(ue => ue.EventId == id)
            .Include(ue => ue.Participant)
            .ToListAsync();
        var participantNames = participants.Select(ue =>
        {
            var participant = ue.Participant;
            return $"{participant.FirstName} {participant.LastName} ({participant.UserName})";
        }).ToArray();

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
            OrganizerName = $"{ev.Organizer.FirstName} {ev.Organizer.LastName}",
            GameId = ev.GameId,
            HeaderImageUrl = ev.Game.HeaderImageUrl,
            BracketJson = ev.BracketJson,
            Participants = participantNames
        };
    }

    // PUT: api/Events/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> PatchEvent(int id, [FromBody] EventEditorDTO @event)
    {
        var Event = await _context.Events.FindAsync(id);
        if (id != Event.Id)
            return BadRequest();

        var currentEvent = await _context.Events.FindAsync(id);
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

        var ev = new Event
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
            UserEvents = new List<UserEvent>(),
            Participants = new List<GDTourUser>()
        };

        await _context.Events.AddAsync(ev);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetEvent", new
        {
            id = ev.Id
        }, ev);
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
        var numParticipants = await _context.UserEvents.Where(ue => ue.EventId == id).CountAsync();

        if (currentEvent == null) return BadRequest("EventDoesNotExistError");
        if (numParticipants >= currentEvent.FirstRoundGameCount)
            return BadRequest("EventCapacityExceededError");

        var u = await _context.UserEvents
            .Where(ue => ue.ParticipantId == currentUserId && ue.EventId == currentEvent.Id).FirstOrDefaultAsync();

        if (u != null) return BadRequest("EventAlreadyAppliedError");

        var userEvent = new UserEvent
        {
            ParticipantId = currentUserId,
            Participant = currentUser,
            EventId = id,
            Event = currentEvent
        };
        await _context.UserEvents.AddAsync(userEvent);
        await _context.SaveChangesAsync();

        await _bracketHub.Clients.All.ReceiveParticipant(
            $"{currentUser.FirstName} {currentUser.LastName} ({currentUser.UserName})");
        return Ok();
    }


    // DELETE: api/Events/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteEvent(int id)
    {

        var Event = await _context.Events.FindAsync(id);
        var currentUser = await _context.GDTourUsers.FindAsync(Event.OrganizerId);
        if (Event == null)
            return NotFound();
        if (Event.OrganizerId != currentUser.Id)
        {
            return Forbid();
        }

        var userEvents = await _context.UserEvents.Where(ue => ue.EventId == id).ToListAsync();

        _context.UserEvents.RemoveRange(userEvents);

        _context.Events.Remove(Event);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/Bracket")]
    [Authorize]
    public async Task<IActionResult> UpdateBracket(int id, EventBracketDTO eventBracket)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var currentEvent = await _context.Events.FindAsync(id);
        if (currentEvent == null)
            return NotFound("EventDoesNotExistError");
        if (currentEvent.OrganizerId != currentUserId) return Forbid("NotOrganizerModifyError");

        currentEvent.BracketJson = eventBracket.BracketJson;
        await _context.SaveChangesAsync();

        await _bracketHub.Clients.All.ReceiveBracket(eventBracket.BracketJson);
        return NoContent();
    }

    private bool EventExists(int id)
    {
        return (_context.Events?.Any(e => e.Id == id)).GetValueOrDefault();
    }
}