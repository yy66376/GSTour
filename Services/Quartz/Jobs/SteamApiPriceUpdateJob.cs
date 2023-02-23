﻿using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Models;
using GDTour.Models;
using GDTour.Models.Email;
using GDTour.Services.Email;
using GDTour.Services.Email;
using GDTour.Services.Steam;
using GDTour.Services.Steam;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Quartz;
using System.Security.Policy;

namespace GDTour.Services.Quartz.Jobs;

[DisallowConcurrentExecution]
public class SteamApiPriceUpdateJob : IJob
{
    private readonly GDTourContext _dbContext;
    private readonly ILogger<SteamApiPriceUpdateJob> _logger;
    private readonly IEmailSender _mailer;
    private readonly IRazorViewToStringRenderer _razorViewToStringRenderer;

    public SteamApiPriceUpdateJob(GDTourContext dbContext, ILogger<SteamApiPriceUpdateJob> logger,
        IEmailSender mailer, IRazorViewToStringRenderer razorViewToStringRenderer)
    {
        _dbContext = dbContext;
        _logger = logger;
        _mailer = mailer;
        _razorViewToStringRenderer = razorViewToStringRenderer;
    }

    public async Task Execute(IJobExecutionContext jobContext)
    {
        var numGames = await _dbContext.Games.CountAsync();
        var batchSize = 1000;
        var numBatches = (int)Math.Ceiling((double)numGames / batchSize);

        for (var batch = 0; batch < numBatches; batch++)
        {
            _logger.LogInformation($"Starting price update batch {batch}.");
            var games = await _dbContext.Games
                .Skip(batch * batchSize)
                .Take(batchSize)
                .Include(g => g.Alerts)
                .ThenInclude(a => a.GDTourUser)
                .Select(g => new Game()
                {
                    Name = g.Name,
                    HeaderImageUrl = g.HeaderImageUrl,
                    Id = g.Id,
                    Alerts = g.Alerts,
                    SteamId = g.SteamId,
                    InitialPrice = g.InitialPrice,
                    FinalPrice = g.FinalPrice
                })
                .ToListAsync();
            var updatedGamePrices = await Steam.Steam.UpdateAppPrices(games
                .Select(g => g.SteamId)
                .ToList());

            for (var i = 0; i < games.Count; i++)
            {
                var game = games[i];
                var (appId, initialPrice, finalPrice) = updatedGamePrices[i];
                var finalPriceChanged = false;

                _dbContext.Games.Attach(game);
                if (game.InitialPrice != initialPrice)
                {
                    game.InitialPrice = initialPrice;
                    _dbContext.Entry(game).Property(g => g.InitialPrice).IsModified = true;
                }

                if (game.FinalPrice != finalPrice)
                {
                    game.FinalPrice = finalPrice;
                    _dbContext.Entry(game).Property(g => g.FinalPrice).IsModified = true;
                    finalPriceChanged = true;
                }

                if (!finalPriceChanged) continue;

                foreach (var alert in game.Alerts)
                    // Add logic to mark alerts as fulfilled if final price is lower than price threshold
                    if (!alert.IsFulfilled && alert.PriceThreshold >= finalPrice)
                    {
                        alert.IsFulfilled = true;
                        alert.FulFilledPrice = finalPrice;
                        alert.FulfillDate = DateTime.Now;

                        // Send email alert
                        if (!alert.Email) continue;

                        var emailBody = await _razorViewToStringRenderer.RenderViewToStringAsync(
                            "/Views/Emails/PriceAlert.cshtml",
                            new PriceAlertEmailViewModel(alert.GDTourUser.FirstName, game.Name,
                                game.HeaderImageUrl, $"https://store.steampowered.com/app/{game.SteamId}/",
                                alert.PriceThreshold, (decimal)finalPrice));
                        await _mailer.SendEmailAsync(alert.GDTourUser.Email!,
                            $"{alert.Game.Name} is currently on sale!",
                            emailBody);
                    }
            }

            await _dbContext.SaveChangesAsync();

            // Wait 30 seconds before the next call
            _logger.LogInformation("Waiting 30 seconds...");
            await Task.Delay(30000);
            _logger.LogInformation("Done waiting! Continuing to next batch!");
        }
    }
}