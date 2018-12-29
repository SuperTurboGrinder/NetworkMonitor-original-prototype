using System.Net;

using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

class CustomAppTelnetService : CustomAppInvoker, ITelnetService {
    public CustomAppTelnetService() : base("telnet") {}
}

}