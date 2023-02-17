using System.ComponentModel.DataAnnotations;

namespace GDTour.Models;

public class Screenshot
{
    [Key] public int Id { get; set; }
    public string? FullUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    public int GameId { get; set; }
    public Game Game { get; set; }
}