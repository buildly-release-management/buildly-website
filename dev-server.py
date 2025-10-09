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
        if self.path == '/api/articles-list':
            self.handle_articles_list()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/save-file':
            self.handle_save_file()
        elif self.path == '/api/set-featured-article':
            self.handle_set_featured_article()
        elif self.path == '/api/regenerate-articles-page':
            self.handle_regenerate_articles_page()
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
            print(f"❌ Error listing articles: {e}")
            self.send_error(500, f"Server error: {str(e)}")
    
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
    
    def send_json_response(self, data):
        """Send a JSON response"""
        self.send_response(200)
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