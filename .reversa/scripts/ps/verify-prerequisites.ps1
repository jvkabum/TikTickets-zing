# verify-prerequisites.ps1
# Helper genérico de pré-condições, chamado pelos skills forward do Reversa.
# Saída padrão JSON em uma única linha.
#
# Uso:
#   verify-prerequisites.ps1 [-Json] [-Require <campo>] [-Require <campo>] ...
#
# Campos suportados:
#   active-requirements, feature-dir, requirements, roadmap, actions, sdd, principles
#
# Códigos de saída: 0 ok, 1 faltando algo, 2 uso inválido.

[CmdletBinding()]
param(
  [switch]$Json,
  [string[]]$Require = @()
)

$ErrorActionPreference = 'Stop'

$scriptDir   = Split-Path -Parent $PSCommandPath
$projectRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$reversaDir  = Join-Path $projectRoot '.reversa'
$sddDir      = Join-Path $projectRoot '_reversa_sdd'
$forwardDir  = Join-Path $projectRoot '_reversa_forward'
$active      = Join-Path $reversaDir 'active-requirements.json'

$missing  = New-Object System.Collections.Generic.List[string]
$featureDir = ''

if (Test-Path -LiteralPath $active) {
  try {
    $payload    = Get-Content -LiteralPath $active -Raw -Encoding utf8 | ConvertFrom-Json
    $rel        = $payload.'feature-dir'
    if ($rel) { $featureDir = Join-Path $projectRoot $rel }
  } catch {
    # JSON invalido, deixa featureDir vazio
  }
}

function Test-One {
  param([string]$Name)
  switch ($Name) {
    'active-requirements' {
      if (-not (Test-Path -LiteralPath $active)) { $missing.Add('active-requirements') | Out-Null }
    }
    'feature-dir' {
      if (-not $featureDir -or -not (Test-Path -LiteralPath $featureDir -PathType Container)) {
        $missing.Add('feature-dir') | Out-Null
      }
    }
    'requirements' {
      if (-not $featureDir -or -not (Test-Path -LiteralPath (Join-Path $featureDir 'requirements.md'))) {
        $missing.Add('requirements') | Out-Null
      }
    }
    'roadmap' {
      if (-not $featureDir -or -not (Test-Path -LiteralPath (Join-Path $featureDir 'roadmap.md'))) {
        $missing.Add('roadmap') | Out-Null
      }
    }
    'actions' {
      if (-not $featureDir -or -not (Test-Path -LiteralPath (Join-Path $featureDir 'actions.md'))) {
        $missing.Add('actions') | Out-Null
      }
    }
    'sdd' {
      if (-not (Test-Path -LiteralPath $sddDir -PathType Container)) { $missing.Add('sdd') | Out-Null }
    }
    'principles' {
      if (-not (Test-Path -LiteralPath (Join-Path $reversaDir 'principles.md'))) { $missing.Add('principles') | Out-Null }
    }
    default {
      $missing.Add("desconhecido:$Name") | Out-Null
    }
  }
}

foreach ($r in $Require) {
  if ($r) { Test-One -Name $r }
}

$result = [ordered]@{
  'project-root'         = $projectRoot
  'reversa-dir'          = $reversaDir
  'sdd-dir'              = $sddDir
  'forward-dir'          = $forwardDir
  'active-requirements'  = $active
  'feature-dir'          = $featureDir
  'missing'              = @($missing)
}

if ($Json) {
  $result | ConvertTo-Json -Compress -Depth 4 | Write-Output
} else {
  if ($missing.Count -eq 0) {
    Write-Output 'ok'
  } else {
    Write-Output ("faltando: " + ($missing -join ', '))
  }
}

if ($missing.Count -eq 0) { exit 0 } else { exit 1 }
