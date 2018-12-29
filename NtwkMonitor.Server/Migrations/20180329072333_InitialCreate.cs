using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace NtwkMonitor.Server.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Nodes",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IsBlackBox = table.Column<bool>(nullable: false),
                    IsOpenPing = table.Column<bool>(nullable: false),
                    IsOpenSSH = table.Column<bool>(nullable: false),
                    IsOpenTelnet = table.Column<bool>(nullable: false),
                    IsOpenWeb = table.Column<bool>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    ParentID = table.Column<int>(nullable: true),
                    Type = table.Column<int>(nullable: false),
                    ip = table.Column<uint>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nodes", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Nodes_Nodes_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Nodes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_ParentID",
                table: "Nodes",
                column: "ParentID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nodes");
        }
    }
}
