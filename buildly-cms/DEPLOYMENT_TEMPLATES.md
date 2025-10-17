# Buildly CMS - GitHub Pages Deployment Template

## Quick Start

### Option 1: One-Click Setup (Recommended)
1. **Copy Buildly CMS** to your repository
2. **Download** the auto-deploy script from the CMS dashboard
3. **Run** the script in your repository root:
   ```bash
   chmod +x deploy-buildly-cms.sh
   ./deploy-buildly-cms.sh
   ```
4. **Enable GitHub Pages** in repository Settings > Pages
5. **Select "GitHub Actions"** as the deployment source

### Option 2: Manual Setup
1. Create `.github/workflows/deploy.yml` with the provided workflow
2. Create `admin.html` in your repository root
3. Commit and push changes
4. Enable GitHub Pages with GitHub Actions source

## Workflow Templates

### Basic Deployment (deploy.yml)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Validate Buildly CMS
        run: |
          if [ ! -d "buildly-cms" ]; then
            echo "❌ buildly-cms folder not found!"
            exit 1
          fi
          echo "✅ Buildly CMS validation passed!"
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Auto-Deploy with Environment Setup (auto-deploy.yml)
```yaml
name: Auto-Deploy Buildly CMS

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'production'
        type: choice
        options:
        - production
        - staging
        - development

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  auto-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install Buildly CMS
        run: |
          echo "🚀 Setting up Buildly CMS auto-deployment..."
          mkdir -p .buildly-cms/config
          
          # Create deployment configuration
          cat > .buildly-cms/config/deploy.json << EOF
          {
            "environment": "${{ github.event.inputs.environment }}",
            "repository": "${{ github.repository }}",
            "pages_url": "https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}",
            "admin_url": "https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/admin.html",
            "cms_demo_url": "https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/buildly-cms/demo.html"
          }
          EOF
          
      - name: Create integration files
        run: |
          # Create admin.html if it doesn't exist
          if [ ! -f "admin.html" ]; then
            cat > admin.html << 'EOF'
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Admin Dashboard - Buildly CMS</title>
              <link rel="stylesheet" href="buildly-cms/css/buildly-cms.css">
              <script src="buildly-cms/buildly-cms-config.js"></script>
          </head>
          <body class="bg-gray-50">
              <div class="container mx-auto p-6">
                  <h1 class="text-3xl font-bold mb-6">Site Administration</h1>
                  <div class="bg-white rounded-lg shadow p-6">
                      <p class="mb-4">Welcome to your Buildly CMS admin panel.</p>
                      <a href="buildly-cms/" class="btn btn-primary">Open CMS Dashboard</a>
                  </div>
              </div>
              <script src="buildly-cms/js/buildly-cms-core.js"></script>
          </body>
          </html>
          EOF
          fi
          
      - name: Commit and push changes
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add .
          if ! git diff --staged --quiet; then
            git commit -m "🚀 Auto-deploy: Setup Buildly CMS for GitHub Pages"
            git push
          fi
          
      - name: Deploy to Pages
        uses: actions/deploy-pages@v4
        if: github.ref == 'refs/heads/main'
```

## Repository Structure

Your repository should have this structure after setup:

```
your-repository/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── auto-deploy.yml (optional)
├── buildly-cms/
│   ├── index.html
│   ├── buildly-cms-config.js
│   ├── css/
│   │   └── buildly-cms.css
│   └── js/
│       └── buildly-cms-core.js
├── admin.html
├── index.html (your main site)
└── _config.yml (optional, for Jekyll compatibility)
```

## Configuration Files

### _config.yml (Jekyll Compatibility)
```yaml
# GitHub Pages configuration for Buildly CMS
title: "Your Site Name"
description: "Your site description"

# Include all files
include:
  - buildly-cms
  - admin.html
  - .well-known

# Exclude build files
exclude:
  - node_modules
  - package.json
  - .git
  - .github
  - README.md

# Buildly CMS settings
buildly_cms:
  enabled: true
  admin_path: "/admin.html"
  demo_path: "/buildly-cms/demo.html"
```

### Admin Integration (admin.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Buildly CMS</title>
    <link rel="stylesheet" href="buildly-cms/css/buildly-cms.css">
    <script src="buildly-cms/buildly-cms-config.js"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">Site Administration</h1>
        <div class="bg-white rounded-lg shadow p-6">
            <p class="mb-4">Welcome to your Buildly CMS admin panel.</p>
            <a href="buildly-cms/" class="btn btn-primary">Open CMS Dashboard</a>
        </div>
    </div>
    <script src="buildly-cms/js/buildly-cms-core.js"></script>
</body>
</html>
```

## Troubleshooting

### Common Issues

1. **Site not loading after deployment**
   - Check that GitHub Pages is enabled in Settings > Pages
   - Verify the source is set to "GitHub Actions"
   - Wait 5-10 minutes for initial deployment

2. **404 errors for CMS assets**
   - Ensure `buildly-cms/` folder is in repository root
   - Check that all required files are present
   - Verify paths in `admin.html` are correct

3. **Workflow failures**
   - Check Actions tab for detailed error logs
   - Ensure repository has Pages enabled
   - Verify workflow permissions are set correctly

4. **CORS errors**
   - GitHub Pages automatically handles CORS for same-origin requests
   - If issues persist, check browser console for specific errors

### Getting Help

1. **Check the CMS Dashboard** - Built-in troubleshooting tools
2. **Review GitHub Actions logs** - Detailed deployment information
3. **Validate configuration** - Use the CMS auto-detection features
4. **Repository issues** - Create an issue with deployment logs

## Advanced Configuration

### Custom Domain Setup
1. Add `CNAME` file to repository root with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

### Environment-Specific Deployments
- Use the auto-deploy workflow with environment inputs
- Create separate branches for staging/production
- Configure different CMS settings per environment

### Performance Optimization
- Enable caching in workflow
- Compress assets before deployment
- Use CDN for static assets

## Security Considerations

- Never commit sensitive configuration in public repositories
- Use GitHub Secrets for API keys and tokens
- Enable branch protection rules for production deployments
- Regularly update workflow actions to latest versions

---

🚀 **Ready to deploy?** Use the one-click setup from the Buildly CMS dashboard!

📚 **Need more help?** Check the [full documentation](../README.md) or visit the [demo site](demo.html).