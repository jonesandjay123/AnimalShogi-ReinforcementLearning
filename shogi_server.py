from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import shogi

PORT = 8008


class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.game = shogi.Game()
        super().__init__(*args, **kwargs)

    def do_GET(self):
        try:
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
                        self.send_header(
                            'Content-Type', 'application/javascript')
                    elif self.path.endswith('.css'):
                        self.send_header('Content-Type', 'text/css')
                    self.end_headers()
                    self.wfile.write(file.read().encode('utf-8'))
                    return
            elif self.path.startswith('/static/img/'):
                file_path = self.path[1:]
                with open(file_path, 'rb') as file:
                    self.send_response(200)
                    if self.path.endswith('.png'):
                        self.send_header('Content-Type', 'image/png')
                    self.end_headers()
                    self.wfile.write(file.read())
                    return
            elif self.path == '/start_game':
                response = self.start_game()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
        except Exception as e:
            print(f"Error occurred: {e}")

    def start_game(self):
        self.game = shogi.Game()  # 重新初始化遊戲
        return {'board': self.game.board.to_dict(), 'status': 'started'}


def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f'Serving on port {PORT}')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
