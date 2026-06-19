# ==============================================================================
# HCHO PLATFORM - POSTGRESQL BACKUP SCRIPT (WINDOWS POWERSHELL)
# ==============================================================================

# 1. Configuration
$BackupDir = Join-Path $PSScriptRoot "backups"
$DbName = "hcho_db"
$DbUser = "postgres"
$ContainerName = "hcho-postgres"
$RetentionDays = 7
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "hcho_db_backup_$Timestamp.sql"

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory at: $BackupDir" -ForegroundColor Green
}

Write-Host "Starting backup process for database: $DbName..." -ForegroundColor Cyan

# 2. Execute pg_dump inside Docker container
try {
    # Test if Docker is running and container is available
    $containerCheck = docker ps -q --filter "name=$ContainerName"
    if (-not $containerCheck) {
        throw "Docker container '$ContainerName' is not running or Docker CLI is not installed."
    }

    # Stream backup content into sql file
    docker exec -t $ContainerName pg_dump -U $DbUser -d $DbName > $BackupFile
    
    if (Test-Path $BackupFile) {
        $fileSize = (Get-Item $BackupFile).Length / 1KB
        Write-Host "Backup completed successfully! Saved to: $BackupFile ($($fileSize.ToString('F2')) KB)" -ForegroundColor Green
    } else {
        throw "Backup file was not created successfully."
    }
}
catch {
    Write-Error "Database backup failed: $_"
    exit 1
}

# 3. Clean up backups older than RetentionDays
Write-Host "Pruning backups older than $RetentionDays days..." -ForegroundColor Yellow
$LimitDate = (Get-Date).AddDays(-$RetentionDays)

Get-ChildItem -Path $BackupDir -Filter "hcho_db_backup_*.sql" | ForEach-Object {
    if ($_.LastWriteTime -lt $LimitDate) {
        Write-Host "Deleting old backup: $($_.Name)" -ForegroundColor Red
        Remove-Item $_.FullName -Force
    }
}

Write-Host "Backup process completed." -ForegroundColor Green
