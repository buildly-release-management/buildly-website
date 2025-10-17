/**
 * Buildly CMS Core JavaScript
 * Self-contained CMS functionality
 */

window.CMSCore = (function() {
    'use strict';

    let config = {};
    let currentSection = 'dashboard';
    let fileCache = {};
    let stats = {
        totalPages: 0,
        publishedArticles: 0,
        draftArticles: 0,
        aiAssists: 0
    };

    // Initialize CMS
    function init() {
        config = window.BuildlyCMS.config || window.BuildlyCMS.defaultConfig;
        
        setupNavigation();
        setupEventListeners();
        loadInitialData();
        updateUI();
        
        console.log('CMS Core initialized with config:', config);
    }

    // Navigation setup
    function setupNavigation() {
        const navItems = document.querySelectorAll('.cms-nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    switchSection(section);
                }
            });
        });
    }

    // Switch between sections
    function switchSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.cms-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(`section-${sectionName}`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Update navigation
        const navItems = document.querySelectorAll('.cms-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        currentSection = sectionName;
        
        // Load section-specific data
        loadSectionData(sectionName);
    }

    // Load section-specific data
    function loadSectionData(section) {
        switch(section) {
            case 'content':
                loadContentList();
                break;
            case 'files':
                loadFileList();
                break;
            case 'ai-tools':
                loadAITools();
                break;
            case 'settings':
                loadSettings();
                break;
            case 'github-setup':
                loadGitHubSetup();
                break;
        }
    }

    // Load content list
    function loadContentList() {
        const contentList = document.getElementById('content-list');
        if (!contentList) return;
        
        contentList.innerHTML = '<div class="cms-p-4 cms-text-center">Loading content...</div>';
        
        // Simulate API call - replace with actual file system access
        setTimeout(() => {
            const mockContent = [
                {
                    id: 1,
                    title: 'Getting Started with Buildly CMS',
                    type: 'article',
                    status: 'published',
                    lastModified: new Date().toISOString(),
                    category: 'Tutorial'
                },
                {
                    id: 2,
                    title: 'AI-Powered Content Creation',
                    type: 'article',
                    status: 'draft',
                    lastModified: new Date().toISOString(),
                    category: 'AI'
                }
            ];
            
            renderContentList(mockContent);
        }, 500);
    }

    // Render content list
    function renderContentList(content) {
        const contentList = document.getElementById('content-list');
        if (!contentList) return;
        
        if (content.length === 0) {
            contentList.innerHTML = '<div class="cms-p-8 cms-text-center cms-text-gray-500">No content found</div>';
            return;
        }
        
        const html = content.map(item => `
            <div class="cms-file-item">
                <div class="cms-file-info">
                    <div class="cms-file-icon ${item.type}">${item.type.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="cms-font-medium">${item.title}</div>
                        <div class="cms-text-sm cms-text-gray-500">${item.category} • ${formatDate(item.lastModified)}</div>
                    </div>
                </div>
                <div class="cms-flex cms-items-center cms-gap-2">
                    <span class="cms-status-badge cms-status-${item.status}">${item.status}</span>
                    <button class="cms-btn cms-btn-sm cms-btn-secondary" onclick="CMSCore.editContent(${item.id})">Edit</button>
                </div>
            </div>
        `).join('');
        
        contentList.innerHTML = html;
    }

    // Load file list
    function loadFileList() {
        // Implementation for file listing
        console.log('Loading file list...');
    }

    // Load AI tools
    function loadAITools() {
        console.log('Loading AI tools...');
    }

    // Load settings
    function loadSettings() {
        const settings = getStoredSettings();
        
        // Update form fields
        const siteNameInput = document.getElementById('site-name-input');
        if (siteNameInput) siteNameInput.value = settings.site.name || '';
        
        const siteUrlInput = document.getElementById('site-url-input');
        if (siteUrlInput) siteUrlInput.value = settings.site.url || '';
        
        const siteDescInput = document.getElementById('site-description-input');
        if (siteDescInput) siteDescInput.value = settings.site.description || '';
        
        const aiProvider = document.getElementById('ai-provider');
        if (aiProvider) aiProvider.value = settings.ai.defaultProvider || 'openai';
        
        const primaryColor = document.getElementById('primary-color');
        if (primaryColor) primaryColor.value = settings.theme.colors.primary || '#1B5FA3';
        
        const accentColor = document.getElementById('accent-color');
        if (accentColor) accentColor.value = settings.theme.colors.accent || '#F9943B';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Content search
        const contentSearch = document.getElementById('content-search');
        if (contentSearch) {
            contentSearch.addEventListener('input', debounce(filterContent, 300));
        }
        
        // Settings inputs
        const settingsInputs = document.querySelectorAll('#section-settings input, #section-settings select, #section-settings textarea');
        settingsInputs.forEach(input => {
            input.addEventListener('change', markSettingsChanged);
        });
    }

    // Load initial data
    function loadInitialData() {
        loadStats();
        loadRecentFiles();
    }

    // Load statistics
    function loadStats() {
        // Simulate loading stats - replace with actual file system scanning
        stats = {
            totalPages: Math.floor(Math.random() * 50) + 10,
            publishedArticles: Math.floor(Math.random() * 30) + 5,
            draftArticles: Math.floor(Math.random() * 10) + 2,
            aiAssists: Math.floor(Math.random() * 100) + 20
        };
        
        updateStatsDisplay();
    }

    // Update stats display
    function updateStatsDisplay() {
        const elements = {
            'total-pages': stats.totalPages,
            'published-articles': stats.publishedArticles,
            'draft-articles': stats.draftArticles,
            'ai-assists': stats.aiAssists
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                animateNumber(element, 0, value, 1000);
            }
        });
    }

    // Load recent files
    function loadRecentFiles() {
        const recentFilesList = document.getElementById('recent-files-list');
        if (!recentFilesList) return;
        
        // Mock recent files - replace with actual file system access
        const mockFiles = [
            { name: 'index.html', type: 'html', status: 'published', modified: new Date() },
            { name: 'about.html', type: 'html', status: 'published', modified: new Date(Date.now() - 86400000) },
            { name: 'blog-post.md', type: 'md', status: 'draft', modified: new Date(Date.now() - 172800000) },
            { name: 'contact.html', type: 'html', status: 'published', modified: new Date(Date.now() - 259200000) }
        ];
        
        const html = mockFiles.map(file => `
            <div class="cms-file-item">
                <div class="cms-file-info">
                    <div class="cms-file-icon ${file.type}">${file.type.toUpperCase()}</div>
                    <div>
                        <div class="cms-font-medium">${file.name}</div>
                        <div class="cms-text-sm cms-text-gray-500">${formatDate(file.modified)}</div>
                    </div>
                </div>
                <div class="cms-flex cms-items-center cms-gap-2">
                    <span class="cms-status-badge cms-status-${file.status}">${file.status}</span>
                    <button class="cms-btn cms-btn-sm cms-btn-secondary" onclick="CMSCore.editFile('${file.name}')">Edit</button>
                </div>
            </div>
        `).join('');
        
        recentFilesList.innerHTML = html;
    }

    // Update UI elements
    function updateUI() {
        const siteNameElements = document.querySelectorAll('#site-name');
        siteNameElements.forEach(el => {
            el.textContent = config.site.name || 'Buildly CMS';
        });
        
        const versionElement = document.getElementById('cms-version');
        if (versionElement) {
            versionElement.textContent = config.system.version || '1.0.0';
        }
    }

    // Utility functions
    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const range = end - start;
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (range * progress));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Storage functions
    function getStoredSettings() {
        try {
            const stored = localStorage.getItem('buildly-cms-settings');
            return stored ? JSON.parse(stored) : config;
        } catch (e) {
            console.error('Error loading settings:', e);
            return config;
        }
    }

    function saveStoredSettings(settings) {
        try {
            localStorage.setItem('buildly-cms-settings', JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    }

    // Public API
    return {
        init,
        switchSection,
        editContent: function(id) {
            console.log('Editing content:', id);
            // Implementation for content editing
        },
        editFile: function(filename) {
            console.log('Editing file:', filename);
            // Implementation for file editing
        },
        saveSettings: function() {
            const settings = Object.assign({}, config);
            
            // Update settings from form
            const siteNameInput = document.getElementById('site-name-input');
            if (siteNameInput) settings.site.name = siteNameInput.value;
            
            const siteUrlInput = document.getElementById('site-url-input');
            if (siteUrlInput) settings.site.url = siteUrlInput.value;
            
            const siteDescInput = document.getElementById('site-description-input');
            if (siteDescInput) settings.site.description = siteDescInput.value;
            
            const aiProvider = document.getElementById('ai-provider');
            if (aiProvider) settings.ai.defaultProvider = aiProvider.value;
            
            const primaryColor = document.getElementById('primary-color');
            if (primaryColor) settings.theme.colors.primary = primaryColor.value;
            
            const accentColor = document.getElementById('accent-color');
            if (accentColor) settings.theme.colors.accent = accentColor.value;
            
            if (saveStoredSettings(settings)) {
                alert('Settings saved successfully!');
                config = settings;
                updateUI();
            } else {
                alert('Error saving settings. Please try again.');
            }
        }
    };
})();

