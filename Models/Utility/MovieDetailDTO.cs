namespace GDTour.Models.Utility;

public record MovieDetailDTO
{
    public int Id { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? MinVideoUrl { get; set; }
    public string? MaxVideoUrl { get; set; }
    public string? MinVideoWebmUrl { get; set; }
    public string? MaxVideoWebmUrl { get; set; }
}