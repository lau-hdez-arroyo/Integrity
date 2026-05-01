using INTEGRITY.API.Data;
using INTEGRITY.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
            // 1. Database Configuration (PostgreSQL + Supabase)
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<IntegrityDbContext>(options =>
                options.UseNpgsql(connectionString, sqlOptions => 
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelaySeconds: 10);
                }));

            // 2. Supabase REST API Client (API Key Authentication)
            services.AddHttpClient<ISupabaseClient, SupabaseClient>((serviceProvider, httpClient) =>
            {
                var supabaseUrl = _configuration["Supabase:Url"];
                var supabaseKey = _configuration["Supabase:PublishableKey"];
                
                if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
                {
                    throw new InvalidOperationException(
                        "Supabase:Url and Supabase:PublishableKey must be configured in appsettings");
                }
                
                var restApiUrl = $"{supabaseUrl}/rest/v1/";
                httpClient.BaseAddress = new Uri(restApiUrl);
                httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");
                httpClient.Timeout = TimeSpan.FromSeconds(30);
            });

            // 3. Redis Caching Configuration
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

            // 4. Repository Pattern & Unit of Work
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // 5. Business Services
            services.AddScoped<IHeatMapService, HeatMapService>();
            services.AddScoped<ITestSelectionService, TestSelectionService>();
            services.AddScoped<IRiskAssessmentService, RiskAssessmentService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IAuditService, AuditService>();

            // 6. Authentication & Authorization (Supabase JWT)
            services.AddAuthentication("Bearer")
                .AddJwtBearer(options =>
                {
                    options.Authority = _configuration["Auth:Authority"] ?? 
                                       (_configuration["Supabase:Url"] + "/auth/v1");
                    options.Audience = _configuration["Auth:Audience"] ?? "authenticated";
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("TeamLead", policy => policy.RequireRole("Admin", "ProjectManager"));
                options.AddPolicy("DeveloperAndAbove", policy =>
                    policy.RequireRole("Admin", "ProjectManager", "Developer", "QA"));
            });

            // 7. Controllers & API Documentation
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

            // 8. CORS Configuration
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                    policy.WithOrigins(
                        _configuration["Cors:AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" })
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            // 9. Health Checks
            services.AddHealthChecks()
                .AddDbContextCheck<IntegrityDbContext>()
                .AddRedis(redisConnection ?? "localhost:6379");

            // 10. Logging
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
