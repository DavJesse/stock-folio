#!/usr/bin/env bash
# docker-gc.sh — Safe Docker garbage collection
# Usage:
#   ./docker-gc.sh                  # interactive (asks for confirmation)
#   ./docker-gc.sh --dry-run        # show what would be removed
#   ./docker-gc.sh --aggressive     # remove ALL unused (not just dangling)
#   ./docker-gc.sh --yes            # no prompts (non-interactive CI)
#   ./docker-gc.sh --keep "repo:tag another:tag"  # protect images by ref
#
# Notes:
# - Requires Docker CLI.
# - Honors DOCKER_HOST etc if set.

set -euo pipefail

# -------- Configuration (can be overridden with flags) -----------------
DRY_RUN=false
AGGRESSIVE=false
ASSUME_YES=false
PROTECTED_IMAGES=()   # e.g., ("stockfolio:latest" "node:24-slim")

# -------- Helpers ------------------------------------------------------
log() { printf '%s\n' "$*" >&2; }
confirm() {
  if $ASSUME_YES; then return 0; fi
  read -r -p "${1:-Proceed?} [y/N] " ans
  case "${ans:-}" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

in_array() {
  local needle="$1"; shift
  for x in "$@"; do [[ "$x" == "$needle" ]] && return 0; done
  return 1
}

remove_list() {
  local kind="$1"; shift
  local -a ids=("$@")
  if ((${#ids[@]} == 0)); then
    log "Nothing to remove for $kind."
    return 0
  fi
  if $DRY_RUN; then
    log "[DRY-RUN] Would remove $kind:"
    printf '  %s\n' "${ids[@]}"
    return 0
  fi
  log "Removing $kind..."
  # shellcheck disable=SC2068
  docker $kind rm ${ids[@]}
}

# -------- Parse args ---------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --aggressive) AGGRESSIVE=true ;;
    --yes|-y) ASSUME_YES=true ;;
    --keep)
      shift
      IFS=' ' read -r -a PROTECTED_IMAGES <<< "${1:-}"
      ;;
    --help|-h)
      cat <<EOF
Docker GC — safely prune unused Docker resources

Options:
  --dry-run        Show what would be removed, do not delete.
  --aggressive     Remove ALL unused images (not just dangling), networks,
                   volumes and builder cache.
  --keep "<refs>"  Protect specific images (space-separated), e.g.
                   --keep "stockfolio:latest node:24-slim"
  --yes, -y        Do not prompt for confirmation (non-interactive).
  --help, -h       Show this help.

Examples:
  ./docker-gc.sh --dry-run
  ./docker-gc.sh --aggressive --keep "stockfolio:latest" -y
EOF
      exit 0
      ;;
    *)
      log "Unknown option: $1"
      exit 1
      ;;
  esac
  shift
done

# -------- Summary / confirmation ---------------------------------------
log "Docker GC plan:"
log "  Dry run     : $DRY_RUN"
log "  Aggressive  : $AGGRESSIVE"
if ((${#PROTECTED_IMAGES[@]})); then
  log "  Protected   : ${PROTECTED_IMAGES[*]}"
else
  log "  Protected   : (none)"
fi
confirm "Continue with garbage collection?" || { log "Aborted."; exit 0; }

# -------- 1) Stop & remove exited containers ---------------------------
# Remove only stopped/exited containers; running containers are left intact.
mapfile -t EXITED_IDS < <(docker ps -aq -f status=exited || true)
if $DRY_RUN; then
  if ((${#EXITED_IDS[@]})); then
    log "[DRY-RUN] Would remove stopped containers:"
    printf '  %s\n' "${EXITED_IDS[@]}"
  else
    log "No stopped containers to remove."
  fi
else
  if ((${#EXITED_IDS[@]})); then
    docker rm "${EXITED_IDS[@]}" >/dev/null
    log "Removed ${#EXITED_IDS[@]} stopped container(s)."
  else
    log "No stopped containers to remove."
  fi
fi

# -------- 2) Remove dangling images (safe default) ----------------------
# Dangling = untagged layers (none:none). Always safe to delete.
mapfile -t DANGLING_IMG < <(docker images -f "dangling=true" -q || true)
if $DRY_RUN; then
  if ((${#DANGLING_IMG[@]})); then
    log "[DRY-RUN] Would remove dangling images:"
    printf '  %s\n' "${DANGLING_IMG[@]}"
  else
    log "No dangling images."
  fi
else
  if ((${#DANGLING_IMG[@]})); then
    docker rmi "${DANGLING_IMG[@]}" >/dev/null
    log "Removed ${#DANGLING_IMG[@]} dangling image(s)."
  else
    log "No dangling images."
  fi
fi

# -------- 3) Aggressive: remove all UNUSED images except protected ------
if $AGGRESSIVE; then
  # All image IDs not used by any container
  mapfile -t UNUSED_IMG < <(docker images -q || true)
  # Protect images currently used by containers
  mapfile -t INUSE_IMG < <(docker ps -a --format '{{.Image}}' | sort -u || true)

  # Translate protected names to IDs (best effort)
  PROTECTED_IDS=()
  for ref in "${PROTECTED_IMAGES[@]}"; do
    id=$(docker images --no-trunc --quiet "$ref" 2>/dev/null || true)
    [[ -n "$id" ]] && PROTECTED_IDS+=("$id")
  done

  # Build a removal list
  TO_REMOVE=()
  for id in "${UNUSED_IMG[@]}"; do
    # Skip if protected by ref -> id
    if in_array "$id" "${PROTECTED_IDS[@]}"; then
      continue
    fi
    # Skip if name matches protected refs
    name=$(docker image inspect "$id" --format '{{index .RepoTags 0}}' 2>/dev/null || echo "")
    if [[ -n "$name" ]]; then
      for ref in "${PROTECTED_IMAGES[@]}"; do
        if [[ "$name" == "$ref" ]]; then
          continue 2
        fi
      done
    fi
    # Skip if in use by containers
    if in_array "$id" "${INUSE_IMG[@]}"; then
      continue
    fi
    TO_REMOVE+=("$id")
  done

  if ((${#TO_REMOVE[@]})); then
    if $DRY_RUN; then
      log "[DRY-RUN] Would remove unused images:"
      printf '  %s\n' "${TO_REMOVE[@]}"
    else
      docker rmi "${TO_REMOVE[@]}" >/dev/null || true
      log "Removed ${#TO_REMOVE[@]} unused image(s)."
    fi
  else
    log "No unused images to remove (after protections)."
  fi
fi

# -------- 4) Prune networks, volumes, build cache -----------------------
if $DRY_RUN; then
  log "[DRY-RUN] Would run:"
  log "  docker network prune -f"
  log "  docker volume  prune -f"
  log "  docker builder prune -f"
else
  docker network prune -f >/dev/null || true
  docker volume  prune -f >/dev/null || true
  docker builder prune -f >/dev/null || true
  log "Pruned unused networks, volumes, and builder cache."
fi

log "Docker GC complete."
