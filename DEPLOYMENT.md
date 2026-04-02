# Deployment Guide for menu.sothysek.com

Comprehensive instructions for deploying your Full-Stack Digital Menu Platform to **Cloudflare Pages** using **D1** (Database), **R2** (Storage), and **Nitro** (Serverless).

---

## 🏗️ 1. Infrastructure Setup (Local & Remote)

### Cloudflare D1 (Database)
Create your production database and record the `database_id`:
```bash
# Create the database
npx wrangler d1 create digital-menu-db

# Initialize the production schema
npx wrangler d1 execute digital-menu-db --remote --file=./schema.sql
```

### Cloudflare R2 (Media Storage)
Create your production bucket for menu images:
```bash
npx wrangler r2 bucket create digital-menu-assets
```

---

## ⚙️ 2. Configuration (`wrangler.toml`)

Ensure your `wrangler.toml` in the project root is updated with your production IDs:

```toml
name = "digital-menu"
compatibility_date = "2024-04-01"
pages_build_output_dir = ".output/public"

[[d1_databases]]
binding = "DB"
database_name = "digital-menu-db"
database_id = "PASTE_YOUR_D1_ID_HERE"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "digital-menu-assets"
```

---

## 🌐 3. Cloudflare Pages Dashboard Setup

For the domain **menu.sothysek.com**, follow these steps in the Cloudflare Dashboard:

### 1. Connect to GitHub
- Open **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
- Select your repository.
- **Build Settings**:
    - Framework preset: `Nuxt`
    - Build command: `npm run build`
    - Build output directory: `.output/public`

### 2. Configure Bindings (Mandatory)
Go to **Settings** > **Functions** > **Bindings**:
- **D1 Database Binding**: 
    - Binding name: `DB`
    - D1 database: Select `digital-menu-db`.
- **R2 Bucket Binding**: 
    - Binding name: `BUCKET`
    - R2 bucket: Select `digital-menu-assets`.

### 3. Environment Variables
Go to **Settings** > **Environment Variables** and add:
- `JWT_SECRET`: Generate a secure random string.
- `R2_ACCESS_KEY`: Account API key for file uploads.
- `R2_SECRET_KEY`: Account API secret key.
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID.
- `R2_BUCKET_NAME`: `digital-menu-assets`.

### 4. Custom Domain
Go to **Custom Domains** tab:
- Add `menu.sothysek.com`.
- Follow the instructions to update your DNS records (CNAME) if the domain is managed outside of Cloudflare.

---

## 🖼️ 4. Image Hosting & Public Access

To allow public access to the uploaded images in the `digital-menu-assets` R2 bucket:
1. Navigate to **R2** > **digital-menu-assets** > **Settings**.
2. Under **Public Access**, enable **Managed Subdomain**.
3. Use the generated URL (e.g., `https://pub-xxxx.r2.dev`) as your base for the `image_url` property in the admin dashboard.

---

## 🛠️ 5. Routine Deployments

Once configured, simply push your changes to GitHub:
```bash
git add .
git commit -m "feat: updated dashboard logic"
git push origin main
```
Cloudflare will automatically build and deploy the update to **menu.sothysek.com**.

🚀 **Your Digital Menu is now ready for production!**
