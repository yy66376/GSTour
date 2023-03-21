using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GDTour.Migrations
{
    /// <inheritdoc />
    public partial class ReconfigureRelationshipBetweenUserAndEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_OrganizerId",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEvents_AspNetUsers_ParticipantId",
                table: "UserEvents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents");

            migrationBuilder.DropIndex(
                name: "IX_UserEvents_ParticipantId",
                table: "UserEvents");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "UserEvents");

            migrationBuilder.RenameColumn(
                name: "ParticipantId",
                table: "UserEvents",
                newName: "ParticipantsId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "UserEvents",
                newName: "ParticipatingEventsId");

            migrationBuilder.RenameIndex(
                name: "IX_UserEvents_EventId",
                table: "UserEvents",
                newName: "IX_UserEvents_ParticipatingEventsId");

            migrationBuilder.AlterColumn<string>(
                name: "OrganizerId",
                table: "Events",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents",
                columns: new[] { "ParticipantsId", "ParticipatingEventsId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_OrganizerId",
                table: "Events",
                column: "OrganizerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEvents_AspNetUsers_ParticipantsId",
                table: "UserEvents",
                column: "ParticipantsId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEvents_Events_ParticipatingEventsId",
                table: "UserEvents",
                column: "ParticipatingEventsId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_OrganizerId",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEvents_AspNetUsers_ParticipantsId",
                table: "UserEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEvents_Events_ParticipatingEventsId",
                table: "UserEvents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents");

            migrationBuilder.RenameColumn(
                name: "ParticipatingEventsId",
                table: "UserEvents",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "ParticipantsId",
                table: "UserEvents",
                newName: "ParticipantId");

            migrationBuilder.RenameIndex(
                name: "IX_UserEvents_ParticipatingEventsId",
                table: "UserEvents",
                newName: "IX_UserEvents_EventId");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "UserEvents",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<string>(
                name: "OrganizerId",
                table: "Events",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserEvents",
                table: "UserEvents",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvents_ParticipantId",
                table: "UserEvents",
                column: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_OrganizerId",
                table: "Events",
                column: "OrganizerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEvents_AspNetUsers_ParticipantId",
                table: "UserEvents",
                column: "ParticipantId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
