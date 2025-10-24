#!/usr/bin/env python3
"""
Simple HTTP server to test Black-Cross database connections
"""
import json
import sqlite3
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

class BlackCrossHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Health check
        if path == '/health' or path == '/api/v1/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'operational',
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'database': 'connected',
                    'redis': 'connected'
                }
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Module endpoints
        modules = [
            'threat-intelligence', 'incident-response', 'vulnerability-management',
            'ioc-management', 'threat-actors', 'threat-feeds', 'siem',
            'threat-hunting', 'risk-assessment', 'collaboration', 'reporting',
            'malware-analysis', 'dark-web', 'compliance', 'automation'
        ]
        
        for module in modules:
            if path == f'/api/v1/{module}' or path == f'/api/v1/{module}/':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'data': [],
                    'total': 0,
                    'module': module
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            if path == f'/api/v1/{module}/health':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'module': module,
                    'status': 'operational',
                    'version': '1.0.0'
                }
                self.wfile.write(json.dumps(response).encode())
                return
        
        # 404 for other paths
        self.send_error(404)
    
    def do_POST(self):
        if self.path == '/api/v1/auth/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode())
                email = data.get('email', '')
                password = data.get('password', '')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                if email == 'admin@blackcross.com' and password == 'admin':
                    response = {
                        'success': True,
                        'token': 'mock-jwt-token',
                        'user': {
                            'id': '1',
                            'email': 'admin@blackcross.com',
                            'role': 'admin'
                        }
                    }
                else:
                    response = {
                        'success': False,
                        'error': 'Invalid credentials'
                    }
                
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                self.send_error(400, f"Bad Request: {str(e)}")
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    port = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('localhost', port), BlackCrossHandler)
    print(f"🚀 Black-Cross Backend Server running on http://localhost:{port}")
    print(f"📊 Health check: http://localhost:{port}/health")  
    print(f"🔐 API endpoints: http://localhost:{port}/api/v1")
    print("Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
        server.shutdown()

if __name__ == '__main__':
    run_server()