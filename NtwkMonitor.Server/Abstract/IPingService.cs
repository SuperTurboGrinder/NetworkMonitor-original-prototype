using System.Net;
using System.Threading.Tasks;

namespace NtwkMonitor.Server.Abstract {

public interface IPingService {
    Task<long> PingAsync(IPAddress ip);
    Task<IPingTestData> TestConnectionAsync(IPAddress ip, int times);
}

}