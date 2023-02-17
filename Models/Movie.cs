using System.ComponentModel.DataAnnotations;

namespace GDTour.Models;

public class Movie
{
    [Key] public int Id { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? MinVideoUrl { get; set; }
    public string? MaxVideoUrl { get; set; }

    public int GameId { get; set; }
    public Game Game { get; set; }
}