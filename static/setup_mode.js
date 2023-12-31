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
  let boardState = getCurrentCompleteBoardState();

  fetch("/start_custom_game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_state: boardState,
      player: playerIndex,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
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

      // 3. 使用伺服器返回的遊戲資訊更新遊戲狀態
      player = data.player;
      player_id = data.player_id;

      // 4. 更新棋盤和遊戲狀態。
      // 5. 啟動遊戲循環。
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getCurrentBoardState() {
  let boardState = {};

  // 從主棋盤獲取棋子狀態
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      let cellId = `${col}${row}`;
      let cellElement = document.getElementById(cellId);
      let imgElement = cellElement.querySelector("img");

      if (imgElement) {
        let [pieceType, direction, , player] = imgElement.id.split("-");
        boardState[cellId] = [pieceType, parseInt(player)];
      }
    }
  }

  console.log("Current board state:", boardState);
  return boardState;
}

function getBenchState(player) {
  let benchID = player === 0 ? "P1Bench" : "P2Bench";
  let benchState = {};

  // 擷取bench上的每一個位置的棋子
  let benchSquares = document.querySelectorAll("#" + benchID + " td");
  benchSquares.forEach(function (square, index) {
    let imgElement = square.querySelector("img");
    if (imgElement) {
      let idParts = imgElement.id.split("-");
      let pieceName = idParts[0];
      let piecePlayer = parseInt(idParts[2]);
      benchState["P" + (player + 1) + "B" + index] = [pieceName, piecePlayer];
    }
  });

  return benchState;
}

// 現在，我們可以結合主棋盤和bench的狀態來得到完整的棋盤狀態
function getCurrentCompleteBoardState() {
  let mainBoardState = getCurrentBoardState();
  let player1BenchState = getBenchState(0);
  let player2BenchState = getBenchState(1);

  return { ...mainBoardState, ...player1BenchState, ...player2BenchState };
}

// 一旦棋盤和棋子被創建，調用以啟用拖放功能
MakeSetupBench();
