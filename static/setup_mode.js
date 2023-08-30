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
    var orientation = player == 0 ? "up" : "down"; // 調整方向
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      var imgSrc = "/static/img/" + piece + "_" + orientation + ".png";
      var cellId = "P" + (player + 1) + "B" + i;
      var cell = document.getElementById(cellId);
      if (cell) {
        cell.innerHTML =
          "<img id='" +
          piece +
          "-" +
          orientation +
          "' src='" +
          imgSrc +
          "' draggable='true' width='50' height='50'>";
      }
    }
  }
  // 設置棋子可拖放
  enableDragAndDrop();
}

function changePieceOwnership(piece) {
  var orientation = piece.id.split("-")[1];
  var newOrientation = orientation === "up" ? "down" : "up";
  var newImgSrc = piece.src.replace(orientation, newOrientation);
  piece.src = newImgSrc;
  piece.id = piece.id.replace(orientation, newOrientation);
}

function toggleChickTransformation(piece) {
  var orientation = piece.id.split("-")[1];
  if (piece.id === "chick-" + orientation) {
    console.log("Transforming chick to chicken");
    piece.src = "/static/img/chicken_" + orientation + ".png";
    piece.id = "chicken-" + orientation;
  } else if (piece.id === "chicken-" + orientation) {
    console.log("Transforming chicken back to chick");
    piece.src = "/static/img/chick_" + orientation + ".png";
    piece.id = "chick-" + orientation;
  }
}

function enableDragAndDrop() {
  var pieces = document.querySelectorAll(
    "#main-board img, #P1Bench img, #P2Bench img"
  );

  // 使棋子可拖動
  pieces.forEach(function (piece) {
    piece.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("text/plain", event.target.id); // 儲存被拖動的棋子的ID
    });
  });

  var cells = document.querySelectorAll(
    "#main-board td, #P1Bench td, #P2Bench td"
  );

  // 設置拖放的目標
  cells.forEach(function (cell) {
    cell.addEventListener("dragover", function (event) {
      event.preventDefault(); // 防止默認行為
    });

    cell.addEventListener("drop", function (event) {
      event.preventDefault(); // 防止默認行為
      var pieceId = event.dataTransfer.getData("text/plain");
      var piece = document.getElementById(pieceId);

      if (cell.innerHTML === "") {
        // 確保目標位置是空的
        cell.appendChild(piece); // 把棋子放到新的位置
        if (
          (cell.id.startsWith("P1B") && pieceId.endsWith("down")) ||
          (cell.id.startsWith("P2B") && pieceId.endsWith("up"))
        ) {
          changePieceOwnership(piece);
        }
      }
    });
  });

  // 對於每一個棋子，添加雙擊事件
  board_div.addEventListener("dblclick", function (event) {
    console.log("Double clicked on:", event.target.id); // ADD THIS LINE
    if (event.target.tagName.toLowerCase() === "img") {
      var piece = event.target;
      if (piece.id.startsWith("chick") || piece.id.startsWith("chicken")) {
        toggleChickTransformation(piece);
      }
    }
  });
}

// 一旦棋盤和棋子被創建，調用以啟用拖放功能
MakeSetupBench();
