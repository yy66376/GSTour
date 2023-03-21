namespace GDTour.Models.Utility
{
    public class EventCreatorDTO
    {
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public int FirstRoundGameCount { get; set; }
        public int GameId { get; set; }
    }
}