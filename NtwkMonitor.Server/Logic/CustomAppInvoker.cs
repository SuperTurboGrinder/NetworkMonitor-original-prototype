using System.Net;
using System.Diagnostics;

namespace NtwkMonitor.Server.Logic {

public class CustomAppInvoker {
    string servicePath;
    public CustomAppInvoker(string executableName) {
        servicePath = $".\\bin\\{executableName}.exe";
    }

    public void StartApplication(string arguments) {
        var psi = new ProcessStartInfo(servicePath, arguments){
            UseShellExecute = true,
        };
        Process.Start(psi);
    }
}

}