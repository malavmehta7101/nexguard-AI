# 🚀 NexGuard AI — Pre-Launch Checklist

## ✅ SEO Files (Done)
- [x] `index.html` — meta tags, OG tags, Twitter cards, JSON-LD schema
- [x] `public/robots.txt` — crawler rules + sitemap link
- [x] `public/sitemap.xml` — all 18 tool pages indexed
- [x] `public/site.webmanifest` — PWA manifest
- [x] `public/favicon.svg` — SVG favicon
- [x] `public/_headers` — security + cache headers (Netlify)
- [x] `public/_redirects` — SPA routing (Netlify)
- [x] `frontend/vercel.json` — security headers + routing (Vercel)
- [x] `vite.config.js` — production build optimizations

---

## 🔲 STEP 1 — Get a Domain
Pick a domain name and buy it:
- **Namecheap** → https://namecheap.com (~$10/year)
- **Porkbun**   → https://porkbun.com  (~$9/year)
- **GoDaddy**   → https://godaddy.com

Suggested domains:
```
nexguard.ai      ← best option
nexguardai.com
nexguard.io
nexguard.app
```

---

## 🔲 STEP 2 — Deploy Backend (Railway — Free Tier)

1. Go to **https://railway.app** → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `nexguard-ai` repo
4. Set **Root Directory** to `backend`
5. Add environment variables (Settings → Variables):
```
ANTHROPIC_API_KEY   = sk-ant-your-real-key
VIRUSTOTAL_API_KEY  = your-vt-key
ABUSEIPDB_API_KEY   = your-abuse-key
HIBP_API_KEY        = your-hibp-key
PORT                = 3001
FRONTEND_URL        = https://your-frontend-domain.com
NODE_ENV            = production
```
6. Railway gives you a URL like: `https://nexguard-backend.railway.app`
7. Copy that URL — you need it for Step 3

**Alternatives to Railway:**
- **Render.com** → https://render.com (free tier, slower cold start)
- **Fly.io**     → https://fly.io (more control)

---

## 🔲 STEP 3 — Deploy Frontend (Vercel — Free Tier)

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"Add New Project"** → Import `nexguard-ai`
3. Set:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
```
VITE_API_URL = https://nexguard-backend.railway.app
```
5. Click **Deploy**
6. Vercel gives you: `https://nexguard-ai.vercel.app`

**Alternatives to Vercel:**
- **Netlify** → https://netlify.com (drag & drop `dist` folder)
- **Cloudflare Pages** → https://pages.cloudflare.com (fastest CDN)

---

## 🔲 STEP 4 — Update vite.config.js for Production API URL

Update `frontend/vite.config.js` proxy target with your Railway URL:

```js
proxy: {
  "/api": {
    target: "https://nexguard-backend.railway.app",
    changeOrigin: true,
    secure: true,
  },
},
```

---

## 🔲 STEP 5 — Connect Custom Domain

**On Vercel:**
1. Go to your project → Settings → Domains
2. Add your domain: `nexguard.ai`
3. Copy the DNS records Vercel gives you

**On your domain registrar (Namecheap/Porkbun):**
1. Go to DNS settings
2. Add the records from Vercel:
```
Type: A     Name: @    Value: 76.76.21.21
Type: CNAME Name: www  Value: cname.vercel-dns.com
```
3. Wait 5–30 minutes for DNS to propagate

**For backend on Railway:**
1. Railway Settings → Networking → Custom Domain
2. Add: `api.nexguard.ai`
3. Add CNAME record in your DNS:
```
Type: CNAME  Name: api  Value: your-railway-url.railway.app
```
5. Update `FRONTEND_URL` in Railway env vars to `https://nexguard.ai`

---

## 🔲 STEP 6 — Update CORS for Production

In `backend/server.js`, update CORS origin to your live domain:
```js
origin: process.env.FRONTEND_URL || "https://nexguard.ai"
```
This is already handled by the `FRONTEND_URL` env variable ✅

---

## 🔲 STEP 7 — Create OG Image (og-image.png)

1. Open `frontend/public/og-image-generator.html` in Chrome
2. Press `F12` → Console → type:
```js
// Right-click the page → "Save as" or use a screenshot tool
```
3. Take a screenshot at exactly **1200×630px**
4. Save as `frontend/public/og-image.png`
5. Upload to your deployed site

**Free tools to create it:**
- **Canva** → https://canva.com (1200×630 template)
- **Figma** → https://figma.com

---

## 🔲 STEP 8 — API Keys (Add When Ready)

| Service | Free Tier | Link |
|---------|-----------|------|
| Anthropic Claude | $5 free credit | https://console.anthropic.com |
| VirusTotal | 500 scans/day | https://virustotal.com/gui/join-us |
| AbuseIPDB | 1,000 req/day | https://abuseipdb.com/register |
| HaveIBeenPwned | ~$3.50/month | https://haveibeenpwned.com/API/Key |

---

## 🔲 STEP 9 — Final GitHub Push

```bash
git add .
git commit -m "🚀 Production ready — SEO, deployment config, Phase 2"
git push
```

---

## 🔲 STEP 10 — Post-Launch SEO

After going live, submit your site to search engines:

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add property → enter `https://nexguard.ai`
3. Verify ownership (HTML tag method — Vercel makes this easy)
4. Submit sitemap: `https://nexguard.ai/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Add your site + submit sitemap

---

## 🔲 STEP 11 — Test Everything Live

Run these checks after launch:

| Test | Tool |
|------|------|
| SEO meta tags | https://metatags.io |
| OG image preview | https://opengraph.xyz |
| PageSpeed score | https://pagespeed.web.dev |
| SSL certificate | https://www.ssllabs.com/ssltest |
| Security headers | https://securityheaders.com |
| Robots.txt | https://nexguard.ai/robots.txt |
| Sitemap | https://nexguard.ai/sitemap.xml |
| Mobile friendly | https://search.google.com/test/mobile-friendly |

---

## ✅ Launch Readiness Score

- [ ] Domain purchased
- [ ] Backend deployed (Railway/Render)
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Custom domain connected
- [ ] SSL certificate active (auto with Vercel)
- [ ] API keys added to production
- [ ] OG image uploaded
- [ ] Google Search Console submitted
- [ ] All 11 tests above passing

**When all boxes are checked → you are LIVE! 🎉**
