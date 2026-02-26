# Deploying to GitHub Pages (kronkai.com)

This guide walks you through publishing the Kronk site to GitHub Pages with the custom domain **kronkai.com**.

## What's Already Set Up

- **GitHub Actions workflow** (`.github/workflows/deploy-pages.yml`) — Builds the site and deploys on every push to `main`
- **SPA routing** — `index.html` is copied to `404.html` so client-side routes (e.g. `/blog`, `/manual`) work correctly
- **Custom domain** — `CNAME` file with `www.kronkai.com` is included in the deploy

---

## Step 1: Enable GitHub Pages

1. Go to your repo: **https://github.com/ardanlabs/kronk_website**
2. Click **Settings** → **Pages** (under "Code and automation")
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**

That's it. The workflow will run on the next push to `main`.

---

## Step 2: Configure Custom Domain in GitHub

1. In **Settings** → **Pages**, find **Custom domain**
2. Enter: `www.kronkai.com`
3. Click **Save**
4. GitHub will show DNS instructions — keep this tab open for Step 3

---

## Step 3: Configure DNS at Your Domain Registrar

Where you manage kronkai.com (e.g. Cloudflare, Namecheap, GoDaddy, Google Domains):

### Option A: Apex domain (kronkai.com)

Add these **A records**:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

### Option B: www subdomain (www.kronkai.com)

Add a **CNAME record**:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `ardanlabs.github.io` |

*(Use `ardanlabs` for org repos, or your GitHub username for user repos.)*

### Option C: Both apex and www

Add all records from Option A and Option B.

---

## Step 4: Enforce HTTPS (Recommended)

1. In **Settings** → **Pages**, under **Custom domain**
2. Check **Enforce HTTPS** once DNS has propagated and GitHub shows a green checkmark

---

## Step 5: Deploy

Push to `main` to trigger a deploy:

```bash
git add -A
git commit -m "Add GitHub Pages deployment"
git push origin main
```

Then:

1. Go to **Actions** in your repo
2. Open the "Deploy to GitHub Pages" workflow run
3. Wait for it to finish (usually 1–2 minutes)

---

## Verify

- **Temporary URL**: `https://ardanlabs.github.io/kronk_website/` (until custom domain propagates)
- **Custom domain**: `https://www.kronkai.com` (after DNS propagates, often 5–60 minutes)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on `/blog` or `/manual` | Ensure the workflow copies `index.html` → `404.html` (already in workflow) |
| Custom domain not working | Wait for DNS propagation; verify A/CNAME records match GitHub's instructions |
| Mixed content warnings | Enable **Enforce HTTPS** in Pages settings |
| Build fails | Check the Actions log; common causes: `npm ci` fails, missing env vars |

---

## "InvalidDNSError" / "Improperly configured" / "Not eligible for HTTPS"

### 1. Use one domain at a time

In GitHub **Settings → Pages → Custom domain**, enter **only one** of:

- `kronkai.com` (apex) — requires A records
- `www.kronkai.com` (www) — requires CNAME record *(recommended for this repo)*

Do not add both until one works.

### 2. If using Cloudflare (or similar proxy)

Turn off the proxy so GitHub can see your DNS:

1. Cloudflare Dashboard → **DNS** → find the record for `kronkai.com` or `www`
2. Set the cloud icon to **grey** (DNS only), not orange (Proxied)
3. Save and wait 5–10 minutes, then re-check in GitHub

### 3. Correct DNS records

**For apex (`kronkai.com`):**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `185.199.108.153` | 3600 |
| A | `@` | `185.199.109.153` | 3600 |
| A | `@` | `185.199.110.153` | 3600 |
| A | `@` | `185.199.111.153` | 3600 |

**For www (`www.kronkai.com`):**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `ardanlabs.github.io` | 3600 |

The CNAME target must be exactly `ardanlabs.github.io` (no `https://`, no path, no repo name).

### 4. Verify DNS

```bash
# For apex (kronkai.com)
dig kronkai.com A +short

# For www
dig www.kronkai.com CNAME +short
```

You should see the A or CNAME values above.

### 5. Re-trigger GitHub’s check

1. In **Settings → Pages**, clear the Custom domain field and save
2. Wait 2–3 minutes
3. Enter the domain again and save
