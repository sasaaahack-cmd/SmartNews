---
name: Git push with Personal Access Token (PAT)
description: How to push to GitHub when Replit GitHub account connection isn't available
---

## Rule
Embed the token in the remote URL, push, then immediately reset the URL to the plain https:// form to prevent the token from persisting in `.git/config`.

## How to apply
```js
run(`git remote set-url origin https://${token}@github.com/owner/repo.git`);
run(`git push origin main`);
run(`git remote set-url origin https://github.com/owner/repo.git`); // clear token
```

Always wrap in try/finally so the cleanup runs even if push fails.

**Why:** Leaving the token in the remote URL would expose it to anyone who reads `.git/config`.

## When to use
Only when `gitPush({})` callback returns `NO_CREDENTIALS` (i.e. user's GitHub account is not connected to Replit). Prefer the `gitPush()` callback when it works.
