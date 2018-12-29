﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;
using NtwkMonitor.Server.Model;
using System;

namespace NtwkMonitor.Server.Migrations
{
    [DbContext(typeof(NtwkDBContext))]
    partial class NtwkDBContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.0.2-rtm-10011");

            modelBuilder.Entity("NtwkMonitor.Server.Model.NtwkNode", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("IsBlackBox");

                    b.Property<bool>("IsOpenPing");

                    b.Property<bool>("IsOpenSSH");

                    b.Property<bool>("IsOpenTelnet");

                    b.Property<bool>("IsOpenWeb");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<int?>("ParentID");

                    b.Property<int>("Type");

                    b.Property<uint>("ip");

                    b.HasKey("ID");

                    b.HasIndex("ParentID");

                    b.ToTable("Nodes");
                });

            modelBuilder.Entity("NtwkMonitor.Server.Model.NtwkNode", b =>
                {
                    b.HasOne("NtwkMonitor.Server.Model.NtwkNode", "Parent")
                        .WithMany("Children")
                        .HasForeignKey("ParentID");
                });
#pragma warning restore 612, 618
        }
    }
}