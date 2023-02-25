namespace GDTour.Models.Utility;

public class AlertDTO
{
    public int Id { get; set; }
    public int GameId { get; set; }
    public decimal PriceThreshold { get; set; }
    public bool Email { get; set; }
    public bool Browser { get; set; }
}