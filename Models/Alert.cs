using GDTour.Areas.Identity.Data;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace GDTour.Models;

/// <summary>
/// An alert is a user-tracked game with a set price threshold.
/// </summary>
public class Alert
{
    [Key] public int Id { get; set; }

    public bool IsFulfilled { get; set; } = false;

    [Range(0, 999)] public decimal PriceThreshold { get; set; }
    public decimal? FulFilledPrice { get; set; }

    public bool Email { get; set; }
    public bool Browser { get; set; }

    public DateTime? FulfillDate { get; set; }

    public bool Read { get; set; } = false;

    // Navigation property and foreign key for User
    public string GDTourUserId { get; set; }
    public GDTourUser GDTourUser { get; set; }

    // Navigation property and foreign key for Game
    public int GameId { get; set; }
    public Game Game { get; set; }
}