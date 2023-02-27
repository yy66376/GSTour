using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GDTour.Migrations
{
    /// <inheritdoc />
    public partial class AddBracketJsonToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Events_EventId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_EventId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "BracketJson",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BracketJson",
                table: "Events");

            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EventId",
                table: "AspNetUsers",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Events_EventId",
                table: "AspNetUsers",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id");
        }
    }
}
