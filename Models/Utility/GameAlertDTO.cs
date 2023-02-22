namespace GDTour.Models.Utility;

public record GameAlertDTO
{
    public int Id { get; set; }
    public decimal? InitialPrice { get; set; }
    public decimal? FinalPrice { get; set; }
    public int SteamId { get; set; }
    public bool IsFree { get; set; }
    public string Name { get; set; }
    public string? HeaderImageUrl { get; set; }
}