// Global functions for HTML onclick handlers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function createContent() {
    const type = document.getElementById('content-type').value;
    const title = document.getElementById('content-title').value;
    const category = document.getElementById('content-category').value;
    
    if (!title.trim()) {
        alert('Please enter a title for the content.');
        return;
    }
    
    console.log('Creating content:', { type, title, category });
    
    // Implementation for content creation
    alert(`Creating ${type}: "${title}" in ${category} category`);
    closeModal('new-content-modal');
    
    // Clear form
    document.getElementById('content-title').value = '';
}

function updateTheme() {
    const primaryColor = document.getElementById('primary-color').value;
    const accentColor = document.getElementById('accent-color').value;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--cms-primary', primaryColor);
    document.documentElement.style.setProperty('--cms-accent', accentColor);
    
    console.log('Theme updated:', { primaryColor, accentColor });
}

function saveSettings() {
    if (window.CMSCore) {
        CMSCore.saveSettings();
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        localStorage.removeItem('buildly-cms-settings');
        location.reload();
    }
}

function filterContent() {
    const searchTerm = document.getElementById('content-search').value.toLowerCase();
    console.log('Filtering content with term:', searchTerm);
    // Implementation for content filtering
}

function markSettingsChanged() {
    console.log('Settings changed - add save indicator');
    // Implementation to show unsaved changes indicator
}

