import socket
import http.server
import socketserver

# 找一个可用的端口
s = socket.socket()
s.bind(('', 0))
port = s.getsockname()[1]
s.close()

print(f"Starting server on port {port}")

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(('', port), Handler) as httpd:
    print(f"Server running at http://localhost:{port}")
    httpd.serve_forever()
