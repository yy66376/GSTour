using GDTour.Models;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GDTour.Areas.Identity.Data;

// Add profile data for application users by adding properties to the GDTourUser class
public class GDTourUser : IdentityUser
{
    [PersonalData] public string FirstName { get; set; }

    [PersonalData] public string LastName { get; set; }

    public ICollection<Alert> Alerts { get; set; }
}