function createNewContent() {
    openModal('new-content-modal');
}

function importContent() {
    console.log('Import content functionality');
    // Implementation for content import
}

// GitHub Pages Setup Functions
function downloadWorkflowFiles() {
    const deployWorkflow = `name: Deploy to GitHub Pages

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
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

    const autoDeployWorkflow = `name: Auto-Deploy Buildly CMS

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
      - name: Setup Buildly CMS
        run: |
          echo "🚀 Setting up Buildly CMS auto-deployment..."
          mkdir -p .buildly-cms/config
      - name: Deploy to Pages
        uses: actions/deploy-pages@v4`;

    // Create downloadable ZIP with workflow files
    const zip = new JSZip();
    zip.file('deploy.yml', deployWorkflow);
    zip.file('auto-deploy.yml', autoDeployWorkflow);
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'github-workflows.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ GitHub Actions workflow files downloaded! Extract to .github/workflows/ in your repository.', 'success');
    });
}

function generateDeployScript() {
    const script = `#!/bin/bash
# Buildly CMS GitHub Pages Auto-Deploy Script
# Run this script in your repository root

echo "🚀 Setting up Buildly CMS for GitHub Pages..."

# Create .github/workflows directory
mkdir -p .github/workflows

# Create deployment workflow
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
EOF

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
    echo "✅ Created admin.html"
fi

# Commit and push
git add .
git commit -m "🚀 Setup Buildly CMS for GitHub Pages"
git push

echo "✅ Setup complete! Now enable GitHub Pages in your repository settings:"
echo "1. Go to Settings > Pages"
echo "2. Select 'GitHub Actions' as source"
echo "3. Save and wait for deployment"
echo ""
echo "Your site will be available at: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\\([^/]*\\)\\/\\([^.]*\\).*/\\1.github.io\\/\\2/')/"`;

    // Download script
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-buildly-cms.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Deploy script downloaded! Run chmod +x deploy-buildly-cms.sh && ./deploy-buildly-cms.sh in your repository.', 'success');
}
function loadGitHubSetup() {
    updateGitHubDetection();
    generateGitHubConfig();
}

function updateGitHubDetection() {
    const detectionResults = document.getElementById('detection-results');
    if (!detectionResults) return;
    
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    const isGitHubPages = hostname.endsWith('.github.io') || 
                         hostname === 'github.io' ||
                         (hostname.includes('github') && hostname.includes('pages'));
    
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    let html = '<div class="cms-grid cms-gap-4">';
    
    // Current Environment
    html += '<div>';
    html += '<h4 class="cms-font-semibold cms-mb-2">Current Environment:</h4>';
    html += `<p><strong>URL:</strong> ${protocol}//${hostname}${port ? ':' + port : ''}${pathname}</p>`;
    html += `<p><strong>Hostname:</strong> ${hostname}</p>`;
    html += `<p><strong>Path:</strong> ${pathname}</p>`;
    html += `<p><strong>GitHub Pages:</strong> ${isGitHubPages ? '✅ Yes' : '❌ No'}</p>`;
    html += `<p><strong>Local Development:</strong> ${isLocalhost ? '✅ Yes' : '❌ No'}</p>`;
    html += '</div>';
    
    // Repository Detection
    if (isGitHubPages) {
        const parts = pathname.split('/').filter(Boolean);
        const repoName = parts.length > 0 ? parts[0] : 'root';
        const username = hostname.split('.')[0];
        
        html += '<div>';
        html += '<h4 class="cms-font-semibold cms-mb-2">GitHub Pages Configuration:</h4>';
        html += `<p><strong>Username:</strong> ${username}</p>`;
        html += `<p><strong>Repository:</strong> ${repoName}</p>`;
        html += `<p><strong>Base URL:</strong> ${repoName !== 'root' ? `/${repoName}` : '/'}</p>`;
        html += `<p><strong>CMS Path:</strong> ${repoName !== 'root' ? `/${repoName}/buildly-cms/` : '/buildly-cms/'}</p>`;
        html += '</div>';
    }
    
    html += '</div>';
    
    detectionResults.innerHTML = html;
    
    // Update status
    const statusEl = document.getElementById('github-status');
    if (statusEl) {
        if (isGitHubPages) {
            statusEl.innerHTML = '<div class="cms-bg-green-100 cms-border cms-border-green-300 cms-text-green-800 cms-p-3 cms-rounded">✅ GitHub Pages detected! This CMS is properly configured for your environment.</div>';
        } else if (isLocalhost) {
            statusEl.innerHTML = '<div class="cms-bg-blue-100 cms-border cms-border-blue-300 cms-text-blue-800 cms-p-3 cms-rounded">🔧 Local development detected. Follow the steps below to deploy to GitHub Pages.</div>';
        } else {
            statusEl.innerHTML = '<div class="cms-bg-yellow-100 cms-border cms-border-yellow-300 cms-text-yellow-800 cms-p-3 cms-rounded">⚠️ Custom hosting detected. The steps below are for GitHub Pages deployment.</div>';
        }
    }
}

