#!/usr/bin/env bash
#
# Flip the live docs symlink to a different release.
#
# .github/workflows/deploy.yml installs this on the droplet as
# ~/bin/loomiui-rollback (on Ubuntu, ~/.profile already puts ~/bin on PATH), so
# it is always the same version as the deploy logic that produced the releases.
#
#   loomiui-rollback            flip to the previous release
#   loomiui-rollback <sha>      flip to that release (any unique prefix works)
#   loomiui-rollback --list     show releases, newest first, marking the live one
#
# Override the target site with LOOMIUI_SITE=/var/www/html/other.com.
set -euo pipefail

SITE="${LOOMIUI_SITE:-/var/www/html/loomiui.com}"
RELEASES="$SITE.releases"

die() {
  printf 'loomiui-rollback: %s\n' "$1" >&2
  exit 1
}

live_release() {
  readlink "$SITE" 2>/dev/null || true
}

# Newest first, absolute paths, no trailing slash.
all_releases() {
  ls -1dt "$RELEASES"/*/ 2>/dev/null | sed 's:/*$::'
}

# A release whose rsync died partway has no index.html. It must never be an
# automatic rollback target, or `loomiui-rollback` with no argument would land
# on the very kind of broken build it exists to escape.
usable_releases() {
  while read -r release; do
    [ -f "$release/index.html" ] && printf '%s\n' "$release"
  done < <(all_releases)
}

cmd_list() {
  local live
  live="$(live_release)"
  [ -n "$(all_releases)" ] || die "no releases in $RELEASES"
  while read -r release; do
    if [ "$release" = "$live" ]; then
      printf '  * %s   (live)\n' "$(basename "$release")"
    elif [ -f "$release/index.html" ]; then
      printf '    %s\n' "$(basename "$release")"
    else
      printf '    %s   (incomplete — no index.html)\n' "$(basename "$release")"
    fi
  done < <(all_releases)
}

# The most recent usable release that isn't the one currently being served.
# After a rollback that is a *newer* build, so this also undoes the undo.
previous_release() {
  local live
  live="$(live_release)"
  usable_releases | grep -vFx "$live" | head -n 1
}

resolve_release() {
  local want="$1" matches
  matches="$(all_releases | awk -v w="$want" 'index(substr($0, match($0, /[^\/]+$/)), w) == 1')"
  [ -n "$matches" ] || die "no release matching '$want' (try --list)"
  [ "$(printf '%s\n' "$matches" | wc -l)" -eq 1 ] ||
    die "'$want' matches several releases:$(printf '\n  %s' $(printf '%s\n' "$matches" | xargs -n1 basename))"
  printf '%s\n' "$matches"
}

flip_to() {
  local target="$1"
  [ -d "$target" ] || die "$target is not a directory"
  # A release missing its entry point means a half-finished rsync — serving it
  # would 404 the whole site, which is the thing rollback exists to undo.
  [ -f "$target/index.html" ] || die "$(basename "$target") has no index.html — refusing to serve it"

  ln -sfn "$target" "$SITE.new"
  mv -T "$SITE.new" "$SITE"
  printf 'now serving %s\n' "$(basename "$target")"

  # nginx resolves the symlink per request, so there is nothing to reload; this
  # only confirms the flip actually serves.
  if command -v curl >/dev/null 2>&1; then
    if curl -sf -o /dev/null -H 'Host: loomiui.com' http://127.0.0.1/; then
      printf 'verified: site responds 200\n'
    else
      printf 'WARNING: site did not respond 200 after the flip — check nginx\n' >&2
    fi
  fi
}

main() {
  [ -L "$SITE" ] || die "$SITE is not a symlink — this droplet predates the release layout"

  case "${1:-}" in
    --list | -l)
      cmd_list
      ;;
    --help | -h)
      sed -n '3,13p' "$0" | sed 's:^# \{0,1\}::'
      ;;
    "")
      local target
      target="$(previous_release)"
      [ -n "$target" ] || die "only one release on disk — nothing to roll back to"
      flip_to "$target"
      ;;
    -*)
      die "unknown option '$1' (try --help)"
      ;;
    *)
      # Assign separately: `die` inside a $( ) only kills the subshell, so
      # flip_to "$(resolve_release …)" would run on with an empty target.
      local target
      target="$(resolve_release "$1")" || exit 1
      flip_to "$target"
      ;;
  esac
}

main "$@"
