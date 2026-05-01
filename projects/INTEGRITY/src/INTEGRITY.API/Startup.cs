using INTEGRITY.API.Data;
using INTEGRITY.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

namespace INTEGRITY.API
{
    /// <summary>
    /// Application startup and configuration
    /// Configures dependency injection, middleware pipeline, and services
    /// </summary>
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Configures all services (Dependency Injection)
        /// Called by runtime BEFORE ConfigureMiddleware
        /// </summary>
        public void ConfigureServices(IServiceCollection services)
        {
            // 1. Database Configuration
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<IntegrityDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions => 
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelaySeconds: 10,
                        errorNumbersToAdd: null);
                }));

            // 2. Redis Caching Configuration
            var redisConnection = _configuration.GetConnectionString("Redis");
            if (!string.IsNullOrEmpty(redisConnection))
            {
                services.AddStackExchangeRedisCache(options =>
                    options.Configuration = redisConnection);
            }
            else
            {
                services.AddMemoryCache(); // Fallback to in-memory cache for local development
            }

            // 3. Repository Pattern & Unit of Work
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // 4. Business Services
            services.AddScoped<IHeatMapService, HeatMapService>();
            services.AddScoped<ITestSelectionService, TestSelectionService>();
            services.AddScoped<IRiskAssessmentService, RiskAssessmentService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IAuditService, AuditService>();

            // 5. Authentication & Authorization
            services.AddAuthentication("Bearer")
                .AddJwtBearer(options =>
                {
                    options.Authority = _configuration["Auth:Authority"];
                    options.Audience = _configuration["Auth:Audience"];
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("TeamLead", policy => policy.RequireRole("Admin", "ProjectManager"));
                options.AddPolicy("DeveloperAndAbove", policy =>
                    policy.RequireRole("Admin", "ProjectManager", "Developer", "QA"));
            });

            // 6. Controllers & API Documentation
            services.AddControllers();
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "INTEGRITY API",
                    Version = "v1",
                    Description = "Intelligent test selection, risk assessment, and quality analytics platform",
                    Contact = new OpenApiContact
                    {
                        Name = "INTEGRITY Team"
                    }
                });

                // Add Bearer token authentication to Swagger
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    Description = "JWT Bearer Token"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });

                // Include XML documentation comments
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                    options.IncludeXmlComments(xmlPath);
            });

            // 7. CORS Configuration
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                    policy.WithOrigins(
                        _configuration["Cors:AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            // 8. Health Checks
            services.AddHealthChecks()
                .AddDbContextCheck<IntegrityDbContext>()
                .AddRedis(redisConnection ?? "localhost:6379");

            // 9. Logging
            services.AddLogging(config =>
            {
                config.AddConsole();
                config.AddDebug();
                // TODO: Add Application Insights logging
                // config.AddApplicationInsightsWebJobs(options => options.InstrumentationKey = _configuration["ApplicationInsights:InstrumentationKey"]);
            });
        }

        /// <summary>
        /// Configures HTTP request middleware pipeline
        /// Called by runtime AFTER ConfigureServices
        /// Order matters: middleware is executed in order
        /// </summary>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // 1. Error Handling
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "INTEGRITY API V1");
                    options.RoutePrefix = string.Empty; // Swagger at root
                });
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            // 2. HTTPS Redirection
            app.UseHttpsRedirection();

            // 3. Request/Response Logging Middleware
            // TODO: Implement custom logging middleware for API timing
            // app.UseMiddleware<RequestLoggingMiddleware>();

            // 4. CORS
            app.UseCors("AllowReactApp");

            // 5. Authentication & Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // 6. Routing
            app.UseRouting();

            // 7. Endpoints
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
                endpoints.MapHealthChecks("/health/ready");
            });
        }
    }

    /// <summary>
    /// Application entry point
    /// </summary>
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
