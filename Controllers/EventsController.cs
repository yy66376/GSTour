using Duende.IdentityServer.Extensions;
using GDTour.Areas.Identity.Data;
using GDTour.Hubs;
using GDTour.Hubs.Clients;
using GDTour.Models;
using GDTour.Models.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GDTour.Models.Repositories;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventsController : Controller
{
    private readonly IEventsRepository _repo;
    private readonly UserManager<GDTourUser> _userManager;
    private readonly IHubContext<BracketHub, IBracketClient> _bracketHub;
    private readonly IHubContext<EventHub, IEventClient> _eventHub;
    
    public Func<string> GetUserId;

    public EventsController(IEventsRepository repo, UserManager<GDTourUser> userManager,
        IHubContext<BracketHub, IBracketClient> bracketHub, IHubContext<EventHub, IEventClient> eventHub)
    {
        _repo = repo;
        _userManager = userManager;
        _bracketHub = bracketHub;
        _eventHub = eventHub;
        GetUserId = () => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
    }

    [HttpGet]
    [Route("Search")]
    public async Task<ActionResult<EventSearchResults>> SearchEvents(string q = "")
    {
        if (string.IsNullOrEmpty(q))
            return BadRequest();
        var (events, count) = await _repo.GetEventsByNameLimitAsync(q);
        var searchResult = new EventSearchResults { Count = count, Items = events.Select(EventToEventSearchDto) };
        if (count == 0)
            return NotFound(searchResult);

        return Ok(searchResult);
    }

    // GET: api/Events
    [HttpGet]
    public async Task<ActionResult<EventPageDTO>> GetEvents(
        string search = "",
        int page = 1,
        string sort = "",
        int pageSize = 10,
        string filter = ""
    )
    {
        var currentUserId = User.IsAuthenticated() ? GetUserId() : null;
        var result = await _repo.GetEventsBySearchAsync(search, page, sort, pageSize, filter, currentUserId);
        var eventPageDto = new EventPageDTO
        {
            PageIndex = result.PageIndex,
            TotalPages = result.TotalPages,
            HasNextPage = result.HasNextPage,
            HasPreviousPage = result.HasPreviousPage,
            TotalResults = result.TotalItems,
            Events = result.Select(EventToEventListDto).ToArray()
        };
        if (result.TotalItems == 0)
            return NotFound(eventPageDto);
        return Ok(eventPageDto);
    }

    // GET: api/Events/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EventDetailDTO>> GetEvent(int id)
    {
        var e = await _repo.GetEventByIdAsync(id);
        if (e == null)
            return NotFound();
        var participantNames = e.Participants.Select(p => $"{p.FirstName} {p.LastName} ({p.UserName})").ToArray();
        return Ok(new EventDetailDTO()
        {
            Id = e.Id,
            Name = e.Name,
            Date = e.Date,
            Description = e.Description,
            Location = e.Location,
            ParticipantsPerGame = e.ParticipantsPerGame,
            FirstRoundGameCount = e.FirstRoundGameCount,
            OrganizerId = e.OrganizerId,
            OrganizerName = e.Organizer == null ? "Unknown" : $"{e.Organizer.FirstName} {e.Organizer.LastName}",
            GameId = e.GameId,
            HeaderImageUrl = e.Game.HeaderImageUrl,
            BracketJson = e.BracketJson,
            Participants = participantNames
        });
    }

    // PUT: api/Events/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<ActionResult> PatchEvent(int id, EventEditorDTO updatedEvent)
    {
        var e = await _repo.GetEventByIdAsync(id);

        if (e == null)
            return NotFound();
        var currentUserId = GetUserId();
        var organizerId = e.OrganizerId;
        if (currentUserId != organizerId)
            return Forbid();

        e.Name = updatedEvent.Name;
        e.FirstRoundGameCount = updatedEvent.FirstRoundGameCount;
        e.Location = updatedEvent.Location;
        e.Date = updatedEvent.Date;
        e.Description = updatedEvent.Description;

        await _repo.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/Events
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Event>> PostEvent(EventCreatorDTO eventCreator)
    {
        var currentUserId = GetUserId();
        var e = new Event
        {
            Name = eventCreator.Name,
            Date = eventCreator.Date,
            Description = eventCreator.Description,
            Location = eventCreator.Location,
            FirstRoundGameCount = eventCreator.FirstRoundGameCount,
            ParticipantsPerGame = 2,
            GameId = eventCreator.GameId,
            OrganizerId = currentUserId,
        };

        await _repo.AddEventAsync(e);
        await _repo.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvent), new { id = e.Id }, e);
    }

    // POST: api/Events/Apply/5
    [HttpPost]
    [Authorize]
    [Route("Apply/{id}")]
    public async Task<ActionResult> ApplyEvent(int id)
    {
        var e = await _repo.GetEventByIdAsync(id);
        if (e == null)
            return NotFound();

        var currentUserId = GetUserId();
        var currentUser = (await _userManager.Users.Include(u => u.ParticipatingEvents)
            .FirstOrDefaultAsync(u => u.Id == currentUserId))!;
        var numParticipants = e.Participants.Count;
        if (numParticipants >= e.FirstRoundGameCount)
            return BadRequest("EventCapacityExceededError");
        if (e.Participants.Contains(currentUser))
            return BadRequest("EventAlreadyAppliedError");

        currentUser.ParticipatingEvents.Add(e);
        await _repo.SaveChangesAsync();

        await _eventHub.Clients.Group($"event-{e.Id}").ReceiveParticipant(
            $"{currentUser.FirstName} {currentUser.LastName} ({currentUser.UserName})");

        return Ok();
    }


    // DELETE: api/Events/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteEvent(int id)
    {
        var e = await _repo.GetEventByIdAsync(id);
        if (e == null) return NotFound();

        var currentUserId = GetUserId();
        var organizerId = e.OrganizerId;
        if (currentUserId != organizerId)
            return Forbid();

        _repo.DeleteEvent(e);
        await _repo.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/Bracket")]
    [Authorize]
    public async Task<IActionResult> UpdateBracket(int id, EventBracketDTO eventBracket)
    {
        var currentUserId = GetUserId();
        var e = await _repo.GetEventByIdAsync(id);
        if (e == null)
            return NotFound("EventDoesNotExistError");
        if (e.OrganizerId != currentUserId)
            return Forbid("NotOrganizerModifyError");

        e.BracketJson = eventBracket.BracketJson;
        await _repo.SaveChangesAsync();

        await _bracketHub.Clients.Group($"bracket-{e.Id}").ReceiveBracket(eventBracket.BracketJson);
        return NoContent();
    }

    public static EventListDTO EventToEventListDto(Event ev) =>
        new()
        {
            Id = ev.Id,
            Name = ev.Name,
            Date = ev.Date,
            Description = ev.Description,
            Location = ev.Location,
            OrganizerId = ev.OrganizerId,
            OrganizerName = ev.Organizer == null
                ? "Unknown"
                : $"{ev.Organizer.FirstName} {ev.Organizer.LastName} ({ev.Organizer.UserName})",
            HeaderImageUrl = ev.Game.HeaderImageUrl,
            FirstRoundGameCount = ev.FirstRoundGameCount
        };

    public static EventSearchDto EventToEventSearchDto(Event ev) =>
        new()
        {
            Id = ev.Id,
            Date = ev.Date,
            HeaderImageUrl = ev.Game.HeaderImageUrl,
            Name = ev.Name
        };
}