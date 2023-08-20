import collections
import json
import logging
import os
import server
import shogi
import shogi_ai
import random


class ContentTypes:
    PLAIN = ('Content-Type', 'text/plain')
    JSON = ('Content-Type', 'application/json')
    HTML = ('Content-Type', 'text/html')
    CSS = ('Content-Type', 'text/css')
    JAVASCRIPT = ('Content-Type', 'text/javascript')


class GameState:
    def __init__(self, game, players):
        self.game = game
        self.players = players


class Player:
    def __init__(self, order, is_human):
        self.order = order
        self.is_human = is_human


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

        if self.path == "get_game_status":
            player_id = int(self.env.args['player'])
            return self.GetStatus(player_id)

        if self.path == "move":
            player_id = int(self.env.args['player'])
            move_from = self.env.args['from']
            move_to = self.env.args['to']
            return self.Move(player_id, move_from, move_to)

        return self.ReadFile()

    def StartGame(self):
        game = shogi.Game()
        player_1 = Player(shogi.PLAYER1, True)
        player_2 = Player(shogi.PLAYER2, True)
        players = {1: player_1, 2: player_2}
        state = GameState(game, players)
        return self.GetStatus(1)

    def GetStatus(self, player_id):
        state = self.game_state
        game = state.game
        player = state.players[player_id].order

        payload = {}
        payload['board'] = game.board
        payload['status'] = game.status[player]
        payload['current_player'] = game.player
        if game.player == player:
            payload['moves'] = shogi.PossibleMoves(game.board, player)
        return json.dumps(payload)

    def Move(self, player_id, move_from, move_to):
        state = self.game_state
        game = state.game
        player = state.players[player_id].order

        if player != game.player:
            return self.GetStatus(player_id)

        boards = shogi.PossibleMoves(game.board, game.player)
        if move_to not in boards[move_from]:
            return self.GetStatus(player_id)

        next_board = boards[move_from][move_to]
        game.UpdateBoard(next_board)
        return self.GetStatus(player_id)

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
    try:
        contents = handler.Handle()
    except Exception as e:
        logging.exception("Could not handle a request to %s" % path)
        start_response(500, [ContentTypes.HTML])
        return [("<h1>500 Internal Server Error</h1>" +
                 "<p>We're sorry, the server was unable to process your " +
                 "request.</p>")]

    headers = [handler.content_type] + handler.headers
    start_response(handler.code, headers)
    return [contents]


def SetUp():
    server.Server(('', 8008), _EntryPoint).ServeForever(True)


if __name__ == "__main__":
    SetUp()
