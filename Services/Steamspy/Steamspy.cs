using GDTour.Services.Steam;
using Newtonsoft.Json;

namespace GDTour.Services.Steamspy;

public static class Steamspy
{
    public static async Task<List<int>> GetAppIdsFromApi(int page)
    {
        var answer = new List<int>();
        var steamspyAllAPIEndPoint = $"https://steamspy.com/api.php?request=all&page={page}";
        using var httpClient = new HttpClient();
        try
        {
            var jsonString = await httpClient.GetStringAsync(steamspyAllAPIEndPoint);
            var jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonString);
            if (jsonObject == null) throw new Exception("JSON string failed to convert to .NET object.");
            try
            {
                foreach (var game in jsonObject) answer.Add(int.Parse(game.Name));
            }
            catch (Exception e)
            {
                Console.WriteLine($"Invalid game id retrieved from Steamspy");
            }
        }
        catch (HttpRequestException)
        {
            Console.WriteLine("No more games from Steamspy.");
        }

        return answer;
    }
}