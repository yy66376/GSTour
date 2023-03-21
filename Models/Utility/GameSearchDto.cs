namespace GDTour.Models.Utility;

public record GameSearchDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? HeaderImageUrl { get; set; }
    public decimal? FinalPrice { get; set; }
}