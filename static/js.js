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
  window.EnterSetupMode = EnterSetupMode;

  function Loaded() {
    board_div = document.getElementById("board");
    status_span = document.getElementById("turn");
    player = 0;
    CreateBoard(0);

    document.getElementById("start-game").onclick = StartHumanGame;
    document.getElementById("start-ai-game").onclick = StartAIGame;
    document
      .getElementById("setup-board")
      .addEventListener("click", EnterSetupMode);
  }

  function MakeBoardTD(id) {
    return "<td class='board_square' id='" + id + "'></td>";
  }

  function MakeBench(for_player) {
    var player_as_str = (parseInt(for_player) + 1).toString();
    var content = "";
    content += "<table id='P" + player_as_str + "Bench'>";
    for (var row = 0; row < 2; row++) {
      content += "<tr>";
      for (var col = 0; col < 3; col++) {
        var index = row * 3 + col;
        content += MakeBoardTD("P" + player_as_str + "B" + index);
      }
      content += "</tr>";
    }
    content += "</table>";
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
    if (!board[element.id]) return; // Add this line to ensure there's a piece on the square.

    holding = element.id;
    console.log("Currently holding:", holding);
    holding_img = element.innerHTML;
    element.innerHTML = "";
    if (board[element.id]) {
      // Check if the board position contains a piece
      document.getElementById("hidden").innerHTML = TokenToImgTag(
        board[element.id],
        "hidden"
      );
    }
    UpdateHoldingPos(evt);
    document.getElementById("hidden").innerHTML = "";
  }

  function UpdateHoldingPos(e) {
    var imgHiddenElement = document.getElementById("img-hidden");
    if (imgHiddenElement) {
      // Ensure the element exists before updating its style
      imgHiddenElement.style.left = e.clientX - 25 + "px";
      imgHiddenElement.style.top = e.clientY - 25 + "px";
    }
  }

  function StopHolding() {
    console.log("StopHolding function called.");
    document.getElementById(holding).innerHTML = holding_img;
    document.getElementById("hidden").innerHTML = "";
    console.log(
      "Hidden content after clear:",
      document.getElementById("hidden").innerHTML
    ); // 添加這一行
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
        console.log("Mouse down detected on square:", this.id);

        if (holding) {
          document.getElementById(holding).innerHTML = holding_img;
          holding = "";
          holding_img = "";
          return;
        }

        if (this.innerHTML != "") {
          StartHolding(this, e);
        }
      };

      board_square.onmouseup = function (e) {
        console.log("Mouse up detected on square:", this.id);
        if (holding) {
          if (this.innerHTML == "") {
            this.innerHTML = holding_img;

            // Check if the placement is on the opponent's territory and flip the piece.
            var pieceImg = this.querySelector("img");
            if (IsOnOpponentTerritory(holding, this.id)) {
              if (pieceImg.src.includes("_up.png")) {
                pieceImg.src = pieceImg.src.replace("_up.png", "_down.png");
              } else if (pieceImg.src.includes("_down.png")) {
                pieceImg.src = pieceImg.src.replace("_down.png", "_up.png");
              }
            }

            document.getElementById(holding).innerHTML = "";
          }
          holding = "";
          holding_img = "";
        }
      };

      function IsOnOpponentTerritory(holdingSquareId, targetSquareId) {
        var holdingPlayer = holdingSquareId[1];
        if (
          player === 0 &&
          parseInt(targetSquareId[1]) >= 2 &&
          holdingPlayer === "1"
        ) {
          return true;
        } else if (
          player === 1 &&
          parseInt(targetSquareId[1]) <= 1 &&
          holdingPlayer === "2"
        ) {
          return true;
        }
        return false;
      }

      function ConvertPieceOnDoubleClick(element) {
        var imgElement = element.querySelector("img");
        if (!imgElement) return; // Ensure there's an image inside the element.

        if (imgElement.src.includes("Chick")) {
          imgElement.src = imgElement.src.replace("Chick", "Hen");
          board[element.id] = board[element.id].replace("C", "H");
        } else if (imgElement.src.includes("Hen")) {
          imgElement.src = imgElement.src.replace("Hen", "Chick");
          board[element.id] = board[element.id].replace("H", "C");
        }
      }

      board_square.onmouseenter = function (e) {
        if (holding) {
          this.style.backgroundColor = "orange";
        }
      };

      board_square.onmouseleave = function (e) {
        if (holding) {
          this.style.backgroundColor = "";
        }
      };
    }

    document.body.onmousemove = function (e) {
      if (holding !== "") {
        UpdateHoldingPos(e);
      }
    };

    document.body.onmouseup = function (e) {
      console.log("Mouse up event detected on the document body.");
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
    var up_or_down = token[1] == "0" ? "up" : "down";
    var pieceMap = {
      L: "Lion",
      G: "Giraffe",
      E: "Elephant",
      C: "Chick",
      H: "Hen",
    };
    var pieceName = pieceMap[token[0]];
    return "/static/img/" + pieceName + "_" + up_or_down + ".png";
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

  function ClearBoard() {
    var board_squares = document.getElementsByClassName("board_square");
    for (var i = 0; i < board_squares.length; i++) {
      var board_square = board_squares[i];
      board_square.innerHTML = "";
    }
  }

  // Global variable to store the dragged piece's information
  var draggedPiece = null;

  function ConvertPieceOnDoubleClick(element) {
    var imgElement = element.querySelector("img");
    if (!imgElement) return; // Ensure there's an image inside the element.

    if (imgElement.src.includes("Chick")) {
      imgElement.src = imgElement.src.replace("Chick", "Hen");
    } else if (imgElement.src.includes("Hen")) {
      imgElement.src = imgElement.src.replace("Hen", "Chick");
    }
  }

  function AddDoubleClickEventForSetupMode() {
    for (var player = 1; player <= 2; player++) {
      for (var i = 0; i < 4; i++) {
        var pieceElement = document.getElementById("P" + player + "B" + i);
        if (pieceElement) {
          pieceElement.ondblclick = function () {
            ConvertPieceOnDoubleClick(this);
          };
        }
      }
    }
  }

  function PlacePiece(position, pieceHTML) {
    var targetElement = document.getElementById(position);
    if (targetElement) {
      targetElement.innerHTML = pieceHTML;

      // Extract the piece token from the pieceHTML and update the board object
      var regex = /img\/(.+?)\.png/;
      var match = pieceHTML.match(regex);
      if (match && match[1]) {
        board[position] = match[1][0] + (match[1].endsWith("up") ? "0" : "1");
      }
    }
  }

  function MakePiece(player, pieceType, position) {
    var up_or_down = player == 0 ? "up" : "down";
    var pieceToken = {
      Lion: "L",
      Giraffe: "G",
      Elephant: "E",
      Chick: "C",
      Hen: "H",
    }[pieceType];
    var token = pieceToken + player;
    return TokenToImgTag(token, position);
  }

  function EnterSetupMode() {
    board = {}; // Add this line to initialize the board object.
    ClearBoard();
    for (var player = 0; player < 2; player++) {
      PlacePiece(
        "P" + (player + 1) + "B0",
        MakePiece(player, "Lion", "P" + (player + 1) + "B0")
      );
      PlacePiece(
        "P" + (player + 1) + "B1",
        MakePiece(player, "Giraffe", "P" + (player + 1) + "B1")
      );
      PlacePiece(
        "P" + (player + 1) + "B2",
        MakePiece(player, "Elephant", "P" + (player + 1) + "B2")
      );
      PlacePiece(
        "P" + (player + 1) + "B3",
        MakePiece(player, "Chick", "P" + (player + 1) + "B3")
      );
    }
    AddDoubleClickEventForSetupMode();
  }

  function GetArgs() {
    return "?player=" + player_id;
  }
})();
