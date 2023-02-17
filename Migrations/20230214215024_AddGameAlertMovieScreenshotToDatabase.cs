using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GDTour.Migrations
{
    /// <inheritdoc />
    public partial class AddGameAlertMovieScreenshotToDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SteamId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsFree = table.Column<bool>(type: "bit", nullable: false),
                    ReleaseDate = table.Column<DateTime>(type: "date", nullable: true),
                    ShortDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AboutTheGame = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InitialPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WindowsSupport = table.Column<bool>(type: "bit", nullable: false),
                    LinuxSupport = table.Column<bool>(type: "bit", nullable: false),
                    MacSupport = table.Column<bool>(type: "bit", nullable: false),
                    MetacriticScore = table.Column<int>(type: "int", nullable: true),
                    MetacriticUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HeaderImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IsFulfilled = table.Column<bool>(type: "bit", nullable: false),
                    PriceThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FulFilledPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Email = table.Column<bool>(type: "bit", nullable: false),
                    Browser = table.Column<bool>(type: "bit", nullable: false),
                    FulfillDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Read = table.Column<bool>(type: "bit", nullable: false),
                    GDTourUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    GameId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alerts_AspNetUsers_GDTourUserId",
                        column: x => x.GDTourUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Alerts_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Movies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MinVideoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxVideoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GameId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Movies_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Screenshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GameId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Screenshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Screenshots_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_GameId",
                table: "Alerts",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_GDTourUserId",
                table: "Alerts",
                column: "GDTourUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Movies_GameId",
                table: "Movies",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Screenshots_GameId",
                table: "Screenshots",
                column: "GameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropTable(
                name: "Movies");

            migrationBuilder.DropTable(
                name: "Screenshots");

            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "AspNetUsers");
        }
    }
}
