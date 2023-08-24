(function () {
  var _WIDTH = 3;
  var _HEIGHT = 4;

  var board_div;
  var status_span;

  var player_id;
  var player;

  var board;
  var current_moves;
  var is_your_turn;
  var clicked_on = "";
  var holding = "";
  var holding_img = "";

  window.onload = Loaded;

  function Loaded() {
    board_div = document.getElementById("board");
    status_span = document.getElementById("turn");
    player = 0;
    CreateBoard(0);

    document.getElementById("start-game").onclick = StartHumanGame;
    document.getElementById("start-ai-game").onclick = StartAIGame;
  }

  function MakeBoardTD(id) {
    return "<td class='board_square' id='" + id + "'></td>";
  }

  function MakeBench(for_player) {
    var player_as_str = (parseInt(for_player) + 1).toString();
    var content = "";
    content += "<table id='P" + player_as_str + "Bench'><tr>";
    for (var i = 0; i < 6; i++) {
      content += MakeBoardTD("P" + player_as_str + "B" + i);
    }
    content += "</tr></table>";
    return content;
  }

  function CreateBoard() {
    console.log("Creating board with player value:", player);
    var other_player = 1 - player;
    board_div.innerHTML = "";
    var content = "";
    content += MakeBench(other_player);
    content += "<table id='main-board'>";
    for (var y = 0; y < _HEIGHT; y++) {
      content += "<tr>";
      for (var x = 0; x < _WIDTH; x++) {
        var x_to_use = x;
        var y_to_use = y;
        if (player == 0) {
          y_to_use = _HEIGHT - y - 1;
        } else {
          x_to_use = _WIDTH - x - 1;
        }
        content += MakeBoardTD(x_to_use.toString() + y_to_use.toString());
      }
      content += "</tr>";
    }
    content += "</table>";
    content += MakeBench(player);
    board_div.innerHTML = content;
    ClearAllBackgrounds();

    AddMoveEventListeners();
  }

  function StartHolding(element, evt) {
    holding = element.id;
    console.log("Currently holding:", holding);
    holding_img = element.innerHTML;
    element.innerHTML = "";
    document.getElementById("hidden").innerHTML = TokenToImgTag(
      board[element.id],
      "hidden"
    );
    UpdateHoldingPos(evt);
  }

  function UpdateHoldingPos(e) {
    document.getElementById("img-hidden").style.left = e.clientX - 25;
    document.getElementById("img-hidden").style.top = e.clientY - 25;
  }

  function StopHolding() {
    document.getElementById(holding).innerHTML = holding_img;
    document.getElementById("hidden").innerHTML = "";
    holding = "";
  }

  function ColourPossibleMoves(from) {
    var possible_moves = current_moves[from];
    Object.keys(possible_moves).forEach(function (pos) {
      document.getElementById(pos).style.backgroundColor = "yellow";
    });
  }

  function AddMoveEventListeners() {
    var board_squares = document.getElementsByClassName("board_square");
    for (var i = 0; i < board_squares.length; i++) {
      var board_square = board_squares[i];
      board_square.onmousedown = function (e) {
        console.log("Is it your turn?", is_your_turn);
        console.log("Mouse down detected on square:", this.id); // Add this line
        console.log("Current possible moves at this moment:", current_moves);
        console.log("Current possible moves:", current_moves);
        if (!is_your_turn) return;

        ClearAllBackgrounds();
        if (clicked_on != "") {
          console.log("A piece was previously clicked:", clicked_on);
          var old_clicked_on = clicked_on;
          clicked_on = "";
          if (this.id in current_moves[old_clicked_on]) {
            Move(old_clicked_on, this.id);
            return;
          } else {
            console.log("Invalid move from", clicked_on, "to", this.id);
          }
        }
        this.style.backgroundColor = "orange";
        if (!(this.id in current_moves)) {
          return;
        }
        StartHolding(this, e);
        ColourPossibleMoves(this.id);
      };
      board_square.onmouseup = function (e) {
        console.log("Mouse up detected on square:", this.id); // Add this line
        console.log("Current possible moves at this moment:", current_moves);
        console.log("Current possible moves:", current_moves);
        if (!is_your_turn) return;
        if (holding == "") return;

        var was_holding = holding;
        StopHolding();

        if (this.id == was_holding) {
          clicked_on = this.id;
          return;
        }

        ClearAllBackgrounds();
        if (this.id in current_moves[was_holding]) {
          Move(was_holding, this.id);
          return;
        }
      };
      board_square.onmouseenter = function (e) {
        if (holding == "") return;
        if (this.id in current_moves[holding]) {
          this.style.backgroundColor = "orange";
        }
      };
      board_square.onmouseleave = function (e) {
        if (holding == "") return;
        if (this.id in current_moves[holding]) {
          this.style.backgroundColor = "yellow";
        }
      };
    }
    document.body.onmousemove = function (e) {
      if (holding !== "") {
        UpdateHoldingPos(e);
      }
    };
    document.body.onmouseup = function (e) {
      if (holding !== "") {
        StopHolding();
      }
    };
  }

  function ClearAllCells() {
    var board_squares = document.getElementsByClassName("board_square");
    for (var i = 0; i < board_squares.length; i++) {
      var board_square = board_squares[i];
      board_square.innerHTML = "";
    }
  }

  function ClearAllBackgrounds() {
    var board_squares = document.getElementsByClassName("board_square");
    for (var i = 0; i < board_squares.length; i++) {
      var board_square = board_squares[i];
      var x = parseInt(board_square.id[0]);
      var y = parseInt(board_square.id[1]);
      if ((x + y) % 2 == 0) board_square.style.backgroundColor = "#cccccc";
      else board_square.style.backgroundColor = "#ffffff";
    }
  }

  function StartHumanGame() {
    StartGame("start_game");
  }

  function StartAIGame() {
    StartGame("start_ai_game");
  }

  function StartGame(url) {
    status_span.innerHTML = "Waiting for another player...";
    var aClient = new HttpClient();
    aClient.get(url, function (responseStr) {
      console.log("Received response from server:", responseStr);
      var response = JSON.parse(responseStr);
      player_id = response.player_id; // 這一行非常重要
      player = response.player;
      console.log("Setting player value to:", player, "from server response");
      CreateBoard();
      UpdateGame(responseStr);
    });
  }

  function TokenToImage(token) {
    var up_or_down = token[1] == 0 ? "up" : "down";
    return "/static/img/" + token[0] + "_" + up_or_down + ".png";
  }

  function TokenToImgTag(token, id) {
    console.log(
      "TokenToImgTag function started with token:",
      token,
      "and id:",
      id
    );

    return (
      "<img draggable=false width=50 height=50 " +
      "src='" +
      TokenToImage(token) +
      "' + id='img-" +
      id +
      "'/>"
    );
  }

  function UpdateBoard(new_board) {
    console.log("UpdateBoard function started with board data:", new_board);

    board = new_board;
    ClearAllCells();
    Object.keys(board).forEach(function (key) {
      document.getElementById(key).innerHTML = TokenToImgTag(board[key], key);
      console.log("Placing token at key:", key, "with data:", board[key]);
    });
  }

  function UpdateGame(updateStr) {
    console.log("UpdateGame function called with data:", updateStr);

    if (updateStr === "{}") {
      var aClient = new HttpClient();
      aClient.get("get_game_status" + GetArgs(), UpdateGame);
      return;
    }
    var update = JSON.parse(updateStr);
    console.log("Received update from server:", update);
    console.log("Player value from server:", update.player);

    if (!update.moves) {
      console.error("Did not receive valid moves from server.");
      return;
    }

    // Set the player value and player_id value first
    player = update.player;
    player_id = update.player_id;

    console.log("Setting player value to:", player, "from server update");
    console.log("Setting player_id value to:", player_id); // Added debug output

    UpdateBoard(update.board);

    var player_str = player == 0 ? "Player 1" : "Player 2";

    var is_game_over =
      update.status == "won" ||
      update.status == "lost" ||
      update.status == "draw";

    if (is_game_over) {
      var status_str = "";
      if (update.status == "won") {
        status_str = "You won.";
      } else if (update.status == "lost") {
        status_str = "You lost.";
      } else if (update.status == "draw") {
        status_str = "You drew.";
      }
      status_span.innerHTML = player_str + ": " + status_str;
      return;
    }

    console.log("Current player from server:", update.current_player);
    is_your_turn = update.current_player == player;
    console.log("Is it your turn after update?", is_your_turn); // Added debug output

    var turn_str = is_your_turn ? "Your Turn" : "Opponent's Turn";
    status_span.innerHTML = player_str + ": " + turn_str;

    if (is_your_turn) {
      current_moves = update.moves;
    } else {
      var aClient = new HttpClient();
      aClient.get("wait_for_my_turn" + GetArgs(), UpdateGame);
    }
  }

  function Move(from, to) {
    console.log("Move function started with from:", from, "and to:", to);

    if (!is_your_turn) {
      console.log("Not your turn!");
      return;
    }

    var client = new HttpClient();
    client.get("/move?from=" + from + "&to=" + to, function (responseStr) {
      var response = JSON.parse(responseStr);
      console.log("Received response from server:", response);
      if (response.status === "success") {
        UpdateGame(responseStr); // 更改此行，直接傳遞整個回應字符串
      } else {
        console.log("Invalid move. Reason:", response.status);
      }
    });

    console.log("Sending move request to server...");
    console.log("Move function end");
  }

  function GetArgs() {
    return "?player=" + player_id;
  }
})();
