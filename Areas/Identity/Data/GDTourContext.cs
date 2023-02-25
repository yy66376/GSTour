using Duende.IdentityServer.EntityFramework.Options;
using GDTour.Areas.Identity.Data;
using GDTour.Models;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Options;

namespace GDTour.Data;

public class GDTourContext : ApiAuthorizationDbContext<GDTourUser>
{
    public DbSet<Game> Games { get; set; }
    public DbSet<Movie> Movies { get; set; }
    public DbSet<Screenshot> Screenshots { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<GDTourUser> GDTourUsers { get; set; }
    public DbSet<UserEvent> UserEvents { get; set; }

    public GDTourContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
        : base(options, operationalStoreOptions)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example, you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);

        // Add converter for Release Date column
        builder.Entity<Game>(b =>
        {
            b.Property(game => game.ReleaseDate)
                .HasConversion<DateOnlyConverter, DateOnlyComparer>()
                .HasColumnType("date");
        });

        // configure one-to-many relationship between game and movies
        builder.Entity<Game>()
            .HasMany(g => g.Movies)
            .WithOne(m => m.Game)
            .HasForeignKey(m => m.GameId);

        // configure one-to-many relationship between game and screenshots
        builder.Entity<Game>()
            .HasMany(g => g.Screenshots)
            .WithOne(m => m.Game)
            .HasForeignKey(m => m.GameId);

        // configure one-to-many relationship between user and alerts
        builder.Entity<GDTourUser>()
            .HasMany(u => u.Alerts)
            .WithOne(a => a.GDTourUser)
            .HasForeignKey(a => a.GDTourUserId);

        // configure one-to-many relationship between game and alerts
        builder.Entity<Game>()
            .HasMany(g => g.Alerts)
            .WithOne(a => a.Game)
            .HasForeignKey(a => a.GameId);

        //configure many to many relationship between user and events
        builder.Entity<UserEvent>()
            .HasOne<GDTourUser>(ue => ue.Participant)
            .WithMany(user => user.UserEvents)
            .HasForeignKey(ue => ue.ParticipantId);
        builder.Entity<UserEvent>()
            .HasOne<Event>(ue => ue.Event)
            .WithMany(ev => ev.UserEvents)
            .HasForeignKey(ue => ue.EventId);

        //configure one-to-many relationship between user and event
        builder.Entity<Event>()
            .HasOne<GDTourUser>(ev => ev.Organizer)
            .WithMany(use => use.OrganizedEvents)
            .HasForeignKey(ev => ev.OrganizerId)
            .HasPrincipalKey(use => use.Id);

        //configure one-to-many relationship between game and event
        builder.Entity<Event>()
            .HasOne<Game>(ev => ev.Game)
            .WithMany(g => g.Events)
            .HasForeignKey(ev => ev.GameId);
    }

    public class DateOnlyConverter : ValueConverter<DateOnly, DateTime>
    {
        public DateOnlyConverter() : base(
            dateOnly => dateOnly.ToDateTime(TimeOnly.MinValue),
            dateTime => DateOnly.FromDateTime(dateTime))
        {
        }
    }

    public class DateOnlyComparer : ValueComparer<DateOnly>
    {
        public DateOnlyComparer() : base(
            (d1, d2) => d1.DayNumber == d2.DayNumber,
            d => d.GetHashCode())
        {
        }
    }

    public DbSet<GDTour.Models.Event> Event { get; set; } = default!;
}