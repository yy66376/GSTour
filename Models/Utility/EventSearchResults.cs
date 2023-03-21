using GDTour.Models.Utility;

public class EventSearchResults
{
    public int Count { get; set; }
    public IEnumerable<EventSearchDto> Items { get; set; }
}