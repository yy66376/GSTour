﻿using GDTour.Areas.Identity.Data;
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
    public DateTime CreationDateTime { get; set; } = DateTime.Now;

    // Navigational Properties
    public int GameId { get; set; }
    public Game Game { get; set; }

    public string? OrganizerId { get; set; }
    public GDTourUser? Organizer { get; set; }
    public ICollection<GDTourUser> Participants { get; set; }
}