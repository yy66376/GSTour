using GDTour.Models;

public class SearchResults<T>
{
    public int Count { get; set; }
    public IEnumerable<T> Items { get; set; }
}