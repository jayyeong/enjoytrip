"""EnjoyTrip local development server with portable JavaScript MIME types."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html'}

if __name__ == '__main__':
    os.chdir(Path(__file__).resolve().parent)
    print('EnjoyTrip: http://localhost:8001', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8001), Handler).serve_forever()

