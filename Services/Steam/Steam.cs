using Microsoft.CSharp.RuntimeBinder;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Globalization;
using System.Net;
using System.Security.Policy;
using System.Text;

namespace GDTour.Services.Steam;

public static class Steam
{
    //public static async Task<List<uint>> GetAppListAsync()
    //{
    //    using var httpClient = new HttpClient();
    //    const string endpointUrl = "https://api.steampowered.com/ISteamApps/GetAppList/v2";
    //    var jsonString = await httpClient.GetStringAsync(endpointUrl);

    //    dynamic? jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
    //    if (jsonObject is null)
    //    {
    //        throw new Exception("JSON string failed to convert to .NET object.");
    //    }

    //    // Get list of all games from the jsonObject
    //    var allGames = jsonObject.applist.apps;
    //    List<uint> retVal = new List<uint>();
    //    foreach (dynamic game in allGames)
    //    {
    //        retVal.Add(uint.Parse(game.appid.ToString()));
    //    }
    //    return retVal;
    //}

    //public static async Task<SteamAppDetail?> GetAppDetailsAsync(uint appId)
    //{
    //    using var httpClient = new HttpClient();
    //    var endpointUrl = $"https://store.steampowered.com/api/appdetails?l=english&appids={appId}";
    //    var jsonString = await httpClient.GetStringAsync(endpointUrl);

    //    dynamic? jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
    //    if (jsonObject is null)
    //    {
    //        throw new Exception("JSON string failed to convert to .NET object.");
    //    }

    //    var success = (bool)jsonObject[appId.ToString()].success;
    //    if (!success)   // Game info not exposed to the public
    //    {
    //        return null;
    //    }

    //    // Get game details from the json object
    //    dynamic jsonData = jsonObject[appId.ToString()].data;

    //    // Release date can come in different formats - account for those
    //    string[] formats = { "MMM d, yyyy", "d MMM, yyyy", "MMM dd, yyyy", "dd MMM, yyyy" };
    //    DateOnly? releaseDate = null;
    //    decimal? initialPrice = null, finalPrice = null;
    //    if (!(bool)jsonData.release_date.coming_soon) // if game is coming soon, it does not have a proper release date
    //    {
    //        releaseDate = DateOnly.ParseExact(jsonData.release_date.date.ToString(), formats,
    //        CultureInfo.InvariantCulture, DateTimeStyles.None);
    //    }
    //    if (!((bool)jsonData.is_free) && jsonData.price_overview is not null)  // game may not have a set price even if it's not free or if not released/set
    //    {
    //        initialPrice = decimal.Parse(jsonData.price_overview.initial.ToString()) / 100;
    //        finalPrice = decimal.Parse(jsonData.price_overview.final.ToString()) / 100;
    //    }

    //    SteamAppDetail steamAppDetails = new()
    //    {
    //        AppId = appId,
    //        Name = jsonData.name,
    //        IsFree = jsonData.is_free,
    //        ReleaseDate = releaseDate,
    //        ShortDescription = jsonData.short_description,
    //        AboutTheGame = jsonData.about_the_game,
    //        InitialPrice = initialPrice,
    //        FinalPrice = finalPrice,
    //        MacSupport = jsonData.platforms.mac,
    //        LinuxSupport = jsonData.platforms.linux,
    //        WindowsSupport = jsonData.platforms.windows,
    //        MetacriticScore = jsonData.metacritic?.score,
    //        MetacriticUrl = jsonData.metacritic?.url,
    //        HeaderImageUrl = jsonData.header_image,
    //        MovieDetails = new List<MovieDetail>(),
    //        ScreenshotDetails = new List<ScreenshotDetail>()
    //    };
    //    foreach (dynamic movie in jsonData.movies)
    //    {
    //        steamAppDetails.MovieDetails.Add(new MovieDetail()
    //        {
    //            ThumbnailUrl = movie.thumbnail,
    //            MinVideoUrl = movie.mp4?["480"],
    //            MaxVideoUrl = movie.mp4?["max"]
    //        });
    //    }

    //    foreach (dynamic screenshot in jsonData.screenshots)
    //    {
    //        steamAppDetails.ScreenshotDetails.Add(new ScreenshotDetail()
    //        {
    //            ThumbnailUrl = screenshot.path_thumbnail,
    //            FullUrl = screenshot.path_full
    //        });
    //    }

    //    return steamAppDetails;
    //}

