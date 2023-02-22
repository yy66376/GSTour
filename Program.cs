using GDTour.Areas.Identity.Data;
using GDTour.Data;
using GDTour.Hubs;
using GDTour.Models;
using GDTour.Services.Email;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
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
    .AddEntityFrameworkStores<GDTourContext>();
builder.Services.AddIdentityServer().AddApiAuthorization<GDTourUser, GDTourContext>();
builder.Services.AddAuthentication().AddIdentityServerJwt();

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

//builder.Services.AddCors(options =>
//    options.AddPolicy("ClientPermission",
//        policy =>
//        {
//            policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:44435/").AllowCredentials();
//        }));

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedData.Initialize(services);
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

//app.UseCors("ClientPermission");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

app.MapControllerRoute("default", "{controller}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapHub<NotificationHub>("/hubs/notifications");

app.MapFallbackToFile("index.html");

app.Run();