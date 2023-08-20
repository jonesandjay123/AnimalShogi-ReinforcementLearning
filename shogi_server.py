import json
import os
import server
import shogi


class ContentTypes:
    PLAIN = ('Content-Type', 'text/plain')
    JSON = ('Content-Type', 'application/json')
    HTML = ('Content-Type', 'text/html')
    CSS = ('Content-Type', 'text/css')
    JAVASCRIPT = ('Content-Type', 'text/javascript')


class Handler:
    def __init__(self, path, env, start_response):
        self.path = path
        self.env = env
        self.start_response = start_response
        self.code = 200
        self.content_type = ContentTypes.JSON
        self.headers = []

    def Handle(self):
        if self.path == "start_game":
            return self.StartGame()

        return self.ReadFile()

    def StartGame(self):
        game = shogi.Game()
        payload = {
            'board': game.board,
            'status': game.status[game.player],
            'current_player': game.player
        }
        return json.dumps(payload)

    def ReadFile(self):
        if self.path == '':
            self.path = 'index.html'

        file_path = 'static/' + self.path
        if os.path.isfile(file_path):
            if file_path.endswith(".html"):
                self.content_type = ContentTypes.HTML
            if file_path.endswith(".css"):
                self.content_type = ContentTypes.CSS
            if file_path.endswith(".js"):
                self.content_type = ContentTypes.JAVASCRIPT
            with open(file_path, 'r') as f:
                return f.read()
        else:
            self.code = 404
            self.content_type = ContentTypes.HTML
            return "<h1>404 Page Not Found<h1>"


def _EntryPoint(path, env, start_response):
    assert path[0] == '/'
    path = path[1:]
    handler = Handler(path, env, start_response)
    contents = handler.Handle()

    headers = [handler.content_type] + handler.headers
    start_response(handler.code, headers)
    return [contents]


def SetUp():
    server.Server(('', 8008), _EntryPoint).ServeForever(True)


if __name__ == "__main__":
    SetUp()
