using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GDTour.Migrations
{
    /// <inheritdoc />
    public partial class SpecifyColumnTypesForMoneyProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "InitialPrice",
                table: "Games",
                type: "smallmoney",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "FinalPrice",
                table: "Games",
                type: "smallmoney",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PriceThreshold",
                table: "Alerts",
                type: "smallmoney",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "FulFilledPrice",
                table: "Alerts",
                type: "smallmoney",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "InitialPrice",
                table: "Games",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "smallmoney",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "FinalPrice",
                table: "Games",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "smallmoney",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "PriceThreshold",
                table: "Alerts",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "smallmoney");

            migrationBuilder.AlterColumn<decimal>(
                name: "FulFilledPrice",
                table: "Alerts",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "smallmoney",
                oldNullable: true);
        }
    }
}
