# INTEGRITY Demo Setup Script (Windows PowerShell)
# Automates local environment setup with Docker + Supabase + .NET API

param(
    [string]$Command = "start",
    [string]$Environment = "Supabase.Local"
)

$projectRoot = Get-Location
$apiPath = "projects/INTEGRITY/src/INTEGRITY.API"
$dockerComposeFile = "docker-compose.local.yml"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Check-DockerInstalled {
    Write-Header "Checking Docker Installation"
    
    try {
        $dockerVersion = docker --version
        Write-Success "Docker installed: $dockerVersion"
        return $true
    }
    catch {
        Write-Error "Docker not found. Please install Docker Desktop."
        Write-Info "Download: https://www.docker.com/products/docker-desktop"
        return $false
    }
}

function Check-DotNetInstalled {
    Write-Header "Checking .NET Installation"
    
    try {
        $dotnetVersion = dotnet --version
        Write-Success ".NET installed: $dotnetVersion"
        return $true
    }
    catch {
        Write-Error ".NET SDK not found. Please install .NET 7 SDK or later."
        Write-Info "Download: https://dotnet.microsoft.com/download/dotnet"
        return $false
    }
}

function Start-Infrastructure {
    Write-Header "Starting Docker Infrastructure"
    
    if (!(Check-DockerInstalled)) {
        return
    }

    Write-Info "Starting PostgreSQL, Redis, pgAdmin..."
    docker-compose -f $dockerComposeFile up -d
    
    Write-Info "Waiting for PostgreSQL to be ready..."
    $maxRetries = 30
    $retries = 0
    
    while ($retries -lt $maxRetries) {
        try {
            $output = docker exec integrity-postgres pg_isready -U postgres 2>&1
            if ($output -match "accepting") {
                Write-Success "PostgreSQL is ready"
                break
            }
        }
        catch {
            Write-Info "Waiting... ($($retries + 1)/$maxRetries)"
        }
        Start-Sleep -Seconds 1
        $retries++
    }
    
    if ($retries -eq $maxRetries) {
        Write-Error "PostgreSQL failed to start within 30 seconds"
        return
    }
    
    Write-Success "All Docker containers started successfully"
    Write-Info "PostgreSQL: localhost:5432"
    Write-Info "Redis: localhost:6379"
    Write-Info "pgAdmin: http://localhost:5050 (admin@demo.local / admin)"
}

function Restore-Dependencies {
    Write-Header "Restoring .NET Dependencies"
    
    if (!(Check-DotNetInstalled)) {
        return
    }

    Push-Location $apiPath
    
    Write-Info "Running 'dotnet restore'..."
    dotnet restore
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies restored"
    }
    else {
        Write-Error "Failed to restore dependencies"
    }
    
    Pop-Location
}

function Apply-Migrations {
    Write-Header "Applying EF Core Migrations"
    
    Write-Info "Connecting to PostgreSQL..."
    Push-Location $apiPath
    
    Write-Info "Applying migrations to integrity_demo database..."
    $env:ASPNETCORE_ENVIRONMENT = $Environment
    
    dotnet ef database update --environment $Environment
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database schema created successfully"
    }
    else {
        Write-Error "Failed to apply migrations"
    }
    
    Pop-Location
}

function Start-API {
    Write-Header "Starting INTEGRITY API"
    
    Push-Location $apiPath
    
    $env:ASPNETCORE_ENVIRONMENT = $Environment
    $env:ASPNETCORE_URLS = "http://localhost:5000"
    
    Write-Info "Starting API (Ctrl+C to stop)..."
    Write-Info "Swagger UI: http://localhost:5000/swagger"
    Write-Info "Health: http://localhost:5000/api/v1/health"
    
    dotnet run --environment $Environment
    
    Pop-Location
}

function Stop-Infrastructure {
    Write-Header "Stopping Docker Infrastructure"
    
    Write-Info "Stopping containers..."
    docker-compose -f $dockerComposeFile down
    
    Write-Success "Infrastructure stopped"
}

function View-Logs {
    param([string]$Service = "postgres")
    
    Write-Header "Viewing Logs: $Service"
    
    docker logs -f integrity-$Service
}

function Reset-Database {
    Write-Header "Resetting Database"
    
    Write-Info "This will delete all data and restart clean."
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Info "Stopping containers..."
        docker-compose -f $dockerComposeFile down -v
        
        Write-Info "Removing volumes..."
        docker volume prune -f
        
        Write-Info "Starting fresh..."
        Start-Infrastructure
        Apply-Migrations
        
        Write-Success "Database reset complete"
    }
    else {
        Write-Info "Reset cancelled"
    }
}

function Show-Help {
    Write-Host @"
INTEGRITY Demo Setup Script

Usage: .\setup.ps1 -Command <command> -Environment <environment>

Commands:
  start          - Start all infrastructure and API (default)
  stop           - Stop Docker containers
  restart        - Restart infrastructure
  logs           - View Docker logs
  reset          - Reset database to clean state
  migrate        - Apply database migrations
  restore        - Restore .NET dependencies
  api            - Start API only (Docker must be running)
  full           - Full setup from scratch

Examples:
  .\setup.ps1 -Command start
  .\setup.ps1 -Command stop
  .\setup.ps1 -Command reset -Environment Supabase.Local
  .\setup.ps1 -Command logs
  .\setup.ps1 -Command full

Environment Variables:
  ASPNETCORE_ENVIRONMENT  - Set to 'Supabase.Local' (default)
  ASPNETCORE_URLS         - API URL (default: http://localhost:5000)

Access:
  API Swagger:  http://localhost:5000/swagger
  pgAdmin:      http://localhost:5050
  PostgreSQL:   localhost:5432
  Redis:        localhost:6379

"@
}

# Main execution
switch ($Command.ToLower()) {
    "start" {
        Start-Infrastructure
        Restore-Dependencies
        Apply-Migrations
        Start-API
    }
    "stop" {
        Stop-Infrastructure
    }
    "restart" {
        Stop-Infrastructure
        Start-Sleep -Seconds 2
        Start-Infrastructure
    }
    "logs" {
        View-Logs "postgres"
    }
    "reset" {
        Reset-Database
    }
    "migrate" {
        Apply-Migrations
    }
    "restore" {
        Restore-Dependencies
    }
    "api" {
        Start-API
    }
    "full" {
        Check-DockerInstalled
        Check-DotNetInstalled
        Start-Infrastructure
        Restore-Dependencies
        Apply-Migrations
        Write-Header "Setup Complete!"
        Write-Info "Run '.\setup.ps1 -Command api' to start the API"
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

Write-Host ""
