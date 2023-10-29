from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import cohere

class CustomHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/data':
            # Parse the query parameters from the URL
            params = parse_qs(parsed_path.query)

            # For example, to get the value of a parameter named 'name':
            # (Use a default value if the parameter is not present)
            cohere_api_key = params.get('cohere_api_key', [''])[0]
            text = params.get('text', [''])[0]
            repo = params.get('repo', [''])[0]

            # Use cohere API to create bullet points
            co = cohere.Client(cohere_api_key)
            response = co.summarize(
                text=text,
                model='command-lite',
                length='short',
                format='bullets'
            )
            summary = response.summary

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # Use the parameter in the response data
            self.send_header('Access-Control-Allow-Origin', '*')

            data = {"key": "value", "summary": summary}
            self.wfile.write(json.dumps(data).encode())
        else:
            super().do_GET()

httpd = HTTPServer(('localhost', 8000), CustomHandler)
httpd.serve_forever()