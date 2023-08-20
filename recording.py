
class Recording:
    def __init__(self):
        self.moves = []

    def record_move(self, piece_name, new_position, old_position):
        move = f"{new_position}{piece_name}({old_position})"
        self.moves.append(move)

    def record_drop(self, piece_name, position):
        move = f"{position}{piece_name}'"
        self.moves.append(move)

    def record_promote(self, piece_name, new_position, old_position):
        move = f"{new_position}{piece_name}+({old_position})"
        self.moves.append(move)

    def get_game_record(self):
        return " ".join(self.moves)
