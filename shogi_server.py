from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import shogi

PORT = 8008


class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.game = shogi.Game()
        super().__init__(*args, **kwargs)

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = {}
        if self.path == '/start_game':
            response = self.start_game()
        elif self.path.startswith('/move'):
            pass
        self.wfile.write(json.dumps(response).encode('utf-8'))

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