function generateGitHubConfig() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const isGitHubPages = hostname.endsWith('.github.io');
    
    let configCode = '';
    
    if (isGitHubPages) {
        const parts = pathname.split('/').filter(Boolean);
        const repoName = parts.length > 0 ? parts[0] : null;
        const username = hostname.split('.')[0];
        const baseUrl = repoName ? `/${repoName}` : '';
        
        configCode = `// Auto-detected configuration for GitHub Pages
BuildlyCMS.init({
    site: {
        name: "${repoName || username}'s Website",
        url: "https://${hostname}${baseUrl}",
        description: "My GitHub Pages website with Buildly CMS"
    },
    system: {
        basePath: "${baseUrl}/buildly-cms/",
        githubPages: true
    },
    theme: {
        colors: {
            primary: "#1B5FA3",
            accent: "#F9943B"
        }
    }
});`;
    } else {
        configCode = `// Configuration for GitHub Pages deployment
BuildlyCMS.init({
    site: {
        name: "My GitHub Pages Site",
        url: "https://username.github.io/repo-name",
        description: "My website powered by Buildly CMS"
    },
    system: {
        basePath: "/repo-name/buildly-cms/", // Update with your repo name
        githubPages: true
    },
    theme: {
        colors: {
            primary: "#1B5FA3",
            accent: "#F9943B"
        }
    }
});`;
    }
    
    const codeElement = document.getElementById('github-config-code');
    if (codeElement) {
        codeElement.textContent = configCode;
    }
    
    return configCode;
}

