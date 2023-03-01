using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GDTour.Migrations
{
    /// <inheritdoc />
    public partial class AddWebmVideoToMovies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaxVideoWebmUrl",
                table: "Movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MinVideoWebmUrl",
                table: "Movies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxVideoWebmUrl",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "MinVideoWebmUrl",
                table: "Movies");
        }
    }
}
