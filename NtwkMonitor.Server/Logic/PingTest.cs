using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic {
    
public class PingTestData : IPingTestData {
    public int num { get;set; } = 0;
    public long min { get;set; } = -1;
    public long avg { get;set; } = 0;
    public long max { get;set; } = 0;
}

}