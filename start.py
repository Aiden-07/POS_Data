import socket
import http.server

PORT = 8765

Handler = http.server.SimpleHTTPRequestHandler

class ReusableThreadingHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True

with ReusableThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Server running at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
