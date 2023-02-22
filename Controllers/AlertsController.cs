using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Hubs;
using GDTour.Hubs.Clients;
using GDTour.Models;
using GDTour.Models.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GDTour.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AlertsController : ControllerBase
{
    private readonly GDTourContext _context;
    private readonly UserManager<GDTourUser> _userManager;
    private readonly IHubContext<NotificationHub, INotificationClient> _notificationHub;

    public AlertsController(
        GDTourContext context,
        UserManager<GDTourUser> userManager,
        IHubContext<NotificationHub, INotificationClient> notificationHub
    )
    {
        _context = context;
        _userManager = userManager;
        _notificationHub = notificationHub;
    }

    // GET: api/Alerts
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<AlertDetailDTO>>> GetAlerts(int gameId = -1)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        var alertsQuery = _context.Alerts.Include(a => a.Game).Where(a => a.GDTourUserId == currentUserId);
        if (gameId != -1) alertsQuery = alertsQuery.Where(a => a.GameId == gameId);
        var alerts = await alertsQuery
            .AsNoTracking()
            .ToListAsync();

        return Ok(alerts.Select(CreateAlertDetailDTO));
    }

    // GET: api/Alerts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Alert>> GetAlert(int id)
    {
        var alert = await _context.Alerts.FindAsync(id);

        if (alert == null)
            return NotFound();

        return alert;
    }

    // PUT: api/Alerts/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAlert(int id, Alert alert)
    {
        if (id != alert.Id)
            return BadRequest();

        _context.Entry(alert).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AlertExists(id))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    // PATCH: api/Alerts/5
    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> PatchAlert(int id, AlertDTO alertDTO)
    {
        if (id != alertDTO.Id)
            return BadRequest();

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
            return NotFound();
        if (alert.GDTourUserId != currentUserId)
            return Forbid();

        // make changes
        alert.Browser = alertDTO.Browser;
        alert.Email = alertDTO.Email;
        alert.PriceThreshold = alertDTO.PriceThreshold;

        // save changes
        try
        {
            await _context.SaveChangesAsync();
            await _notificationHub.Clients
                .User(User.Identity!.Name!)
                .EditNotification(
                    alert.Id,
                    alert.IsFulfilled,
                    alert.Email,
                    alert.Browser,
                    alert.PriceThreshold
                );
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AlertExists(id))
                return NotFound();
            else
                throw;
        }

        return NoContent();
    }

    // POST: api/Alerts
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Alert>> PostAlert(AlertDTO alert)
    {
        var game = await _context.Games.FindAsync(alert.GameId);
        if (game == null)
            return BadRequest("Game does not exist in the database!");

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        var currentUser = await _userManager.FindByIdAsync(currentUserId);

        var a = new Alert()
        {
            Browser = alert.Browser,
            Email = alert.Email,
            GameId = alert.GameId,
            Game = game,
            PriceThreshold = alert.PriceThreshold,
            GDTourUserId = currentUserId,
            GDTourUser = currentUser!
        };
        _context.Alerts.Add(a);
        await _context.SaveChangesAsync();

        await _notificationHub.Clients
            .User(User.Identity!.Name!)
            .ReceiveNotification(CreateAlertDetailDTO(a));

        return CreatedAtAction("GetAlert", new { id = a.Id }, CreateAlertDetailDTO(a));
    }

    // DELETE: api/Alerts/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteAlert(int id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null)
            return NotFound();
        if (alert.GDTourUserId != currentUserId)
            return Forbid();

        var isFulfilled = alert.IsFulfilled;
        _context.Alerts.Remove(alert);
        await _context.SaveChangesAsync();

        await _notificationHub.Clients
            .User(User.Identity!.Name!)
            .DeleteNotification(id, isFulfilled);

        return NoContent();
    }

    private bool AlertExists(int id)
    {
        return (_context.Alerts?.Any(e => e.Id == id)).GetValueOrDefault();
    }

    private static AlertDTO CreateAlertDTO(Alert alert)
    {
        return new AlertDTO
        {
            Id = alert.Id,
            Browser = alert.Browser,
            Email = alert.Email,
            PriceThreshold = alert.PriceThreshold,
            GameId = alert.GameId
        };
    }

    private static AlertDetailDTO CreateAlertDetailDTO(Alert alert)
    {
        return new AlertDetailDTO()
        {
            Id = alert.Id,
            Browser = alert.Browser,
            Email = alert.Email,
            PriceThreshold = alert.PriceThreshold,
            GameId = alert.GameId,
            FulfillDate = alert.FulfillDate,
            FulFilledPrice = alert.FulFilledPrice,
            IsFulfilled = alert.IsFulfilled,
            Read = alert.Read,
            Game = new GameAlertDTO
            {
                Id = alert.Game.Id,
                FinalPrice = alert.Game.FinalPrice,
                InitialPrice = alert.Game.InitialPrice,
                IsFree = alert.Game.IsFree,
                Name = alert.Game.Name,
                SteamId = alert.Game.SteamId,
                HeaderImageUrl = alert.Game.HeaderImageUrl
            }
        };
    }
}