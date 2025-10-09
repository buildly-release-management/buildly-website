#!/usr/bin/env python3
"""
Simple file save API for the admin interface.
This allows the admin to save files directly to the local filesystem.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class FileAPIHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/admin/api/save-file':
            self.handle_save_file()
        else:
            self.send_error(404, "Not Found")
    
    def handle_save_file(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            file_path = data.get('path')
            file_content = data.get('content')
            
            if not file_path or file_content is None:
                self.send_error(400, "Missing path or content")
                return
            
            # Security: Only allow relative paths within the website directory
            if '..' in file_path or file_path.startswith('/'):
                # Clean the path - remove ../ and make it relative to website root
                clean_path = file_path.replace('../', '')
                if clean_path.startswith('/'):
                    clean_path = clean_path[1:]
            else:
                clean_path = file_path
            
            # Get the website root directory (parent of admin)
            admin_dir = os.path.dirname(os.path.abspath(__file__))
            website_root = os.path.dirname(admin_dir)
            full_path = os.path.join(website_root, clean_path)
            
            # Ensure the directory exists
            dir_path = os.path.dirname(full_path)
            if not os.path.exists(dir_path):
                os.makedirs(dir_path, exist_ok=True)
            
            # Write the file
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                'success': True,
                'message': f'File saved to {clean_path}',
                'path': clean_path,
                'full_path': full_path,
                'size': len(file_content)
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            print(f"✓ Saved file: {clean_path} ({len(file_content)} bytes)")
            
        except Exception as e:
            print(f"✗ Error saving file: {e}")
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_file_api_server(port=8001):
    """Start the file API server on a separate port"""
    server = HTTPServer(('localhost', port), FileAPIHandler)
    print(f"File API server running on http://localhost:{port}")
    server.serve_forever()

if __name__ == '__main__':
    # Start the API server
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    start_file_api_server(port)