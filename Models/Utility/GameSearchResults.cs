using GDTour.Models.Utility;

public class GameSearchResults
{
    public int Count { get; set; }
    public IEnumerable<GameSearchDto> Items { get; set; }
}