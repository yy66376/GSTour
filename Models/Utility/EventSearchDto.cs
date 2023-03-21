namespace GDTour.Models.Utility;

public record EventSearchDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string HeaderImageUrl { get; set; }
    public DateTime Date { get; set; }
}