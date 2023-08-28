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