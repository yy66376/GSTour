using GDTour.Areas.Identity.Data;
using GDTour.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GDTour.Models
{
    [Table("UserEvents")]
    public class UserEvent
    {
        [Key]
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        //Navigation property and forgeign key for User
        public string ParticipantId { get; set; }
        public GDTourUser Participant { get; set; }

        //Navigation property and forgeign key for Event
        public int EventId { get; set; }
        public Event Event { get; set; }

    }
}