    public static SteamAppDetail? GetAppDetailsFromJson(string jsonString, bool fromFile, int appId = -1)
    {
        var jsonData = JsonConvert.DeserializeObject<dynamic>(jsonString);
        if (jsonData == null) throw new Exception("JSON string failed to convert to .NET object.");
        if (!fromFile)
        {
            var success = (bool)jsonData[appId.ToString()].success;
            if (success)
                jsonData = jsonData[appId.ToString()].data;
            else
                return null;
        }
        else if (!(bool)jsonData.success)
        {
            return null;
        }

        // Dates can come in all sorts of formats
        string[] formats = { "MMM d, yyyy", "d MMM, yyyy", "MMM yyyy", "MMM, yyyy" };
        DateOnly? releaseDate = null;
        if (jsonData.release_date?.date != null)
            if (DateOnly.TryParseExact(jsonData.release_date.date.ToString(), formats, CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out DateOnly result))
                releaseDate = result;

        decimal? initialPrice = null, finalPrice = null;
        if (!(bool)jsonData.is_free &&
            jsonData.price_overview !=
            null) // game may not have a set price even if it's not free or if not released/set
        {
            initialPrice = decimal.Parse(jsonData.price_overview.initial.ToString()) / 100;
            finalPrice = decimal.Parse(jsonData.price_overview.final.ToString()) / 100;
        }

        SteamAppDetail steamAppDetails = new()
        {
            AppId = jsonData.steam_appid,
            Name = jsonData.name,
            IsFree = jsonData.is_free,
            ReleaseDate = releaseDate,
            ShortDescription = jsonData.short_description,
            AboutTheGame = jsonData.about_the_game,
            InitialPrice = initialPrice,
            FinalPrice = finalPrice,
            MacSupport = jsonData.platforms.mac,
            LinuxSupport = jsonData.platforms.linux,
            WindowsSupport = jsonData.platforms.windows,
            MetacriticScore = jsonData.metacritic == null ? null : jsonData.metacritic.score,
            MetacriticUrl = jsonData.metacritic == null ? null : jsonData.metacritic.url,
            HeaderImageUrl = jsonData.header_image,
            MovieDetails = new List<MovieDetail>(),
            ScreenshotDetails = new List<ScreenshotDetail>()
        };
        if (jsonData.movies != null)
            foreach (var movie in jsonData.movies)
                steamAppDetails.MovieDetails.Add(new MovieDetail()
                {
                    ThumbnailUrl = movie.thumbnail,
                    MinVideoUrl = movie.mp4?["480"],
                    MaxVideoUrl = movie.mp4?["max"],
                    MinVideoWebmUrl = movie.webm?["480"],
                    MaxVideoWebmUrl = movie.webm?["max"]
                });

        if (jsonData.screenshots != null)
            foreach (var screenshot in jsonData.screenshots)
                steamAppDetails.ScreenshotDetails.Add(new ScreenshotDetail()
                {
                    ThumbnailUrl = screenshot.path_thumbnail,
                    FullUrl = screenshot.path_full
                });

        return steamAppDetails;
    }

    public static async Task<List<SteamAppDetail>> GetAppsFromTxt(string filepath)
    {
        using var reader = new StreamReader(filepath, Encoding.UTF8);

        List<SteamAppDetail> appDetails = new();
        string json;
        while ((json = await reader.ReadLineAsync()) != null)
        {
            var appDetail = GetAppDetailsFromJson(json, true);
            if (appDetail != null) appDetails.Add(appDetail);
        }

        return appDetails;
    }

    /// <summary>
    /// Contacts the Steam API to update a list of games' pricing information.
    /// </summary>
    /// <param name="appIds">A list of game IDs from the Steam Store.</param>
    /// <returns>A list of tuples consisting of the Steam App Id, its initial price, and its final price.</returns>
    /// <exception cref="Exception"></exception>
    public static async Task<List<(int appId, decimal? initialPrice, decimal? finalPrice)>> UpdateAppPrices(
        List<int> appIds)
    {
        var answer = new List<(int appId, decimal? InitialPrice, decimal? FinalPrice)>();
        var appIdsCommaSeparated = string.Join(",", appIds);
        var appDetailsEndPoint =
            $"http://store.steampowered.com/api/appdetails?cc=us&filters=price_overview&appids={appIdsCommaSeparated}";

        using var httpClient = new HttpClient();
        var jsonString = await httpClient.GetStringAsync(appDetailsEndPoint);

        var jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
        if (jsonObject == null) throw new Exception("JSON string failed to convert to .NET object.");

        foreach (var appId in appIds)
        {
            var success = (bool)jsonObject[appId.ToString()].success;
            if (!success) // Game info not exposed to the public
            {
                Console.WriteLine($"Game with Steam App Id {appId} does not contain Price Information.");
                answer.Add((appId, null, null));
                continue;
            }

            decimal? initialPrice = null;
            decimal? finalPrice = null;

            try
            {
                // Apps with non-empty price_overview section are not free
                var appPriceDetails = jsonObject[appId.ToString()].data.price_overview;
                if (appPriceDetails != null)
                {
                    initialPrice = decimal.Parse(appPriceDetails["initial"].ToString()) / 100;
                    finalPrice = decimal.Parse(appPriceDetails.final.ToString()) / 100;
                }
            }
            catch (RuntimeBinderException)
            {
                // price_overview does not exist - returns as an array - continue with null prices
            }

            answer.Add((appId, initialPrice, finalPrice));
        }

        return answer;
    }

    /// <summary>
    /// Contacts the Steam API to retrieve information about a particular game.
    /// </summary>
    /// <param name="appId">A game's ID from the Steam Store.</param>
    /// <returns>SteamAppDetail containing information about the game including its movies and screenshots.</returns>
    public static async Task<SteamAppDetail?> GetAppDetails(int appId)
    {
        var appDetailsEndPoint = $"https://store.steampowered.com/api/appdetails?l=english&cc=us&appids={appId}";
        using var httpClient = new HttpClient();
        try
        {
            var jsonString = await httpClient.GetStringAsync(appDetailsEndPoint);


            if (!string.IsNullOrEmpty(jsonString)) return GetAppDetailsFromJson(jsonString, false, appId);

            // No response means too many requests. Wait and try again
            Console.WriteLine("No response, waiting 10 seconds...");
            await Task.Delay(10000);
            Console.WriteLine("Retrying.");
            return await GetAppDetails(appId);
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine("Called Steam API too frequently. Waiting 5 seconds...");
            await Task.Delay(5000);

            // Recursively try again
            return await GetAppDetails(appId);
        }
    }
}