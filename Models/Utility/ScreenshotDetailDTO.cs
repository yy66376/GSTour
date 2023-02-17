namespace GDTour.Models.Utility;

public record ScreenshotDetailDTO
{
    public int Id { get; set; }
    public string? FullUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
}