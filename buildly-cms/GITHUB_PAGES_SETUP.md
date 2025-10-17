# GitHub Pages Deployment for Buildly CMS

This guide will help you deploy your Buildly CMS-powered website to GitHub Pages in just a few minutes.

## 🚀 Quick Start (3 Steps)

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **For personal site**: `username.github.io`
   - **For project site**: `your-project-name`
3. Make it public (required for free GitHub Pages)
4. Initialize with README (optional)

### Step 2: Prepare Your Files

Your website structure should look like this:

```
your-website/
├── index.html              # Your homepage
├── admin.html              # CMS admin page
├── buildly-cms/            # CMS folder (entire folder)
│   ├── index.html
│   ├── buildly-cms-config.js
│   ├── css/buildly-cms.css
│   ├── js/buildly-cms-core.js
│   └── demo.html
├── css/                    # Your site styles
├── js/                     # Your site scripts
└── other-files...
```

### Step 3: Upload and Configure

#### Option A: GitHub Web Interface
1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop your entire website folder
4. Commit the files

#### Option B: Git Commands
```bash
# Clone your repository
git clone https://github.com/username/repository-name.git
cd repository-name

# Copy your website files to this directory
# (including the buildly-cms folder)

# Add and commit
git add .
git commit -m "Deploy website with Buildly CMS"
git push origin main
```

## ⚙️ Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

Your site will be available at:
- Personal site: `https://username.github.io`
- Project site: `https://username.github.io/repository-name`

## 🔧 Configure CMS for GitHub Pages

Update your `admin.html` file with the correct configuration:

### For Personal Site (username.github.io)
```html
<script src="buildly-cms/buildly-cms-config.js"></script>
<script>
BuildlyCMS.init({
    site: {
        name: "My Personal Website",
        url: "https://username.github.io"
    },
    system: {
        basePath: "/buildly-cms/",
        githubPages: true
    }
});
</script>
<iframe src="buildly-cms/index.html" width="100%" height="800px"></iframe>
```

### For Project Site (username.github.io/project-name)
```html
<script src="buildly-cms/buildly-cms-config.js"></script>
<script>
BuildlyCMS.init({
    site: {
        name: "My Project Website",
        url: "https://username.github.io/project-name"
    },
    system: {
        basePath: "/project-name/buildly-cms/",
        githubPages: true
    }
});
</script>
<iframe src="buildly-cms/index.html" width="100%" height="800px"></iframe>
```

## 🔍 Auto-Detection

Buildly CMS automatically detects GitHub Pages and configures paths correctly. The system will:

- ✅ Detect GitHub Pages environment
- ✅ Auto-configure base paths
- ✅ Adjust asset loading
- ✅ Handle repository structure

## 📝 Example Repository Structure

Here's what your repository should look like:

```
my-website/
├── .github/
│   └── workflows/          # Optional: GitHub Actions
├── buildly-cms/            # 📁 Buildly CMS (entire folder)
│   ├── index.html
│   ├── buildly-cms-config.js
│   ├── css/buildly-cms.css
│   ├── js/buildly-cms-core.js
│   ├── demo.html
│   ├── README.md
│   └── package.json
├── css/
│   └── style.css           # Your site styles
├── js/
│   └── main.js             # Your site scripts
├── images/
├── index.html              # Your homepage
├── admin.html              # CMS admin access
├── about.html              # Other pages
├── README.md
└── CNAME                   # Optional: for custom domain
```

## 🎯 Testing Locally

Before deploying, test locally:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Then visit: `http://localhost:8080/admin.html`

## 🔧 Troubleshooting

### Common Issues

**404 Errors**
- Ensure `buildly-cms` folder is in repository root
- Check that all files uploaded correctly
- Verify GitHub Pages is enabled

**Path Issues**
- Update `basePath` in configuration
- Use relative paths (no leading /)
- Check repository name in URLs

**Changes Not Showing**
- GitHub Pages can take 5-10 minutes to update
- Check repository Actions tab for build status
- Clear browser cache

**CORS Errors**
- GitHub Pages handles CORS automatically for same-origin
- Ensure all CMS files are on same domain

### Getting Help

1. **CMS Dashboard**: Check the "GitHub Pages Setup" section
2. **Auto-Detection**: View current environment detection
3. **GitHub Docs**: [pages.github.com](https://pages.github.com)
4. **Buildly Support**: [docs.buildly.io](https://docs.buildly.io)

## 🌟 Custom Domain (Optional)

To use your own domain:

1. Add `CNAME` file to repository root:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   ```
   CNAME record: www.yourdomain.com → username.github.io
   A records: yourdomain.com → GitHub IPs
   ```

3. Enable HTTPS in GitHub Pages settings

## 🚀 Deployment Checklist

- [ ] Repository created on GitHub
- [ ] Files uploaded (including buildly-cms folder)
- [ ] GitHub Pages enabled in settings
- [ ] Configuration updated for GitHub Pages
- [ ] Site accessible at GitHub Pages URL
- [ ] Admin panel working at `/admin.html`
- [ ] CMS functions properly

## 📊 What's Included

Your GitHub Pages deployment includes:

- ✅ **Complete CMS** - Content management system
- ✅ **AI Tools** - Content generation and optimization
- ✅ **File Manager** - Website file organization
- ✅ **SEO Tools** - Meta tags and optimization
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Zero Backend** - Works entirely client-side
- ✅ **Free Hosting** - Powered by GitHub Pages

---

**🎉 Congratulations!** Your website is now live with a powerful AI-driven CMS.

Visit your admin panel at: `https://username.github.io/admin.html`