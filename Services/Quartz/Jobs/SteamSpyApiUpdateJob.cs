using GDTour.Data;
using GDTour.Hubs;
using GDTour.Hubs.Clients;
using GDTour.Models;
using GDTour.Services.Email;
using GDTour.Services.Steam;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace GDTour.Services.Quartz.Jobs;

[DisallowConcurrentExecution]
public class SteamSpyApiUpdateJob : IJob
{
    private readonly GDTourContext _dbContext;
    private readonly ILogger<SteamApiPriceUpdateJob> _logger;

    public SteamSpyApiUpdateJob(GDTourContext dbContext, ILogger<SteamApiPriceUpdateJob> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext jobContext)
    {
        var page = 1;
        var appIds = await Steamspy.Steamspy.GetAppIdsFromApi(page);
        while (appIds.Count > 0)
        {
            const int batchSize = 5;
            var numBatches = (int)Math.Ceiling((double)appIds.Count / batchSize);
            for (var batch = 0; batch < numBatches; batch++)
            {
                var start = batch * batchSize;
                var end = (batch + 1) * batchSize;

                for (var i = start; i < end && i < appIds.Count; i++)
                {
                    var appId = appIds[i];

                    var appDetail = await Steam.Steam.GetAppDetails(appId);
                    if (appDetail == null) continue;

                    var exists = await _dbContext.Games.AnyAsync(g => g.SteamId == appId);
                    if (exists)
                    {
                        var existingGame = await _dbContext.Games
                            .Include(g => g.Screenshots)
                            .Include(g => g.Movies)
                            .FirstOrDefaultAsync(g => g.SteamId == appId);
                        if (existingGame != null)
                        {
                            existingGame.Name = appDetail.Name;
                            existingGame.IsFree = appDetail.IsFree;
                            existingGame.ReleaseDate = appDetail.ReleaseDate;
                            existingGame.ShortDescription = appDetail.ShortDescription;
                            existingGame.AboutTheGame = appDetail.AboutTheGame;
                            existingGame.WindowsSupport = appDetail.WindowsSupport;
                            existingGame.LinuxSupport = appDetail.LinuxSupport;
                            existingGame.MacSupport = appDetail.MacSupport;
                            existingGame.MetacriticScore = appDetail.MetacriticScore;
                            existingGame.MetacriticUrl = appDetail.MetacriticUrl;
                            existingGame.HeaderImageUrl = appDetail.HeaderImageUrl;

                            var screenshotIndex = 0;
                            foreach (var screenshot in existingGame.Screenshots)
                            {
                                // Game currently has less screenshots. Delete this extra screenshot
                                if (screenshotIndex >= appDetail.ScreenshotDetails.Count)
                                {
                                    _dbContext.Screenshots.Remove(screenshot);
                                    continue;
                                }

                                var newScreenshot = appDetail.ScreenshotDetails[screenshotIndex++];
                                screenshot.FullUrl = newScreenshot.FullUrl;
                                screenshot.ThumbnailUrl = newScreenshot.ThumbnailUrl;
                            }

                            // if there are more screenshots currently, add them accordingly
                            for (; screenshotIndex < appDetail.ScreenshotDetails.Count; screenshotIndex++)
                            {
                                var newScreenshot = appDetail.ScreenshotDetails[screenshotIndex];
                                await _dbContext.Screenshots.AddAsync(
                                    new Screenshot()
                                    {
                                        GameId = existingGame.Id,
                                        FullUrl = newScreenshot.FullUrl,
                                        ThumbnailUrl = newScreenshot.ThumbnailUrl
                                    });
                            }

                            var movieIndex = 0;
                            foreach (var movie in existingGame.Movies)
                            {
                                // Game currently has less movies. Delete this extra movie
                                if (movieIndex >= appDetail.MovieDetails.Count)
                                {
                                    _dbContext.Movies.Remove(movie);
                                    continue;
                                }

                                var newMovie = appDetail.MovieDetails[movieIndex++];
                                movie.MaxVideoUrl = newMovie.MaxVideoUrl;
                                movie.MinVideoUrl = newMovie.MinVideoUrl;
                                movie.ThumbnailUrl = newMovie.ThumbnailUrl;
                                movie.MinVideoWebmUrl = newMovie.MinVideoWebmUrl;
                                movie.MaxVideoWebmUrl = newMovie.MaxVideoWebmUrl;
                            }

                            // if there are more movies currently, add them accordingly
                            for (; movieIndex < appDetail.MovieDetails.Count; movieIndex++)
                            {
                                var newMovie = appDetail.MovieDetails[movieIndex];
                                await _dbContext.Movies.AddAsync(
                                    new Movie()
                                    {
                                        GameId = existingGame.Id,
                                        ThumbnailUrl = newMovie.ThumbnailUrl,
                                        MinVideoUrl = newMovie.MinVideoUrl,
                                        MaxVideoUrl = newMovie.MaxVideoUrl,
                                        MinVideoWebmUrl = newMovie.MinVideoWebmUrl,
                                        MaxVideoWebmUrl = newMovie.MaxVideoWebmUrl
                                    });
                            }
                        }
                    }
                    else
                    {
                        var newGame = new Game
                        {
                            SteamId = (int)appDetail.AppId,
                            Name = appDetail.Name,
                            IsFree = appDetail.IsFree,
                            ReleaseDate = appDetail.ReleaseDate,
                            ShortDescription = appDetail.ShortDescription,
                            AboutTheGame = appDetail.AboutTheGame,
                            InitialPrice = appDetail.InitialPrice,
                            FinalPrice = appDetail.FinalPrice,
                            WindowsSupport = appDetail.WindowsSupport,
                            LinuxSupport = appDetail.LinuxSupport,
                            MacSupport = appDetail.MacSupport,
                            MetacriticScore = appDetail.MetacriticScore,
                            MetacriticUrl = appDetail.MetacriticUrl,
                            HeaderImageUrl = appDetail.HeaderImageUrl
                        };
                        await _dbContext.Games.AddAsync(newGame);
                        await _dbContext.SaveChangesAsync();

                        // Add screenshots to database
                        foreach (var screenshotDetail in appDetail.ScreenshotDetails!)
                            await _dbContext.Screenshots.AddAsync(
                                new Screenshot()
                                {
                                    GameId = newGame.Id,
                                    FullUrl = screenshotDetail.FullUrl,
                                    ThumbnailUrl = screenshotDetail.ThumbnailUrl
                                });


                        // Add movies to database
                        foreach (var movieDetail in appDetail.MovieDetails!)
                            await _dbContext.Movies.AddAsync(
                                new Movie()
                                {
                                    GameId = newGame.Id,
                                    ThumbnailUrl = movieDetail.ThumbnailUrl,
                                    MinVideoUrl = movieDetail.MinVideoUrl,
                                    MaxVideoUrl = movieDetail.MaxVideoUrl,
                                    MinVideoWebmUrl = movieDetail.MinVideoWebmUrl,
                                    MaxVideoWebmUrl = movieDetail.MaxVideoWebmUrl
                                });
                    }

                    await _dbContext.SaveChangesAsync();
                }

                // Prevent overloading Steam API with requests
                _logger.LogInformation("Waiting 5 seconds before processing next batch with Steam API...");
                await Task.Delay(5000);
                _logger.LogInformation("Done waiting! Continuing to the next batch.");
            }

            // Wait 62 seconds before querying the Steamspy API again (rate limit)
            _logger.LogInformation("Waiting 62 seconds before getting next page from SteamSpy...");
            await Task.Delay(62000);
            _logger.LogInformation("Done waiting! Continuing to the next page.");

            page++;
            appIds = await Steamspy.Steamspy.GetAppIdsFromApi(page);
        }
    }
}