function openGitHubRepo() {
    window.open('https://github.com/new', '_blank');
}

function openGitHubPagesSettings() {
    const hostname = window.location.hostname;
    if (hostname.endsWith('.github.io')) {
        const username = hostname.split('.')[0];
        const parts = window.location.pathname.split('/').filter(Boolean);
        const repoName = parts.length > 0 ? parts[0] : username + '.github.io';
        window.open(`https://github.com/${username}/${repoName}/settings/pages`, '_blank');
    } else {
        window.open('https://github.com', '_blank');
        alert('Please navigate to your repository settings and find the "Pages" section.');
    }
}

function downloadCMSFiles() {
    // Create a simple download link for the CMS files
    alert('To download CMS files:\n1. Right-click and "Save As" on buildly-cms folder\n2. Or copy the folder from your current setup\n3. Include all files: CSS, JS, HTML, and config');
}

function showGitCommands() {
    const commands = `# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add Buildly CMS to website"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/username/repo-name.git

# Push to GitHub
git push -u origin main

# For future updates
git add .
git commit -m "Update content"
git push`;

    const modal = document.createElement('div');
    modal.className = 'cms-modal active';
    modal.innerHTML = `
        <div class="cms-modal-content" style="max-width: 600px;">
            <div class="cms-p-6 cms-border-b cms-border-gray-200">
                <h3 class="cms-text-lg cms-font-semibold">Git Commands for GitHub Pages</h3>
            </div>
            <div class="cms-p-6">
                <pre class="cms-bg-gray-100 cms-p-4 cms-rounded cms-text-sm cms-overflow-auto" style="white-space: pre-wrap;">${commands}</pre>
                <div class="cms-flex cms-justify-end cms-gap-2 cms-mt-4">
                    <button class="cms-btn cms-btn-secondary" onclick="this.closest('.cms-modal').remove()">Close</button>
                    <button class="cms-btn cms-btn-primary" onclick="copyToClipboard('${commands.replace(/'/g, "\\'")}')">Copy Commands</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function copyConfigToClipboard() {
    const config = generateGitHubConfig();
    copyToClipboard(config);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copied to clipboard!');
    });
}