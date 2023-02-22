namespace GDTour.Models.Utility;

public class AlertDetailDTO
{
    public int Id { get; set; }
    public bool IsFulfilled { get; set; } = false;
    public decimal PriceThreshold { get; set; }
    public decimal? FulFilledPrice { get; set; }
    public bool Email { get; set; }
    public bool Browser { get; set; }
    public DateTime? FulfillDate { get; set; }
    public bool Read { get; set; } = false;
    public int GameId { get; set; }
    public GameAlertDTO Game { get; set; }
}