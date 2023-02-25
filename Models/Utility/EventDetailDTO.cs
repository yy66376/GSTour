﻿using GDTour.Areas.Identity.Data;
using System.ComponentModel.DataAnnotations.Schema;

namespace GDTour.Models.Utility
{
    public class EventDetailDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public int ParticipantsPerGame { get; set; }
        public int FirstRoundGameCount { get; set; }
        public string HeaderImageUrl { get; set; }

        public int GameId { get; set; }
        public Game Game { get; set; }
        public string OrganizerId { get; set; }
        public GDTourUser Organizer { get; set; }
        public String[] Participants { get; set; }
    }
}