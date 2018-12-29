using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using NtwkMonitor.Server.Model;

namespace NtwkMonitor.Server.Model {

public class NtwkDBContext : DbContext {
    public DbSet<NtwkNode> Nodes { get; set; }

    public NtwkDBContext(DbContextOptions<NtwkDBContext> options) : base(options) {
        
    }
}

}