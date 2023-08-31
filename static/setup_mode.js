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

  var pieces = ["elephant", "chick", "giraffe", "lion"];
  for (var player = 0; player <= 1; player++) {
    var orientation = player == 0 ? "up" : "down"; // 調整方向
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      var imgSrc = "/static/img/" + piece + "_" + orientation + ".png";
      var cellId = "P" + (player + 1) + "B" + i;

      // Generate a unique ID for each piece
      var pieceUniqueId = piece + "-" + orientation + "-" + i + "-" + player;

      var cell = document.getElementById(cellId);
      if (cell) {
        cell.innerHTML =
          "<img id='" +
          pieceUniqueId +
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
  // 如果棋子是獅子，則不允許轉換陣營
  if (piece.id.startsWith("lion")) {
    console.log("Lions cannot change teams.");
    return; // 退出函數，不進行轉換
  }

  var idComponents = piece.id.split("-");
  var orientation = idComponents[1];
  var newOrientation = orientation === "up" ? "down" : "up";
  var newImgSrc = piece.src.replace(orientation, newOrientation);
  idComponents[1] = newOrientation;

  piece.src = newImgSrc;
  piece.id = idComponents.join("-");
}

function toggleChickTransformation(piece) {
  var idComponents = piece.id.split("-");
  var pieceType = idComponents[0];
  var orientation = idComponents[1];

  if (pieceType === "chick") {
    console.log("Transforming chick to chicken");
    piece.src = "/static/img/chicken_" + orientation + ".png";
    piece.id = "chicken-" + idComponents.slice(1).join("-");
  } else if (pieceType === "chicken") {
    console.log("Transforming chicken back to chick");
    piece.src = "/static/img/chick_" + orientation + ".png";
    piece.id = "chick-" + idComponents.slice(1).join("-");
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
      console.log("Drop event triggered for cell:", cell.id); // ADD THIS LINE
      event.preventDefault(); // 防止默認行為
      var pieceId = event.dataTransfer.getData("text/plain");
      var piece = document.getElementById(pieceId);
      console.log("Piece ID on drop:", pieceId);
      if (cell.innerHTML === "") {
        // 確保目標位置是空的
        cell.appendChild(piece); // 把棋子放到新的位置

        if (cell.id.startsWith("P1B") && piece.id.includes("-down")) {
          console.log("Changing ownership for P1B and piece ending with -down");
          changePieceOwnership(piece);
        } else if (cell.id.startsWith("P2B") && piece.id.includes("-up")) {
          console.log("Changing ownership for P2B and piece ending with -up");
          changePieceOwnership(piece);
        }
      }
      // 檢查是否滿足顯示按鈕的條件
      displayGameStartButtons();
    });
  });

  // 對於每一個棋子，添加雙擊事件
  board_div.addEventListener("dblclick", function (event) {
    console.log("Double clicked on:", event.target.id);
    if (event.target.tagName.toLowerCase() === "img") {
      var piece = event.target;
      if (piece.id.startsWith("chick") || piece.id.startsWith("chicken")) {
        toggleChickTransformation(piece);
      }
    }
  });
}

function checkForTwoLions() {
  var mainBoard = document.getElementById("main-board");
  var lions = mainBoard.querySelectorAll("img[id^='lion-']");
  return lions.length === 2;
}

function displayGameStartButtons() {
  var board = document.getElementById("board");
  var startBtnP1 =
    document.getElementById("startBtnP1") || document.createElement("button");
  var startBtnP2 =
    document.getElementById("startBtnP2") || document.createElement("button");

  if (checkForTwoLions()) {
    startBtnP1.innerText = "Start as Player 1";
    startBtnP1.id = "startBtnP1";
    startBtnP1.style.display = ""; // 顯示按鈕
    board.appendChild(startBtnP1);

    startBtnP2.innerText = "Start as Player 2";
    startBtnP2.id = "startBtnP2";
    startBtnP2.style.display = ""; // 顯示按鈕
    board.appendChild(startBtnP2);

    // 在這裡為按鈕添加事件監聽器
    startBtnP1.addEventListener("click", function () {
      startGameAsPlayer(0);
    });

    startBtnP2.addEventListener("click", function () {
      startGameAsPlayer(1);
    });
  } else {
    // 如果沒有兩隻獅子，則隱藏按鈕
    if (startBtnP1.parentElement) startBtnP1.style.display = "none";
    if (startBtnP2.parentElement) startBtnP2.style.display = "none";
  }
}

function startGameAsPlayer(playerIndex) {
  // 1. 設定遊戲模式
  isSetupMode = false;

  // 2. 移除按鈕
  var startBtnP1 = document.getElementById("startBtnP1");
  var startBtnP2 = document.getElementById("startBtnP2");
  if (startBtnP1 && startBtnP1.parentNode) {
    startBtnP1.parentNode.removeChild(startBtnP1);
  }
  if (startBtnP2 && startBtnP2.parentNode) {
    startBtnP2.parentNode.removeChild(startBtnP2);
  }

  // 3. 初始化遊戲狀態
  var currentPlayer = playerIndex; // 0 for Player 1 and 1 for Player 2

  // 4. 啟用遊戲互動
  enableGameInteractions(currentPlayer);
}

function enableGameInteractions(currentPlayer) {
  // 1. 取得棋盤上的棋子位置
  var boardState = {};
  var cells = board_div.querySelectorAll("#main-board td");
  cells.forEach(function (cell) {
    var pieceImg = cell.querySelector("img");
    if (pieceImg) {
      boardState[cell.id] = [pieceImg.id.split("-")[0], currentPlayer];
    }
  });

  console.log("Current board state before creating board:", boardState); // 查看當前棋盤狀態

  // 2. 設置遊戲的其他狀態
  player_id = currentPlayer;
  player = currentPlayer;
  is_your_turn = currentPlayer === 0; // 假設玩家1總是先開始
  board = boardState;
  // TODO: 計算可能的移動（可能需要與伺服器或其他 JS 函數互動）

  // 3. 啟動遊戲
  CreateCustomBoard();

  console.log("Board after calling CreateBoard():", board_div.innerHTML); // 查看重新創建棋盤後的狀態

  AddMoveEventListeners();
}

function CreateCustomBoard() {
  console.log("Enter CreateCustomBoard");
  console.log("Creating custom board with player value:", player);

  // 清空當前棋盤的內容
  board_div.innerHTML = "";

  var content = "";
  content += MakeBench(1 - player); // 對手的棋子座位

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

      var cellId = x_to_use.toString() + y_to_use.toString();
      var pieceData = board[cellId];
      if (pieceData) {
        var imgSrc = TokenToImage(pieceData);
        content += `<td class='board_square' id='${cellId}'><img src='${imgSrc}' width='50' height='50' id='${pieceData[0]}-${pieceData[1]}'></td>`;
      } else {
        content += MakeBoardTD(cellId);
      }
    }
    content += "</tr>";
  }
  content += "</table>";

  content += MakeBench(player); // 玩家自己的棋子座位

  board_div.innerHTML = content;
  ClearAllBackgrounds();

  AddMoveEventListeners();
  console.log("Exit CreateCustomBoard");
}

// 一旦棋盤和棋子被創建，調用以啟用拖放功能
MakeSetupBench();
