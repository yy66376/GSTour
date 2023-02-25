namespace GDTour.Models.Email;

public record PriceAlertEmailViewModel(string UserName, string GameName, string GameHeaderImageUrl, string GameUrl,
    decimal PriceThreshold,
    decimal FinalPrice);