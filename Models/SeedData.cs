using Duende.IdentityServer.EntityFramework.Options;
using GDTour.Data;
using Microsoft.CodeAnalysis.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GDTour.Models;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        await using var context =
            new GDTourContext(
                serviceProvider.GetRequiredService<DbContextOptions<GDTourContext>>(),
                serviceProvider.GetRequiredService<IOptions<OperationalStoreOptions>>());
        // Look for any movies.
        if (context.Games.Any()) return; // DB has been seeded
        var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", "two_hundred_games.txt");
        var seeds = await Services.Steam.Steam.GetAppsFromTxt(path);
        context.ChangeTracker.AutoDetectChangesEnabled = false;
        // Map each SteamAppModel to a Game model in the database
        foreach (var seed in seeds)
        {
            var newGame = new Game
            {
                SteamId = (int)seed.AppId,
                Name = seed.Name,
                IsFree = seed.IsFree,
                ReleaseDate = seed.ReleaseDate,
                ShortDescription = seed.ShortDescription,
                AboutTheGame = seed.AboutTheGame,
                InitialPrice = seed.InitialPrice,
                FinalPrice = seed.FinalPrice,
                WindowsSupport = seed.WindowsSupport,
                LinuxSupport = seed.LinuxSupport,
                MacSupport = seed.MacSupport,
                MetacriticScore = seed.MetacriticScore,
                MetacriticUrl = seed.MetacriticUrl,
                HeaderImageUrl = seed.HeaderImageUrl
            };
            await context.Games.AddAsync(newGame);
            await context.SaveChangesAsync();

            // Add screenshots to database
            foreach (var screenshotDetail in seed.ScreenshotDetails!)
                await context.Screenshots.AddAsync(
                    new Screenshot()
                    {
                        GameId = newGame.Id,
                        FullUrl = screenshotDetail.FullUrl,
                        ThumbnailUrl = screenshotDetail.ThumbnailUrl
                    });


            // Add movies to database
            foreach (var movieDetail in seed.MovieDetails!)
                await context.Movies.AddAsync(
                    new Movie()
                    {
                        GameId = newGame.Id,
                        ThumbnailUrl = movieDetail.ThumbnailUrl,
                        MinVideoUrl = movieDetail.MinVideoUrl,
                        MaxVideoUrl = movieDetail.MaxVideoUrl
                    });
        }

        context.ChangeTracker.DetectChanges();
        await context.SaveChangesAsync();
        context.ChangeTracker.DetectChanges();
    }
}