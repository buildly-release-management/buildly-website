#!/usr/bin/env python3
"""
Enhanced HTTP server for local development with file saving capability.
This extends Python's simple HTTP server to handle POST requests for saving files.
"""

import os
import json
import urllib.parse
import re
import glob
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class AdminHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"GET request: {self.path}")
        if self.path == '/api/articles-list':
            self.handle_articles_list()
        elif self.path == '/api/social-accounts':
            self.handle_get_social_accounts()
        elif self.path == '/admin/get-navigation':
            self.handle_get_navigation()
        elif self.path.startswith('/api/read-file?'):
            self.handle_read_file()
        elif self.path == '/api/list-html-files':
            self.handle_list_html_files()
        elif self.path.startswith('/preview/'):
            self.handle_preview()
        else:
            super().do_GET()
    
    def do_POST(self):
        print(f"POST request: {self.path}")
        if self.path == '/save-file':
            self.handle_save_file()
        elif self.path == '/api/set-featured-article':
            self.handle_set_featured_article()
        elif self.path == '/api/regenerate-articles-page':
            self.handle_regenerate_articles_page()
        elif self.path == '/api/social-accounts':
            self.handle_save_social_accounts()
        elif self.path == '/admin/save-navigation':
            self.handle_save_navigation()
        elif self.path == '/api/create-new-page':
            self.handle_create_new_page()
        elif self.path == '/api/create-preview':
            self.handle_create_preview()
        else:
            self.send_error(404, "Not Found")
    
    def handle_articles_list(self):
        """Get list of all articles with metadata"""
        try:
            articles = []
            articles_dir = Path('articles')
            
            if articles_dir.exists():
                for html_file in articles_dir.glob('*.html'):
                    try:
                        with open(html_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Extract metadata from HTML
                        title = self.extract_html_title(content)
                        description = self.extract_html_meta(content, 'description')
                        keywords = self.extract_html_meta(content, 'keywords')
                        category = self.categorize_article(title, content, keywords)
                        
                        articles.append({
                            'filename': f'articles/{html_file.name}',
                            'title': title or html_file.stem.replace('-', ' ').title(),
                            'description': description or 'No description available',
                            'keywords': keywords or '',
                            'category': category
                        })
                    except Exception as e:
                        print(f"❌ Error processing {html_file}: {e}")
                        continue
            
            # Sort articles by title
            articles.sort(key=lambda x: x['title'])
            
            self.send_json_response({'articles': articles})
            
        except Exception as e:
            print(f"❌ Error loading articles: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_read_file(self):
        """Read file content for editing"""
        try:
            # Parse query parameters
            from urllib.parse import parse_qs, urlparse
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            
            file_path = params.get('file', [None])[0]
            if not file_path:
                self.send_error(400, "Missing file parameter")
                return
            
            # Security check - ensure file is within allowed directories
            allowed_paths = ['articles/', 'templates/', 'includes/', '']
            if not any(file_path.startswith(path) for path in allowed_paths):
                self.send_error(403, "Access denied")
                return
            
            # Read file content
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
                print(f"📖 File read: {file_path} ({len(content)} chars)")
            else:
                self.send_error(404, f"File not found: {file_path}")
                
        except Exception as e:
            print(f"❌ Error reading file: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_preview(self):
        """Handle preview requests with corrected asset paths"""
        try:
            # Extract the actual file path from /preview/filename.html
            preview_path = self.path[9:]  # Remove '/preview/' prefix
            
            # Remove query parameters if they exist
            if '?' in preview_path:
                preview_path = preview_path.split('?')[0]
            
            if not os.path.exists(preview_path):
                self.send_error(404, f"Preview file not found: {preview_path}")
                return
            
            # Read the file content (paths are already corrected during creation)
            with open(preview_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Send the modified content
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            # Add headers to prevent caching for live preview
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
            print(f"🔍 Preview served: {preview_path}")
            
        except Exception as e:
            print(f"❌ Error serving preview: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_create_new_page(self):
        """Create a new page from template based on page type"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            title = data.get('title', '')
            filename = data.get('filename', '')
            page_type = data.get('pageType', 'basic')
            
            if not title or not filename:
                self.send_error(400, "Title and filename are required")
                return
            
            # Ensure filename ends with .html
            if not filename.endswith('.html'):
                filename += '.html'
            
            # Check if file already exists
            if os.path.exists(filename):
                self.send_json_response({
                    'success': False,
                    'error': 'file_exists',
                    'message': f'File {filename} already exists. Please choose a different filename.'
                }, status_code=409)
                return
            
            # Generate content based on page type
            new_content = self.generate_page_template(title, filename, page_type)
            
            # Create the new file
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            self.send_json_response({
                'success': True, 
                'message': f'Page {filename} created successfully',
                'filename': filename,
                'pageType': page_type
            })
            print(f"📄 New {page_type} page created: {filename}")
            
        except Exception as e:
            print(f"❌ Error creating new page: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_create_preview(self):
        """Create a temporary preview file for live preview"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            content = data.get('content', '')
            filename = data.get('filename', 'preview.html')
            
            if not content:
                self.send_error(400, "Content is required")
                return
            
            # Create preview filename based on original filename
            base_name = filename.replace('.html', '') if filename.endswith('.html') else filename
            preview_filename = f".preview-{base_name}.html"
            
            # Apply path corrections for preview context
            # Since preview is served from /preview/, we need to go up one level to reach assets
            preview_content = content.replace('src="/js/', 'src="../js/')
            preview_content = preview_content.replace('href="/css/', 'href="../css/')
            preview_content = preview_content.replace('src="/media/', 'src="../media/')
            preview_content = preview_content.replace('href="/media/', 'href="../media/')
            # Also fix any other absolute paths
            preview_content = preview_content.replace('action="/', 'action="../')
            preview_content = preview_content.replace('href="/', 'href="../')
            
            # Write the preview file with corrected paths
            with open(preview_filename, 'w', encoding='utf-8') as f:
                f.write(preview_content)
            
            self.send_json_response({
                'success': True,
                'previewFile': preview_filename,
                'message': 'Preview file created'
            })
            
            print(f"🔍 Preview file created: {preview_filename}")
            
        except Exception as e:
            print(f"❌ Error creating preview: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_list_html_files(self):
        """Get list of all HTML files in the website directory"""
        try:
            html_files = []
            base_path = Path('.')
            
            # Common file descriptions
            file_descriptions = {
                'index.html': 'Homepage',
                'labs.html': 'Labs Platform Page',
                'pricing.html': 'Pricing Page',
                'use-cases.html': 'Use Cases Page',
                'articles.html': 'Articles Listing',
                'team.html': 'Team Page',
                'rad-core.html': 'RAD Core Page',
                'demo.html': 'Demo Page',
                'developer.html': 'Developer Page',
                'product-manager.html': 'Product Manager Page',
                'brand-guidelines.html': 'Brand Guidelines',
                'cloud-native-hosting.html': 'Cloud Native Hosting',
                'migrating-legacy-systems.html': 'Legacy Systems Migration',
                'unsubscribe.html': 'Unsubscribe Page'
            }
            
            # Find all HTML files in root directory
            for html_file in base_path.glob('*.html'):
                if html_file.name.startswith('.') or html_file.name.endswith('.amp.html'):
                    continue  # Skip hidden files and AMP files
                    
                filename = html_file.name
                description = file_descriptions.get(filename, 'Website Page')
                
                html_files.append({
                    'filename': filename,
                    'description': description,
                    'path': str(html_file)
                })
            
            # Sort files by description
            html_files.sort(key=lambda x: x['description'])
            
            # Send response
            self.send_json_response({
                'files': html_files,
                'count': len(html_files)
            })
            
            print(f"📁 Listed {len(html_files)} HTML files")
            
        except Exception as e:
            print(f"❌ Error listing HTML files: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def generate_page_template(self, title, filename, page_type):
        """Generate HTML content based on page type"""
        page_url = f"https://www.buildly.io/{filename}"
        
        # Common head section
        head_section = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Load common elements -->
    <script src="/js/buildly-head.js"></script>
    
    <!-- Page-specific customization -->
    <title>{title} - Buildly</title>
    <meta name="description" content="{self.get_page_description(title, page_type)}">
    <meta name="keywords" content="{self.get_page_keywords(title, page_type)}">
    <link rel="canonical" href="{page_url}">
    
    <!-- Open Graph tags -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{page_url}">
    <meta property="og:title" content="{title} - Buildly">
    <meta property="og:description" content="{self.get_page_description(title, page_type)}">
    <meta property="og:image" content="https://www.buildly.io/media/buildly-logo.svg">
</head>
<body>
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/">
                        <img src="/media/buildly-logo.svg" alt="Buildly" class="h-8 w-auto">
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium">Home</a>
                    <a href="/labs.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium">Labs</a>
                    <a href="/use-cases.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium">Use Cases</a>
                    <a href="/pricing.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                    <a href="https://labs.buildly.io" class="bg-buildly-primary text-white px-4 py-2 rounded-md hover:bg-buildly-secondary">Try for Free</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->'''

        # Page-specific content based on type
        main_content = self.get_page_content(title, page_type)
        
        # Common footer
        footer_section = '''
    <!-- Footer -->
    <footer class="bg-buildly-dark text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center">
                <img src="/media/buildly-logo.svg" alt="Buildly" class="h-8 w-auto mx-auto mb-4 brightness-0 invert">
                <p>&copy; 2024 Buildly. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>'''

        return head_section + main_content + footer_section
    
    def get_page_description(self, title, page_type):
        """Generate appropriate description based on page type"""
        descriptions = {
            'landing': f"{title} - AI-powered software development platform by Buildly. Accelerate your development with intelligent automation and team collaboration tools.",
            'service': f"{title} - Advanced development features and tools by Buildly. Discover how AI-powered solutions can transform your software development process.",
            'company': f"{title} - Learn more about Buildly, our mission, and how we're revolutionizing software development with AI-powered tools and collaborative platforms.",
            'pricing': f"{title} - Transparent pricing for Buildly's AI-powered development platform. Choose the plan that fits your team's needs with flexible options.",
            'documentation': f"{title} - Comprehensive guides and documentation for Buildly's AI development platform. Learn how to maximize your productivity.",
            'basic': f"{title} - Buildly AI-powered software development platform information and resources."
        }
        return descriptions.get(page_type, descriptions['basic'])
    
    def get_page_keywords(self, title, page_type):
        """Generate appropriate keywords based on page type"""
        base_keywords = "buildly, AI development, software development, team collaboration"
        type_keywords = {
            'landing': "AI platform, development tools, productivity",
            'service': "development features, AI tools, automation",
            'company': "about buildly, team, company info",
            'pricing': "pricing plans, subscription, development costs",
            'documentation': "guides, tutorials, documentation, help",
            'basic': "information, resources"
        }
        return f"{base_keywords}, {type_keywords.get(page_type, '')}, {title.lower()}"
    
    def get_page_content(self, title, page_type):
        """Generate page-specific content based on type"""
        
        if page_type == 'landing':
            return f'''
    <main>
        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-buildly-primary to-buildly-secondary text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
                <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Accelerate your development with AI-powered tools and collaborative workflows</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="https://labs.buildly.io" class="bg-buildly-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">Get Started Free</a>
                    <a href="#learn-more" class="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-buildly-primary transition-colors">Learn More</a>
                </div>
            </div>
        </section>

        <!-- Content Section -->
        <section class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-buildly-dark mb-4">Why Choose {title}?</h2>
                    <p class="text-xl text-gray-600">Add your compelling value propositions here</p>
                </div>
                
                <!-- Feature Grid -->
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-buildly-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">🚀</span>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Fast Development</h3>
                        <p class="text-gray-600">Accelerate your development process with AI-powered tools</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-buildly-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">🤝</span>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Team Collaboration</h3>
                        <p class="text-gray-600">Seamless collaboration tools for distributed teams</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-buildly-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl">⚡</span>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">AI-Powered</h3>
                        <p class="text-gray-600">Intelligent automation and code assistance</p>
                    </div>
                </div>
            </div>
        </section>
    </main>'''
        
        elif page_type == 'service':
            return f'''
    <main class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Page Header -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-6">{title}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive service description and benefits</p>
            </div>

            <!-- Service Overview -->
            <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
                <h2 class="text-2xl font-bold text-buildly-dark mb-4">Service Overview</h2>
                <p class="text-gray-600 mb-6">Detailed description of what this service provides and how it benefits users.</p>
                
                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Key Features</h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Feature one</li>
                            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Feature two</li>
                            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Feature three</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Benefits</h3>
                        <ul class="space-y-2 text-gray-600">
                            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Benefit one</li>
                            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Benefit two</li>
                            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Benefit three</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="text-center">
                <a href="https://labs.buildly.io" class="bg-buildly-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-buildly-secondary transition-colors">Try {title}</a>
            </div>
        </div>
    </main>'''
        
        elif page_type == 'company':
            return f'''
    <main class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Page Header -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-6">{title}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Learn more about our company, mission, and team</p>
            </div>

            <!-- Company Info -->
            <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-buildly-dark mb-4">Our Mission</h2>
                        <p class="text-gray-600 mb-6">We're revolutionizing software development by providing AI-powered tools that enhance productivity and foster collaboration.</p>
                        <p class="text-gray-600">Add more details about your company mission, values, and what makes you unique in the market.</p>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-8 text-center">
                        <p class="text-4xl mb-4">🏢</p>
                        <p class="text-gray-600">Company image or additional content</p>
                    </div>
                </div>
            </div>

            <!-- Contact Info -->
            <div class="text-center">
                <h2 class="text-2xl font-bold text-buildly-dark mb-6">Get in Touch</h2>
                <p class="text-gray-600 mb-8">Ready to transform your development process?</p>
                <a href="https://labs.buildly.io" class="bg-buildly-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-buildly-secondary transition-colors">Contact Us</a>
            </div>
        </div>
    </main>'''
        
        elif page_type == 'pricing':
            return f'''
    <main class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Page Header -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-6">{title}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Choose the plan that fits your team's needs</p>
            </div>

            <!-- Pricing Grid -->
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Free Plan -->
                <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h3 class="text-xl font-bold text-buildly-dark mb-4">Free</h3>
                    <div class="text-4xl font-bold text-buildly-primary mb-4">$0</div>
                    <p class="text-gray-600 mb-6">Perfect for getting started</p>
                    <ul class="space-y-2 text-gray-600 mb-8">
                        <li>Basic features</li>
                        <li>Limited projects</li>
                        <li>Community support</li>
                    </ul>
                    <a href="https://labs.buildly.io" class="block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Get Started</a>
                </div>

                <!-- Pro Plan -->
                <div class="bg-white rounded-lg shadow-lg p-8 text-center border-2 border-buildly-primary">
                    <h3 class="text-xl font-bold text-buildly-dark mb-4">Pro</h3>
                    <div class="text-4xl font-bold text-buildly-primary mb-4">$29</div>
                    <p class="text-gray-600 mb-6">For growing teams</p>
                    <ul class="space-y-2 text-gray-600 mb-8">
                        <li>All basic features</li>
                        <li>Unlimited projects</li>
                        <li>Priority support</li>
                        <li>Advanced AI tools</li>
                    </ul>
                    <a href="https://labs.buildly.io" class="block bg-buildly-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-buildly-secondary transition-colors">Start Free Trial</a>
                </div>

                <!-- Enterprise Plan -->
                <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                    <h3 class="text-xl font-bold text-buildly-dark mb-4">Enterprise</h3>
                    <div class="text-4xl font-bold text-buildly-primary mb-4">Custom</div>
                    <p class="text-gray-600 mb-6">For large organizations</p>
                    <ul class="space-y-2 text-gray-600 mb-8">
                        <li>Everything in Pro</li>
                        <li>Custom integrations</li>
                        <li>Dedicated support</li>
                        <li>SLA guarantees</li>
                    </ul>
                    <a href="https://labs.buildly.io" class="block bg-buildly-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">Contact Sales</a>
                </div>
            </div>
        </div>
    </main>'''
        
        elif page_type == 'documentation':
            return f'''
    <main class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Page Header -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-6">{title}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive guides and documentation</p>
            </div>

            <div class="grid lg:grid-cols-4 gap-8">
                <!-- Sidebar Navigation -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-lg p-6">
                        <h3 class="font-semibold mb-4">Documentation</h3>
                        <nav class="space-y-2">
                            <a href="#getting-started" class="block text-buildly-primary hover:underline">Getting Started</a>
                            <a href="#guides" class="block text-gray-600 hover:text-buildly-primary">User Guides</a>
                            <a href="#api" class="block text-gray-600 hover:text-buildly-primary">API Reference</a>
                            <a href="#examples" class="block text-gray-600 hover:text-buildly-primary">Examples</a>
                        </nav>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-3">
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-buildly-dark mb-6">Getting Started</h2>
                        <div class="prose max-w-none">
                            <p class="text-gray-600 mb-4">Welcome to the {title}. This guide will help you get up and running quickly.</p>
                            
                            <h3 class="text-lg font-semibold mb-3">Quick Setup</h3>
                            <ol class="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                                <li>Step one of the setup process</li>
                                <li>Step two of the setup process</li>
                                <li>Step three of the setup process</li>
                            </ol>

                            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 class="font-semibold mb-2">💡 Pro Tip</h4>
                                <p class="text-gray-600">Add helpful tips and best practices here.</p>
                            </div>

                            <h3 class="text-lg font-semibold mb-3">Next Steps</h3>
                            <p class="text-gray-600">Continue with the advanced guides to unlock more features.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>'''
        
        else:  # basic page
            return f'''
    <main class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-6">{title}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Welcome to your new page!</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-bold text-buildly-dark mb-4">Page Content</h2>
                <p class="text-gray-600 mb-6">This is your new page. Start editing to add your content here.</p>
                
                <div class="bg-gray-50 rounded-lg p-6">
                    <p class="text-gray-600">Add your content, images, and other elements to make this page unique and valuable for your visitors.</p>
                </div>
            </div>
        </div>
    </main>'''
    
    def handle_set_featured_article(self):
        """Set the featured article"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Store featured article data (in a real app, this would go to a database)
            # For now, we'll store it in a simple JSON file
            featured_data = {
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'link': data.get('link', ''),
                'category': data.get('category', '')
            }
            
            with open('.featured-article.json', 'w', encoding='utf-8') as f:
                json.dump(featured_data, f, indent=2)
            
            self.send_json_response({'success': True, 'message': 'Featured article updated'})
            print(f"⭐ Featured article set: {featured_data['title']}")
            
        except Exception as e:
            print(f"❌ Error setting featured article: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_regenerate_articles_page(self):
        """Regenerate the articles.html page with current articles and featured article"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            featured_article = data.get('featuredArticle', {})
            
            # Get all articles
            articles = []
            articles_dir = Path('articles')
            
            if articles_dir.exists():
                for html_file in articles_dir.glob('*.html'):
                    try:
                        with open(html_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        title = self.extract_html_title(content)
                        description = self.extract_html_meta(content, 'description')
                        keywords = self.extract_html_meta(content, 'keywords')
                        category = self.categorize_article(title, content, keywords)
                        
                        articles.append({
                            'filename': f'articles/{html_file.name}',
                            'title': title or html_file.stem.replace('-', ' ').title(),
                            'description': description or 'No description available',
                            'keywords': keywords or '',
                            'category': category
                        })
                    except Exception as e:
                        print(f"❌ Error processing {html_file}: {e}")
                        continue
            
            # Generate the new articles.html content
            new_content = self.generate_articles_html(articles, featured_article)
            
            # Write the new articles.html
            with open('articles.html', 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            self.send_json_response({'success': True, 'message': 'Articles page regenerated'})
            print(f"🚀 Articles page regenerated with {len(articles)} articles")
            
        except Exception as e:
            print(f"❌ Error regenerating articles page: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def extract_html_title(self, content):
        """Extract title from HTML content"""
        title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        if title_match:
            title = title_match.group(1).strip()
            # Remove " - Buildly" suffix if present
            return re.sub(r'\s*-\s*Buildly\s*$', '', title).strip()
        
        # Fallback: look for h1
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
        if h1_match:
            return re.sub(r'<[^>]+>', '', h1_match.group(1)).strip()
        
        return None
    
    def extract_html_meta(self, content, meta_name):
        """Extract meta tag content from HTML"""
        pattern = rf'<meta[^>]*name=["\']({meta_name})["\'][^>]*content=["\']([^"\']*)["\']'
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(2).strip()
        
        # Try the other way around (content first, then name)
        pattern = rf'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']({meta_name})["\']'
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        return None
    
    def categorize_article(self, title, content, keywords):
        """Categorize article based on title, content, and keywords"""
        text_to_analyze = f"{title} {content} {keywords}".lower()
        
        # AI related keywords
        if any(word in text_to_analyze for word in ['artificial intelligence', 'machine learning', 'ai-powered', 'ai ', ' ai', 'neural', 'automation', 'intelligent']):
            return 'AI'
        
        # Product Management keywords
        if any(word in text_to_analyze for word in ['product management', 'product manager', 'roadmap', 'feature', 'prioritization', 'lifecycle', 'mvp', 'product strategy']):
            return 'Product Management'
        
        # Startup keywords
        if any(word in text_to_analyze for word in ['startup', 'scaling', 'growth', 'founder', 'entrepreneur', 'venture', 'funding', 'market']):
            return 'Startup Growth'
        
        # Default to Software Development
        return 'Software Development'
    
    def generate_articles_html(self, articles, featured_article):
        """Generate the complete articles.html content"""
        # Group articles by category
        categories = {
            'Product Management': [],
            'AI': [],
            'Software Development': [],
            'Startup Growth': []
        }
        
        for article in articles:
            category = article['category']
            if category in categories:
                categories[category].append(article)
        
        # Generate article cards HTML
        def generate_article_card(article, is_new=False):
            new_badge = '<span class="bg-buildly-accent text-white px-2 py-1 rounded text-xs">New!</span>' if is_new else ''
            border_class = 'border-l-4 border-buildly-accent' if is_new else ''
            
            return f'''
                    <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow {border_class}">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="bg-buildly-primary text-white px-2 py-1 rounded text-xs">{article['category']}</span>
                            {new_badge}
                        </div>
                        <h4 class="text-lg font-semibold mb-2">{article['title']}</h4>
                        <p class="text-gray-600 text-sm mb-4">{article['description'][:120]}{'...' if len(article['description']) > 120 else ''}</p>
                        <a href="{article['filename']}" class="text-buildly-primary font-medium hover:text-buildly-secondary">Read More →</a>
                    </div>'''
        
        # Generate category sections
        pm_articles = '\n'.join([generate_article_card(article, i < 2) for i, article in enumerate(categories['Product Management'])])
        ai_articles = '\n'.join([generate_article_card(article, i < 2) for i, article in enumerate(categories['AI'])])
        dev_articles = '\n'.join([generate_article_card(article, i < 2) for i, article in enumerate(categories['Software Development'])])
        startup_articles = '\n'.join([generate_article_card(article, i < 2) for i, article in enumerate(categories['Startup Growth'])])
        
        # Read the current articles.html to get the header and footer
        try:
            with open('articles.html', 'r', encoding='utf-8') as f:
                current_content = f.read()
            
            # Extract the header (up to "Articles Grid" section)
            header_match = re.search(r'(.*?)<!-- Articles Grid -->', current_content, re.DOTALL)
            header = header_match.group(1) if header_match else self.get_default_header()
            
            # Extract the footer (from the footer section onwards)
            footer_match = re.search(r'(<!-- Footer -->.*)', current_content, re.DOTALL)
            footer = footer_match.group(1) if footer_match else self.get_default_footer()
            
        except:
            header = self.get_default_header()
            footer = self.get_default_footer()
        
        # Update featured article in header if provided
        if featured_article and featured_article.get('title'):
            header = re.sub(
                r'(<h2 class="text-3xl md:text-4xl font-bold mb-4">)(.*?)(</h2>)',
                f'\\1{featured_article["title"]}\\3',
                header
            )
            header = re.sub(
                r'(<p class="text-lg opacity-90 mb-6">)(.*?)(</p>)',
                f'\\1{featured_article["description"]}\\3',
                header
            )
            header = re.sub(
                r'(href=")(articles/[^"]*?)(")',
                f'\\1{featured_article["link"]}\\3',
                header
            )
        
        # Combine everything
        return f'''{header}
    <!-- Articles Grid -->
    <section class="py-16 bg-buildly-light">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-buildly-dark mb-4">All Blog Posts</h2>
                <p class="text-lg text-gray-600">Explore our comprehensive collection of insights and best practices</p>
            </div>

            <!-- Product Management Articles -->
            <div class="mb-16">
                <h3 class="text-2xl font-bold text-buildly-primary mb-8 flex items-center">
                    <span class="w-8 h-8 bg-buildly-primary rounded-full flex items-center justify-center text-white text-sm mr-3">PM</span>
                    Product Management
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pm_articles}
                </div>
            </div>

            <!-- AI Articles -->
            <div class="mb-16">
                <h3 class="text-2xl font-bold text-buildly-accent mb-8 flex items-center">
                    <span class="w-8 h-8 bg-buildly-accent rounded-full flex items-center justify-center text-white text-sm mr-3">AI</span>
                    Artificial Intelligence
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ai_articles}
                </div>
            </div>

            <!-- Software Development Articles -->
            <div class="mb-16">
                <h3 class="text-2xl font-bold text-buildly-secondary mb-8 flex items-center">
                    <span class="w-8 h-8 bg-buildly-secondary rounded-full flex items-center justify-center text-white text-sm mr-3">DEV</span>
                    Software Development
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dev_articles}
                </div>
            </div>

            <!-- Startup Growth Articles -->
            <div class="mb-16">
                <h3 class="text-2xl font-bold text-gray-600 mb-8 flex items-center">
                    <span class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm mr-3">📈</span>
                    Startup Growth
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {startup_articles}
                </div>
            </div>
        </div>
    </section>

    {footer}'''
    
    def get_default_header(self):
        """Return default header HTML"""
        return '''<!DOCTYPE html>
<html lang="en">
<head>
    <script src="/js/buildly-head.js"></script>
    <title>AI Development Blog - Vibe Coding, Product Management & Software Innovation | Buildly</title>
    <meta name="description" content="Expert insights on AI development, vibe coding methodologies, product management best practices, and software innovation. Latest trends in AI-powered development platforms.">
    <meta name="keywords" content="AI development blog, vibe coding articles, product management insights, software development trends, AI innovation, development best practices, startup growth">
    <link rel="canonical" href="https://www.buildly.io/articles.html">
</head>
<body class="font-sans">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="index.html">
                        <img src="media/buildly-logo.svg" alt="Buildly" class="h-12 w-auto" style="filter: brightness(0) saturate(100%) invert(21%) sepia(47%) saturate(1765%) hue-rotate(198deg) brightness(97%) contrast(93%);">
                    </a>
                </div>
                <div class="block">
                    <div class="ml-10 flex items-baseline space-x-4">
                        <a href="index.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                        <a href="https://labs.buildly.io" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Labs</a>
                        <a href="use-cases.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Use Cases</a>
                        <a href="pricing.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
                        <a href="https://docs.buildly.io/" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Docs</a>
                        <a href="articles.html" class="text-buildly-primary px-3 py-2 rounded-md text-sm font-medium">Articles</a>
                        <a href="team.html" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Team</a>
                        <a href="https://labs.buildly.io" class="bg-buildly-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-buildly-secondary transition-colors">Try for Free</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 bg-gradient-to-br from-buildly-light to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold text-buildly-dark mb-4">
                    Buildly Articles
                </h1>
                <p class="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                    From MVP to Market Leader: Navigate the Product Lifecycle with expert insights on AI, product management, and software development
                </p>
                <div class="flex flex-wrap justify-center gap-2 mb-8">
                    <span class="bg-buildly-primary text-white px-4 py-2 rounded-full text-sm">Product Management</span>
                    <span class="bg-buildly-accent text-white px-4 py-2 rounded-full text-sm">AI & Machine Learning</span>
                    <span class="bg-buildly-secondary text-white px-4 py-2 rounded-full text-sm">Software Development</span>
                    <span class="bg-gray-600 text-white px-4 py-2 rounded-full text-sm">Startup Growth</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Article -->
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-gradient-to-r from-buildly-primary to-buildly-secondary rounded-2xl p-8 text-white mb-16">
                <div class="max-w-4xl">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="bg-buildly-accent px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                        <span class="text-sm opacity-90">Product Management • Featured Article</span>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">From MVP to Market Leader: Navigating the Product Lifecycle</h2>
                    <p class="text-lg opacity-90 mb-6">This article examines every phase of the product lifecycle offering best practices to achieve market leadership and sustainable growth.</p>
                    <a href="articles/product-lifecycle.html" class="inline-flex items-center bg-white text-buildly-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Read More
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>
'''
    
    def get_default_footer(self):
        """Return default footer HTML"""
        return '''    <!-- Footer -->
    <footer class="bg-buildly-dark text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <img src="media/buildly-logo.svg" alt="Buildly" class="h-12 w-auto mx-auto mb-8" style="filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2%) hue-rotate(169deg) brightness(105%) contrast(101%);">
                <p class="text-lg text-gray-300 mb-8">Building the future of software development with AI-powered tools</p>
                <div class="flex flex-wrap justify-center gap-8 mb-8">
                    <a href="https://labs.buildly.io" class="text-gray-300 hover:text-white transition-colors">Labs</a>
                    <a href="use-cases.html" class="text-gray-300 hover:text-white transition-colors">Use Cases</a>
                    <a href="pricing.html" class="text-gray-300 hover:text-white transition-colors">Pricing</a>
                    <a href="https://docs.buildly.io/" class="text-gray-300 hover:text-white transition-colors">Documentation</a>
                    <a href="team.html" class="text-gray-300 hover:text-white transition-colors">Team</a>
                </div>
                <div class="pt-8 border-t border-gray-700">
                    <p class="text-gray-400">&copy; 2024 Buildly. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>'''
    
    def handle_get_social_accounts(self):
        """Get saved social media accounts configuration"""
        try:
            social_accounts_file = Path('.social-accounts.json')
            
            if social_accounts_file.exists():
                with open(social_accounts_file, 'r', encoding='utf-8') as f:
                    accounts = json.load(f)
                self.send_json_response(accounts)
            else:
                # Return default empty configuration
                default_accounts = {
                    'linkedin': {
                        'company': '',
                        'personal': '',
                        'template': 'Check out this article from Buildly: {title} {url} #AI #ProductDevelopment'
                    },
                    'bluesky': {
                        'handle': '',
                        'display': '',
                        'template': 'New from Buildly: {title} {url} #AI #ProductDevelopment #StartupTech'
                    },
                    'mastodon': {
                        'instance': '',
                        'username': '',
                        'template': 'Fresh insights from Buildly: {title} {url} #AI #ProductDevelopment #OpenSource'
                    }
                }
                self.send_json_response(default_accounts)
                
        except Exception as e:
            print(f"❌ Error loading social accounts: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def handle_save_social_accounts(self):
        """Save social media accounts configuration"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            accounts = json.loads(post_data.decode('utf-8'))
            
            # Validate the accounts structure
            required_platforms = ['linkedin', 'bluesky', 'mastodon']
            for platform in required_platforms:
                if platform not in accounts:
                    accounts[platform] = {}
            
            # Save to file
            with open('.social-accounts.json', 'w', encoding='utf-8') as f:
                json.dump(accounts, f, indent=2)
            
            self.send_json_response({'success': True, 'message': 'Social media accounts saved'})
            print(f"💾 Social media accounts configuration saved")
            
        except Exception as e:
            print(f"❌ Error saving social accounts: {e}")
            self.send_error(500, f"Server error: {str(e)}")

    def handle_get_navigation(self):
        """Get current navigation configuration"""
        try:
            navigation_file = '.navigation-config.json'
            
            if os.path.exists(navigation_file):
                with open(navigation_file, 'r', encoding='utf-8') as f:
                    navigation = json.load(f)
                self.send_json_response(navigation)
                print(f"📋 Navigation configuration loaded")
            else:
                # Return empty array if no config exists
                self.send_json_response([])
                print(f"📋 No navigation configuration found, returning empty")
            
        except Exception as e:
            print(f"❌ Error loading navigation: {e}")
            self.send_error(500, f"Server error: {str(e)}")

    def handle_save_navigation(self):
        """Save navigation configuration"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "No content")
                return
            
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if 'navigation' not in data:
                self.send_error(400, "Navigation data required")
                return
            
            navigation_items = data['navigation']
            
            # Save to configuration file
            with open('.navigation-config.json', 'w', encoding='utf-8') as f:
                json.dump(navigation_items, f, indent=2)
            
            # Update the actual HTML files with new navigation
            self.update_navigation_in_files(navigation_items)
            
            self.send_json_response({'success': True, 'message': 'Navigation saved and HTML files updated'})
            print(f"🧭 Navigation configuration saved and HTML files updated")
            
        except Exception as e:
            print(f"❌ Error saving navigation: {e}")
            self.send_error(500, f"Server error: {str(e)}")

    def update_navigation_in_files(self, navigation_items):
        """Update navigation in HTML files"""
        try:
            # Generate desktop navigation HTML
            desktop_nav_items = [item for item in navigation_items if item.get('showInDesktop', True)]
            desktop_nav_items.sort(key=lambda x: x.get('order', 0))
            
            desktop_nav_html = []
            for item in desktop_nav_items:
                label = item.get('label', '')
                href = item.get('href', '')
                item_type = item.get('type', 'internal')
                
                if item_type == 'cta':
                    desktop_nav_html.append(
                        f'<a href="{href}" class="bg-buildly-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-buildly-secondary transition-colors">{label}</a>'
                    )
                else:
                    desktop_nav_html.append(
                        f'<a href="{href}" class="text-gray-700 hover:text-buildly-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">{label}</a>'
                    )
            
            # Generate mobile navigation HTML
            mobile_nav_items = [item for item in navigation_items if item.get('showInMobile', True)]
            mobile_nav_items.sort(key=lambda x: x.get('order', 0))
            
            mobile_nav_html = []
            for item in mobile_nav_items:
                label = item.get('label', '')
                href = item.get('href', '')
                mobile_nav_html.append(
                    f'<a href="{href}" class="text-gray-700 hover:text-buildly-primary block px-3 py-2 rounded-md text-base font-medium">{label}</a>'
                )
            
            # Update HTML files that contain navigation
            html_files = ['index.html', 'labs.html', 'use-cases.html', 'pricing.html', 'articles.html', 'team.html', 'rad-core.html']
            
            for file_path in html_files:
                if os.path.exists(file_path):
                    self.update_navigation_in_file(file_path, desktop_nav_html, mobile_nav_html)
            
        except Exception as e:
            print(f"❌ Error updating navigation in files: {e}")

    def update_navigation_in_file(self, file_path, desktop_nav_html, mobile_nav_html):
        """Update navigation in a specific HTML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update desktop navigation
            desktop_pattern = r'(<div class="ml-10 flex items-baseline space-x-4">)(.*?)(</div>)'
            desktop_replacement = f'\\1\n                        {chr(10).join(desktop_nav_html)}\n                    \\3'
            content = re.sub(desktop_pattern, desktop_replacement, content, flags=re.DOTALL)
            
            # Update mobile navigation
            mobile_pattern = r'(<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">)(.*?)(</div>)'
            mobile_replacement = f'\\1\n                    {chr(10).join(mobile_nav_html)}\n                \\3'
            content = re.sub(mobile_pattern, mobile_replacement, content, flags=re.DOTALL)
            
            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Updated navigation in {file_path}")
            
        except Exception as e:
            print(f"❌ Error updating navigation in {file_path}: {e}")

    def send_json_response(self, data, status_code=200):
        """Send a JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def handle_save_file(self):
        try:
            # Read the request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "No content")
                return
            
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            file_path = data.get('path', '').strip()
            file_content = data.get('content', '')
            
            if not file_path:
                self.send_error(400, "No file path provided")
                return
            
            # Security: Clean the path and ensure it's within the website directory
            # Remove any ../ or leading slashes to prevent directory traversal
            clean_path = file_path.replace('../', '').lstrip('/')
            
            # Get absolute path relative to the server's current directory
            full_path = Path(clean_path).resolve()
            server_root = Path().resolve()
            
            # Ensure the file is within the server directory
            if not str(full_path).startswith(str(server_root)):
                self.send_error(403, "Access denied")
                return
            
            # Create directory if it doesn't exist
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write the file
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                'success': True,
                'message': f'File saved successfully',
                'path': clean_path,
                'size': len(file_content)
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            print(f"✅ Saved: {clean_path} ({len(file_content)} bytes)")
            
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except PermissionError:
            self.send_error(403, "Permission denied")
        except Exception as e:
            print(f"❌ Error saving file: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def end_headers(self):
        # Add CORS headers to all responses
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def guess_type(self, path):
        """Override to ensure proper charset for HTML files"""
        result = super().guess_type(path)
        if isinstance(result, tuple):
            mime_type = result[0]
        else:
            mime_type = result
            
        if mime_type == 'text/html':
            return 'text/html; charset=utf-8'
        elif mime_type and mime_type.startswith('text/'):
            return f'{mime_type}; charset=utf-8'
        return mime_type

def run_server(port=8000):
    """Run the enhanced HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AdminHTTPRequestHandler)
    
    print(f"🚀 Buildly Development Server")
    print(f"📁 Serving: {os.getcwd()}")
    print(f"🌐 URL: http://localhost:{port}")
    print(f"⚙️  Admin: http://localhost:{port}/admin/")
    print(f"💾 File saving: ENABLED")
    print(f"")
    print(f"Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)