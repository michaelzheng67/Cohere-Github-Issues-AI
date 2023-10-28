from http.server import SimpleHTTPRequestHandler, HTTPServer
import json

class CustomHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            data = {"key": "value"}
            self.wfile.write(json.dumps(data).encode())
        else:
            super().do_GET()

httpd = HTTPServer(('localhost', 8000), CustomHandler)
httpd.serve_forever()