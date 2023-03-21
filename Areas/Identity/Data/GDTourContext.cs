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
    public GDTourContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
        : base(options, operationalStoreOptions)
    {
    }

    public DbSet<Game> Games { get; set; }
    public DbSet<Movie> Movies { get; set; }
    public DbSet<Screenshot> Screenshots { get; set; }
    public DbSet<Alert> Alerts { get; set; }
    public DbSet<GDTourUser> GDTourUsers { get; set; }
    public DbSet<Event> Events { get; set; }

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
        
        // specify money column type for decimal properties
        builder.Entity<Alert>(b =>
        {
            b.Property(alert => alert.FulFilledPrice)
                .HasColumnType("smallmoney");
            b.Property(alert => alert.PriceThreshold)
                .HasColumnType("smallmoney");
        });
        builder.Entity<Game>(b =>
        {
            b.Property(game => game.InitialPrice)
                .HasColumnType("smallmoney");
            b.Property(game => game.FinalPrice)
                .HasColumnType("smallmoney");
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

        // configure one-to-many relationship between user (organizer) and event
        builder.Entity<GDTourUser>()
            .HasMany<Event>(u => u.OrganizedEvents)
            .WithOne(e => e.Organizer)
            .HasForeignKey(ev => ev.OrganizerId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // configure many-to-many relationship between users (participants) and events
        builder.Entity<GDTourUser>()
            .HasMany<Event>(u => u.ParticipatingEvents)
            .WithMany(e => e.Participants)
            .UsingEntity(j => j.ToTable("UserEvents"));

        //configure one-to-many relationship between game and event
        builder.Entity<Game>()
            .HasMany<Event>(g => g.Events)
            .WithOne(e => e.Game)
            .HasForeignKey(ev => ev.GameId)
            .OnDelete(DeleteBehavior.Cascade);
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
}