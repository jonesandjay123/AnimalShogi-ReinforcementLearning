from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import shogi

PORT = 8008


class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.game = shogi.Game()
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/':
            with open('static/index.html', 'r') as file:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(file.read().encode('utf-8'))
                return
        elif self.path in ['/lib.js', '/js.js', '/style.css']:
            file_path = 'static' + self.path
            with open(file_path, 'r') as file:
                self.send_response(200)
                if self.path.endswith('.js'):
                    self.send_header('Content-Type', 'application/javascript')
                elif self.path.endswith('.css'):
                    self.send_header('Content-Type', 'text/css')
                self.end_headers()
                self.wfile.write(file.read().encode('utf-8'))
                return

    def start_game(self):
        self.game.reset()
        return {'board': self.game.board.to_dict(), 'status': 'started'}


def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f'Serving on port {PORT}')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
