using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

class CustomAppSSHService : CustomAppInvoker, ISSHService {
    public CustomAppSSHService() : base("ssh") {}
}

}