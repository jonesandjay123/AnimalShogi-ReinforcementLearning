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
  document.getElementById("setup-board").onclick = onSetupBoardButtonClick;
}
function CreateBoard() {
  console.log("isSetupMode:", isSetupMode);
  if (isSetupMode) {
    // ... Code for setup mode ...
    return;
  }
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
function onSetupBoardButtonClick() {
  console.log("Setup board button clicked");
  isSetupMode = true;
  MakeSetupBench(); // For player 1 (Note: player indexes are 0 and 1)
  CreateBoard(); // Update the board for setup mode
  // ... Other necessary operations ...
}
function GetArgs() {
  return "?player=" + player_id;
}
