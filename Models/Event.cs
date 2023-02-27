using GDTour.Areas.Identity.Data;
using Newtonsoft.Json;
using NuGet.Protocol.Core.Types;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GDTour.Models;

[Table("Events")]
public class Event
{
    [Key]
    [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Name { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public int ParticipantsPerGame { get; set; }
    public int FirstRoundGameCount { get; set; }
    public string? BracketJson { get; set; } = null;

    // Navigational Properties
    [System.Text.Json.Serialization.JsonIgnore]
    public int GameId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public Game Game { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public string OrganizerId { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public GDTourUser Organizer { get; set; }

    [NotMapped]
    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<GDTourUser> Participants { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<UserEvent> UserEvents { get; set; }
}