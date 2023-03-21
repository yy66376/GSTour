namespace GDTour.Models.Utility;

public record EventPageDTO
{
    public int PageIndex { get; set; }
    public int TotalPages { get; set; }

    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }

    public int TotalResults { get; set; }
    public EventListDTO[] Events { get; set; }
}