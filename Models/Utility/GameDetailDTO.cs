namespace GDTour.Models.Utility;

public record GameDetailDTO
{
    public int Id { get; set; }
    public int SteamId { get; set; }
    public string? Name { get; set; }
    public bool IsFree { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public string? ShortDescription { get; set; }
    public string? AboutTheGame { get; set; }
    public decimal? InitialPrice { get; set; }
    public decimal? FinalPrice { get; set; }
    public bool WindowsSupport { get; set; }
    public bool LinuxSupport { get; set; }
    public bool MacSupport { get; set; }
    public int? MetacriticScore { get; set; }
    public string? MetacriticUrl { get; set; }
    public string? HeaderImageUrl { get; set; }
    public MovieDetailDTO[] Movies { get; set; }
    public ScreenshotDetailDTO[] Screenshots { get; set; }
}