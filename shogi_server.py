from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib
import shogi

PORT = 8008
current_game = shogi.Game()  # Global variable to keep track of the current game state


class RequestHandler(BaseHTTPRequestHandler):
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
            elif self.path == '/favicon.ico':
                with open('static/favicon.ico', 'rb') as file:
                    self.send_response(200)
                    self.send_header('Content-Type', 'image/x-icon')
                    self.end_headers()
                    self.wfile.write(file.read())
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
            elif self.path.startswith('/move'):
                response = self.handle_move_request()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
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

    def handle_move_request(self):
        global current_game

        parsed_path = urllib.parse.urlparse(self.path)
        query_parameters = urllib.parse.parse_qs(parsed_path.query)

        from_pos = query_parameters.get('from')[0]
        to_pos = query_parameters.get('to')[0]

        possible_moves = shogi.PossibleMoves(
            current_game.board, current_game.player)

        if from_pos in possible_moves and to_pos in possible_moves[from_pos]:
            current_game.board = possible_moves[from_pos][to_pos]
            current_game.player = 1 - current_game.player
            updated_possible_moves = shogi.PossibleMoves(
                current_game.board, current_game.player)

            return {
                "status": "success",
                "board": current_game.board.to_dict(),
                "moves": updated_possible_moves,
                "current_player": current_game.player,
                "player_id": current_game.player,
                "player": current_game.player  # 確保這一行存在
            }
        else:
            return {"status": "invalid move"}

    def start_game(self):
        global current_game

        current_game = shogi.Game()  # 重新初始化遊戲
        current_game.player = 0  # 確保player1始終先手
        board_dict = current_game.board.to_dict()
        possible_moves = shogi.PossibleMoves(
            current_game.board, current_game.player)
        return {
            'board': board_dict,
            'moves': possible_moves,
            'status': 'started',
            'player': current_game.player,
            'player_id': current_game.player,
            'current_player': current_game.player  # 確保player1始終先手
        }


def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f'Serving on port {PORT}')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
