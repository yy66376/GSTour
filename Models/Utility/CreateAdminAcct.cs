using Duende.IdentityServer.EntityFramework.Options;
using GDTour.Areas.Identity.Data;
using GDTour.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GDTour.Models.Utility;

public static class CreateAdminAcct
{
    private const string AdministratorsRole = "ADMIN_ROLE";

    public static async Task Initialize(IServiceProvider serviceProvider, string adminPassword)
    {
        await using var context = new GDTourContext(
            serviceProvider.GetRequiredService<DbContextOptions<GDTourContext>>(),
            serviceProvider.GetRequiredService<IOptions<OperationalStoreOptions>>());

        const string adminUsername = "admin@gstour.com";
        var adminUserId = await EnsureUser(serviceProvider, adminUsername, adminPassword);
        await EnsureRole(serviceProvider, adminUserId, AdministratorsRole);
    }

    /// <summary>
    /// Ensures that an admin account with the specified username and password is created.
    /// </summary>
    /// <param name="serviceProvider"></param>
    /// <param name="adminUsername"></param>
    /// <param name="adminPassword"></param>
    /// <returns>The created/existing admin account's ID.</returns>
    /// <exception cref="Exception"></exception>
    private static async Task<string> EnsureUser(IServiceProvider serviceProvider,
        string adminUsername, string adminPassword)
    {
        var userManager = serviceProvider.GetService<UserManager<GDTourUser>>();
        if (userManager == null)
        {
            throw new Exception("userManager is null");
        }

        // Create admin user if it does not exist
        var user = await userManager.FindByNameAsync(adminUsername);
        if (user == null)
        {
            user = new GDTourUser
            {
                FirstName = "GSTour",
                LastName = "Admin",
                UserName = adminUsername,
                EmailConfirmed = true
            };
            await userManager.CreateAsync(user, adminPassword);
        }

        if (user == null)
        {
            throw new Exception("The password is probably not strong enough!");
        }

        return user.Id;
    }

    /// <summary>
    /// Ensures that the admin role is created.
    /// </summary>
    /// <param name="serviceProvider"></param>
    /// <param name="adminUserId"></param>
    /// <param name="adminRole"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    private static async Task EnsureRole(IServiceProvider serviceProvider,
        string adminUserId, string adminRole)
    {
        var roleManager = serviceProvider.GetService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetService<UserManager<GDTourUser>>();

        if (roleManager == null)
        {
            throw new Exception("roleManager is null");
        }

        if (userManager == null)
        {
            throw new Exception("userManager is null");
        }

        // Create admin role if it does not exist
        IdentityResult ir;
        if (!await roleManager.RoleExistsAsync(adminRole))
        {
            ir = await roleManager.CreateAsync(new IdentityRole(adminRole));
            if (!ir.Succeeded)
            {
                throw new Exception("Failed to create admin role.");
            }
        }

        var user = await userManager.FindByIdAsync(adminUserId);

        if (user == null)
        {
            throw new Exception("The adminPassword password was probably not strong enough!");
        }

        ir = await userManager.AddToRoleAsync(user, adminRole);
        if (!ir.Succeeded)
        {
            throw new Exception("Failed to add admin account to admin role.");
        }
    }
}