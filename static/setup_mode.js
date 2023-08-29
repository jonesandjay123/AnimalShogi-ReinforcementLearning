// Global variable to determine if we are in "Setup Board" mode
var isSetupMode = false;

function clearBoard() {
  // 清除主棋盤上的所有棋子
  var cells = board_div.querySelectorAll("#main-board td");
  for (var i = 0; i < cells.length; i++) {
    cells[i].innerHTML = "";
  }

  // 清除 Player 1 和 Player 2 的 bench 上的所有棋子
  var benchCellsP1 = board_div.querySelectorAll("#P1Bench td");
  var benchCellsP2 = board_div.querySelectorAll("#P2Bench td");
  for (var j = 0; j < benchCellsP1.length; j++) {
    benchCellsP1[j].innerHTML = "";
    benchCellsP2[j].innerHTML = "";
  }
}

function MakeSetupBench() {
  clearBoard();
  console.log("MakeSetupBench function called");

  var pieces = ["lion", "elephant", "giraffe", "chick"];
  for (var player = 0; player <= 1; player++) {
    var orientation = player == 0 ? "down" : "up"; // 調整方向
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      var imgSrc = "/static/img/" + piece + "_" + orientation + ".png";
      var cellId = "P" + (player + 1) + "B" + i;
      var cell = document.getElementById(cellId);
      if (cell) {
        cell.innerHTML =
          "<img src='" + imgSrc + "' draggable='true' width='50' height='50'>";
      }
    }
  }
}

// ... Additional functions related to "Setup Board" mode ...
