namespace GDTour.Services.Steam;

public class SteamAppDetail
{
    public uint AppId { get; set; }
    public string? Name { get; set; }
    public bool IsFree { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public string? ShortDescription { get; set; }
    public string? AboutTheGame { get; set; }
    public decimal? InitialPrice { get; set; }
    public decimal? FinalPrice { get; set; }
    public bool MacSupport { get; set; }
    public bool LinuxSupport { get; set; }
    public bool WindowsSupport { get; set; }
    public int? MetacriticScore { get; set; }
    public string? MetacriticUrl { get; set; }
    public string? HeaderImageUrl { get; set; }
    public List<MovieDetail> MovieDetails { get; set; }
    public List<ScreenshotDetail> ScreenshotDetails { get; set; }

    public override string ToString()
    {
        return $$"""
                   App Id: {{AppId}}
                   Name: {{Name}}
                   Is Free: {{IsFree}}
                   Release Date: {{ReleaseDate}}
                   Short Description: {{ShortDescription}}
                   About the Game: {{AboutTheGame}}
                   Initial Price: {{InitialPrice}}
                   Final Price: {{FinalPrice}}
                   Mac Support: {{MacSupport}}
                   Linux Support: {{LinuxSupport}}
                   Windows Support: {{WindowsSupport}}
                   Metacritic Score: {{MetacriticScore}}
                   Metacritic URL: {{MetacriticUrl}}
                   Header Image URL: {{HeaderImageUrl}}
                   Number of Movies: {{MovieDetails.Count}}
                   Number of Screenshots: {{ScreenshotDetails.Count}}
                   """;
    }
}