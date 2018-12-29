using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;

using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

public class PingServiceAsync: IPingService {
    Ping ping = new Ping();
    //64bytes
    byte[] buffer = Enumerable
        .Repeat(new byte[]{ 0xDE, 0xAD, 0xBE, 0xEF }, 8)
        .SelectMany(s=>s).ToArray();
        
    int timeout = 1000;
    PingOptions options = new PingOptions(64, true);
    
    public async Task<long> PingAsync(IPAddress ip) {
        long triptime = -1;
        try {
            var reply = await ping.SendPingAsync(ip, timeout, buffer, options);
            if(reply.Status == IPStatus.Success) {
                triptime = reply.RoundtripTime;
            }
        }
        catch(PingException) {
            //TODO: find some way to report this (or not)
        }
        return triptime;
    }
    async Task<IEnumerable<long>> PingConsecutiveAsync(IPAddress ip, int times) {
        List<long> results = new List<long>();
        foreach(var _ in Enumerable.Range(0, times)) {
            results.Add(await PingAsync(ip));
        }
        return results.Where(t => t>=0);
    }
    
    public async Task<IPingTestData> TestConnectionAsync(IPAddress ip, int times) {
        IEnumerable<long> pingReplys = 
            (await PingConsecutiveAsync(ip, times));
        var result = new PingTestData() {
            num = pingReplys.Count()
        };
        if(result.num > 0) {
            result.min = pingReplys.Min();
            result.avg = pingReplys.Sum()/result.num;
            result.max = pingReplys.Max();
        }
        else result.min=result.avg=result.max=0;
        return result;
    }
}

}