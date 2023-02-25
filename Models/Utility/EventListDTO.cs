namespace GDTour.Models.Utility
{
    public class EventListDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string OrganizerName { get; set; }
        public string OrganizerId { get; set; }
        public string HeaderImageUrl { get; set; }
    }
}
