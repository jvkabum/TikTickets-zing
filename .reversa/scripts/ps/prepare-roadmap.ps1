# prepare-roadmap.ps1
# Helper específico do skill /reversa-plan.
# Garante que a pasta da feature ativa exista e devolve caminhos absolutos prontos.
#
# Uso:
#   prepare-roadmap.ps1 [-Json]
#
# Códigos de saída: 0 ok, 1 active-requirements ausente/invalido, 2 nao foi possivel criar feature-dir, 3 uso invalido.

[CmdletBinding()]
param(
  [switch]$Json
)

$ErrorActionPreference = 'Stop'

$scriptDir   = Split-Path -Parent $PSCommandPath
$projectRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$reversaDir  = Join-Path $projectRoot '.reversa'
$sddDir      = Join-Path $projectRoot '_reversa_sdd'
$active      = Join-Path $reversaDir 'active-requirements.json'

if (-not (Test-Path -LiteralPath $active)) {
  Write-Error "$active nao existe. rode reversa-requirements antes."
  exit 1
}

try {
  $payload = Get-Content -LiteralPath $active -Raw -Encoding utf8 | ConvertFrom-Json
} catch {
  Write-Error "active-requirements.json esta invalido: $($_.Exception.Message)"
  exit 1
}

$rel = $payload.'feature-dir'
if (-not $rel) {
  Write-Error "campo feature-dir ausente em $active"
  exit 1
}

$featureDir    = Join-Path $projectRoot $rel
$interfacesDir = Join-Path $featureDir 'interfaces'

try {
  New-Item -ItemType Directory -Force -Path $interfacesDir | Out-Null
} catch {
  Write-Error "nao foi possivel criar $interfacesDir: $($_.Exception.Message)"
  exit 2
}

$requirementsPath  = Join-Path $featureDir 'requirements.md'
$roadmapPath       = Join-Path $featureDir 'roadmap.md'
$investigationPath = Join-Path $featureDir 'investigation.md'
$dataDeltaPath     = Join-Path $featureDir 'data-delta.md'
$onboardingPath    = Join-Path $featureDir 'onboarding.md'

$result = [ordered]@{
  'project-root' = $projectRoot
  'sdd-dir'      = $sddDir
  'feature-dir'  = $featureDir
  'requirements' = [ordered]@{
    path    = $requirementsPath
    present = (Test-Path -LiteralPath $requirementsPath)
  }
  'roadmap' = [ordered]@{
    path             = $roadmapPath
    'already-exists' = (Test-Path -LiteralPath $roadmapPath)
  }
  'investigation'  = $investigationPath
  'data-delta'     = $dataDeltaPath
  'onboarding'     = $onboardingPath
  'interfaces-dir' = $interfacesDir
  'template'       = (Join-Path $reversaDir 'templates\roadmap-template.md')
}

if ($Json) {
  $result | ConvertTo-Json -Compress -Depth 4 | Write-Output
} else {
  Write-Output "feature-dir: $featureDir"
  Write-Output "requirements presente: $($result.requirements.present)"
  Write-Output "roadmap ja existe: $($result.roadmap.'already-exists')"
}

exit 0
