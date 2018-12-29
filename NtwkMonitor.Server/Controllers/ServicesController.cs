using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;

using NtwkMonitor.Server.Exceptions;
using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Controllers {

[Route("nodes")]
public class ServicesController : Controller {
    readonly IReadOnlyNtwkDBRepository repo;

    public ServicesController(IReadOnlyNtwkDBRepository dbRepository) {
        repo = dbRepository;
    }

    //for ping
    [NonAction]
    T_IP IPOrBadRequest<T_IP>(
        out IActionResult badRequest,
        Func<T_IP> repoIPGetter
    ) where T_IP:class {
        T_IP addr = null;
        badRequest = null;
        try {
            addr = repoIPGetter();
        }
        catch(InvalidClientDataException ex) {
            badRequest = BadRequest(ex.Message);
        }
        return addr;
    }

    [NonAction]
    public IActionResult AppServiceOrBadRequest(
        int id,
        AppServiceTypes serviceType,
        IApplicationService service
    ){
        IActionResult badRequest = null;
        var addr = IPOrBadRequest(
            out badRequest,
            () => repo.GetNodeIPForAppService(id, serviceType)
        );
        if(badRequest != null) return badRequest;
        service.StartApplication(addr);
        return Ok();
    }

    [HttpGet("{id:int}/telnet")]
    public IActionResult StartTelnet(int id, [FromServices] ITelnetService telnet) {
        return AppServiceOrBadRequest(
            id,
            AppServiceTypes.Telnet,
            telnet
        );
    }

    [HttpGet("{id:int}/ssh")]
    public IActionResult StartSSH(int id, [FromServices] ISSHService ssh) {
        return AppServiceOrBadRequest(
            id,
            AppServiceTypes.SSH,
            ssh
        );
    }

    [HttpGet("{id:int}/web")]
    public IActionResult StartWeb(int id, [FromServices] IWebService web) {
        return AppServiceOrBadRequest(
            id,
            AppServiceTypes.Web,
            web
        );
    }

    [HttpGet("{id:int}/ping")]
    public async Task<IActionResult> GetPingAsync(int id, [FromServices] IPingService ping) {
        IActionResult badRequest = null;
        var addr = IPOrBadRequest(
            out badRequest,
            () => repo.GetNodeIPForPing(id)
        );
        
        if(badRequest != null) return badRequest;
        return Ok(await ping.TestConnectionAsync(addr, 4));
    }

    [HttpGet("~/beep")]
    public void Beep([FromServices]ISoundService sound) {
        sound.PlaySound();
    }
}

}