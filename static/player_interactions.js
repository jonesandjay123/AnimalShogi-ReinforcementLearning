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
