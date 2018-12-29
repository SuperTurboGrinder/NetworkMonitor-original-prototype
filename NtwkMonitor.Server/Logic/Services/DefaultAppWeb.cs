using System.Net;
using System.Diagnostics;
using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

class DefaultAppWebService : IWebService {
    public void StartApplication(string domain) {
        var psi = new ProcessStartInfo(
            $"http://{domain}:8080"
        ){
            UseShellExecute = true,
        };
        Process.Start(psi);
    }
}

}