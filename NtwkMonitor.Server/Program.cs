using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

using NtwkMonitor.Server.Model;
using NtwkMonitor.Server.Logic;

namespace NtwkMonitor.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //get rid of slow first request
            //quick and dirty way
            if(args.Any(arg => arg=="--warmup")) {
                var client = new HttpClient();
                string hostname = "http://localhost:5000";
                string path = hostname + "/nodes/data/all";
                Console.WriteLine($"Warmup request to: {path}");
                try{
                    client.GetStringAsync(path).Wait();
                }
                catch (Exception ex) {
                    Console.WriteLine("Unable to send warmup request.");
                    Console.WriteLine(ex.Message);
                }
            }
            else {
                var host = BuildWebHost(args);
                try {
                    var psi = new ProcessStartInfo(@".\NtwkMonitor.Server.exe", "--warmup"){
                        UseShellExecute = true,
                    };
                    Process.Start(psi);
                }
                catch (Exception ex) {
                    Console.WriteLine("Unable to start warmup process.");
                    Console.WriteLine(ex.Message);
                }
                host.Run();
            }
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
