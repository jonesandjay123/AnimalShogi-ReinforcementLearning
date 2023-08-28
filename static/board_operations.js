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
