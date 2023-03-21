using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Hubs;
using GDTour.Models;
using GDTour.Models.Repositories;
using GDTour.Models.Utility;
using GDTour.Services.Email;
using GDTour.Services.Quartz.Jobs;
using GDTour.Services.SignalR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Quartz;
using SteamPriceTracker.Settings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<GDTourContext>(options =>
{
    options.UseSqlServer(connectionString, sqlServerOptions => sqlServerOptions.CommandTimeout(60));
    options.EnableSensitiveDataLogging();
});

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services
    .AddDefaultIdentity<GDTourUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<GDTourContext>();
builder.Services.AddIdentityServer().AddApiAuthorization<GDTourUser, GDTourContext>();
builder.Services.AddAuthentication().AddIdentityServerJwt();
builder.Services.TryAddEnumerable(
    ServiceDescriptor.Singleton<IPostConfigureOptions<JwtBearerOptions>,
        ConfigureJwtBearerOptions>());

// Configure Email
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddTransient<IEmailSender, MailService>();
builder.Services.AddScoped<IRazorViewToStringRenderer, RazorViewToStringRenderer>();

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, NameIdentifierBasedUserIdProvider>();

// Add Quartz Scheduling
builder.Services.AddQuartz(q =>
{
    q.UseMicrosoftDependencyInjectionJobFactory();

    // Create a "key" for the price update job
    var priceUpdateJobKey = new JobKey("PriceUpdateJob");

    // Register the job with the DI container
    q.AddJob<SteamApiPriceUpdateJob>(opts => opts.WithIdentity(priceUpdateJobKey));

    // Create a trigger for the job
    q.AddTrigger(opts => opts
        .ForJob(priceUpdateJobKey) // link to the price update job
        .WithIdentity("PriceUpdateJob-trigger") // give the trigger a unique name
        .WithCronSchedule("30 12 13 * * ?")); // run at 6am everyday

    // Create a "key" for the game update job
    var gameUpdateJobKey = new JobKey("GameUpdateJob");

    // Register the job with the DI container
    q.AddJob<SteamSpyApiUpdateJob>(opts => opts.WithIdentity(gameUpdateJobKey));

    // Create a trigger for the job
    q.AddTrigger(opts => opts
        .ForJob(gameUpdateJobKey) // link to game update job
        .WithIdentity("GameUpdateJob-trigger") // give the trigger a unique name
        .WithCronSchedule("0 0 0 1 * ? *")); // run the 1st day of every month
});

builder.Services.AddQuartzHostedService(opt => { opt.WaitForJobsToComplete = true; });

// Register repositories
builder.Services.AddScoped<IGamesRepository, GamesRepository>();
builder.Services.AddScoped<IEventsRepository, EventsRepository>();

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedData.Initialize(services);
}

// Create admin account
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var adminPassword = builder.Configuration.GetValue<string>("AdminAcctPW");
    if (adminPassword == null)
    {
        throw new Exception("You must set an admin password with the name \"AdminAcctPW\"");
    }
    await CreateAdminAcct.Initialize(services, adminPassword);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
{
    app.UseHsts();
}


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute("default", "{controller}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<EventHub>("/hubs/events");
app.MapHub<BracketHub>("/hubs/brackets");

app.MapFallbackToFile("index.html");

app.Run();