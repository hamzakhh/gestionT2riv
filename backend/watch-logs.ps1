# Script PowerShell pour surveiller les logs backend
# Usage: .\watch-logs.ps1 [--watch] [--filter=connexion]

param(
    [switch]$Watch,
    [string]$Filter = ""
)

$logDir = Join-Path $PSScriptRoot "logs"
$combinedLog = Join-Path $logDir "combined.log"
$errorLog = Join-Path $logDir "error.log"

Write-Host "📋 Surveillance des logs backend" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $logDir)) {
    Write-Host "⚠️  Le dossier logs n'existe pas encore." -ForegroundColor Yellow
    Write-Host "   Lancez d'abord le serveur backend (npm run dev)" -ForegroundColor Yellow
    exit
}

function Show-Logs {
    param([int]$Lines = 30)
    
    if (Test-Path $combinedLog) {
        Write-Host "📄 Derniers logs (combined.log):" -ForegroundColor Green
        $content = Get-Content $combinedLog -Tail $Lines -ErrorAction SilentlyContinue
        
        foreach ($line in $content) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            
            # Filtrer si nécessaire
            if ($Filter -and $line -notmatch $Filter) { continue }
            
            # Parser et colorer les logs JSON
            try {
                $log = $line | ConvertFrom-Json
                $level = $log.level
                $message = $log.message
                $timestamp = $log.timestamp
                
                $color = switch ($level) {
                    "error" { "Red" }
                    "warn" { "Yellow" }
                    "info" { "Cyan" }
                    "debug" { "Gray" }
                    default { "White" }
                }
                
                Write-Host "[$timestamp] " -NoNewline
                Write-Host "$($level.ToUpper())" -ForegroundColor $color -NoNewline
                Write-Host ": $message"
            } catch {
                # Si ce n'est pas du JSON, afficher tel quel
                if ($line.Trim()) {
                    Write-Host $line
                }
            }
        }
    } else {
        Write-Host "⚠️  Le fichier combined.log n'existe pas encore." -ForegroundColor Yellow
    }
    
    if (Test-Path $errorLog) {
        $errorContent = Get-Content $errorLog -Tail 10 -ErrorAction SilentlyContinue
        if ($errorContent) {
            Write-Host "`n📄 Dernières erreurs (error.log):" -ForegroundColor Red
            foreach ($line in $errorContent) {
                if ($line.Trim()) {
                    Write-Host $line -ForegroundColor Red
                }
            }
        }
    }
}

if ($Watch) {
    Write-Host "👀 Mode surveillance active - Les nouveaux logs s'afficheront automatiquement" -ForegroundColor Yellow
    Write-Host "   Appuyez sur Ctrl+C pour quitter`n" -ForegroundColor Gray
    
    # Afficher les logs existants
    Show-Logs -Lines 20
    Write-Host "`n" + ("─" * 60) + "`n" -ForegroundColor Gray
    
    # Surveiller les changements
    $lastSize = 0
    if (Test-Path $combinedLog) {
        $lastSize = (Get-Item $combinedLog).Length
    }
    
    while ($true) {
        Start-Sleep -Seconds 1
        
        if (Test-Path $combinedLog) {
            $currentSize = (Get-Item $combinedLog).Length
            if ($currentSize -gt $lastSize) {
                $newContent = Get-Content $combinedLog -Tail 1 -ErrorAction SilentlyContinue
                if ($newContent) {
                    $line = $newContent[0]
                    if ([string]::IsNullOrWhiteSpace($Filter) -or $line -match $Filter) {
                        try {
                            $log = $line | ConvertFrom-Json
                            $level = $log.level
                            $message = $log.message
                            $timestamp = $log.timestamp
                            
                            $color = switch ($level) {
                                "error" { "Red" }
                                "warn" { "Yellow" }
                                "info" { "Cyan" }
                                "debug" { "Gray" }
                                default { "White" }
                            }
                            
                            Write-Host "[$timestamp] " -NoNewline
                            Write-Host "$($level.ToUpper())" -ForegroundColor $color -NoNewline
                            Write-Host ": $message"
                        } catch {
                            if ($line.Trim()) {
                                Write-Host $line
                            }
                        }
                    }
                }
                $lastSize = $currentSize
            }
        }
    }
} else {
    Show-Logs -Lines 30
    Write-Host "`n💡 Astuce: Utilisez --Watch pour surveiller en temps réel" -ForegroundColor Gray
    Write-Host "   Exemple: .\watch-logs.ps1 -Watch -Filter connexion" -ForegroundColor Gray
}
