#!/usr/bin/env bash
# Publish the Pulse marketing site to a public GitHub repo + GitHub Pages.
# Usage:  ./publish.sh [repo-name]      (default repo name: pulse-app-site)
#
# Prerequisite (one time):  gh auth login
set -euo pipefail

REPO="${1:-pulse-app-site}"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI ('gh') is not installed. Install it from https://cli.github.com then re-run."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "You're not logged into GitHub. Run:  gh auth login   (choose GitHub.com, HTTPS),"
  echo "then re-run:  ./publish.sh $REPO"
  exit 1
fi

USER="$(gh api user --jq .login)"
echo "Publishing as @$USER → repo '$REPO' ..."

# Fresh git repo from just the website files (separate from the app repo).
rm -rf .git
git init -q
git add .
git commit -qm "Pulse marketing site"
git branch -M main

# Create the public repo and push.
gh repo create "$USER/$REPO" --public --source=. --remote=origin --push

# Enable GitHub Pages from main / root.
gh api -X POST "repos/$USER/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || \
gh api -X PUT  "repos/$USER/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true

echo ""
echo "✅ Done. GitHub Pages builds in ~1 minute. Your URLs:"
echo "   Site:    https://$USER.github.io/$REPO/"
echo "   Privacy: https://$USER.github.io/$REPO/privacy.html   ← paste in App Store Connect"
echo "   Terms:   https://$USER.github.io/$REPO/terms.html"
