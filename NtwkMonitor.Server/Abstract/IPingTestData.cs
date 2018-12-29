namespace NtwkMonitor.Server.Abstract {

public interface IPingTestData {
    int num { get;set; }
    long min { get;set; }
    long avg { get;set; }
    long max { get;set; }
}

}