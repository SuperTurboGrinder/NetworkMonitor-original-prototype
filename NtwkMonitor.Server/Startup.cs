using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

using NtwkMonitor.Server.Model;
using NtwkMonitor.Server.Logic.Services;
using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration) {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services.AddCors();
            services.AddDbContext<NtwkDBContext>(options =>
                options.UseSqlite(Configuration.GetConnectionString("NtwkDBConnection"))
            );
            services.AddScoped<IPingService, PingServiceAsync>();
            services.AddScoped<INtwkDBRepository, NtwkDBRepository>();
            services.AddScoped<IReadOnlyNtwkDBRepository, NtwkDBRepository>();
            services.AddTransient<ITelnetService, CustomAppTelnetService>();
            services.AddTransient<ISSHService, CustomAppSSHService>();
            services.AddTransient<IWebService, DefaultAppWebService>();
            services.AddTransient<ISoundService, ConsoleBeepSoundService>();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            DefaultFilesOptions dfOptions = new DefaultFilesOptions();
            dfOptions.DefaultFileNames.Clear();
            dfOptions.DefaultFileNames.Add("index.html");

            //redirect all 404 routes to static index.html
            app.Use(async (context, next) => {
                await next();
                if(context.Response.StatusCode == 404 &&
                !Path.HasExtension(context.Request.Path.Value)){
                    context.Request.Path="/index.html";
                    await next();
                }
            });

            app.UseCors(options => options
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
            );
            app.UseDefaultFiles(dfOptions);
            app.UseStaticFiles();
            app.UseMvc();
        }
    }
}
