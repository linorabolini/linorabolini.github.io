function engineGame(options) {
  options = options || {};
  var orientations = { w: "white", b: "black" };
  var game = new Chess();
  var board;
  /// We can load Stockfish via Web Workers or via STOCKFISH() if loaded from a <script> tag.
  var engine =
    typeof STOCKFISH === "function"
      ? STOCKFISH()
      : new Worker(options.stockfishjs || "stockfish.js");
  var engineStatus = {};
  var time = { depth: 3 };
  var playerColor = "";
  // do not pick up pieces if the game is over
  // only pick up pieces for White
  var onDragStart = function (source, piece, position, orientation) {
    if (
      game.turn() != playerColor ||
      game.game_over() ||
      piece[0] != playerColor
    ) {
      return false;
    }
  };

  function setPlayerColor(color) {
    playerColor = color;
    board.orientation(orientations[playerColor]);
  }

  engine.postMessage("uci");
  engine.postMessage("setoption name Use NNUE value true", engine);

  function get_moves() {
    return game
      .history({ verbose: true })
      .map(({ from, to, promotion = "" }) => from + to + promotion)
      .join(" ");
  }

  var undoMoves = [];
  function undo(movements = 1) {
    while (movements--) {
      undoMoves.push(game.undo());
    }
    board.position(game.fen());
  }

  function redo(movements = 1) {
    while (movements--) {
      game.move(undoMoves.pop());
    }
    board.position(game.fen());
  }

  function prepareMove() {
    $("#pgn").html(game.pgn({ max_width: 5, newline_char: "<br />" }));
    if (!game.game_over()) {
      if (playerColor != game.turn()) {
        engine.postMessage("position startpos moves " + get_moves());
        engine.postMessage("go " + (time.depth ? "depth " + time.depth : ""));
      }
    } else {
      if (!playerColor) {
        undo(3);
        setPlayerColor(game.turn());
      }
      board.position(game.fen());
    }
  }

  function displayStatus() {
    // console.log(engineStatus);
  }

  engine.onmessage = function (event) {
    var line = event?.data ?? event;
    console.log("Reply: " + line);
    if (line == "uciok") {
    } else if (line == "readyok") {
    } else {
      var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
      /// Did the AI move?
      if (match) {
        game.move({ from: match[1], to: match[2], promotion: match[3] });
        prepareMove();
      }

      /// Is it sending feed back with a score?
      if ((match = line.match(/^info .*\bscore (\w+) (-?\d+)/))) {
        var score = parseInt(match[2]) * (game.turn() == "w" ? 1 : -1);
        /// Is it measuring in centipawns?
        if (match[1] == "cp") {
          engineStatus.score = (score / 100.0).toFixed(2);
          /// Did it find a mate?
        } else if (match[1] == "mate") {
          engineStatus.score = "Mate in " + Math.abs(score);
        }

        /// Is the score bounded?
        if ((match = line.match(/\b(upper|lower)bound\b/))) {
          engineStatus.score =
            ((match[1] == "upper") == (game.turn() == "w") ? "<= " : ">= ") +
            engineStatus.score;
        }
      }
    }
    displayStatus();
  };

  var onDrop = function (source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: "q",
    });

    // illegal move
    if (move === null) return "snapback";

    prepareMove();
  };

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  var onSnapEnd = function () {
    removeGreySquares();
    board.position(game.fen());
  };

  function removeGreySquares() {
    $(".highlighted--available").toggleClass("highlighted--available", false);
    $(".highlighted--main").toggleClass("highlighted--main", false);
  }

  function onMouseoverSquare(square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true,
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    $(".square-" + square).toggleClass("highlighted--main", true);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      $(".square-" + moves[i].to).toggleClass("highlighted--available", true);
    }
  }

  function onMouseoutSquare(square, piece) {
    removeGreySquares();
  }

  var cfg = {
    showNotation: true,
    showErrors: true,
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
  };

  board = new ChessBoard("board", cfg);
  $("#board").on(
    "scroll touchmove touchend touchstart contextmenu",
    function (e) {
      e.preventDefault();
    }
  );
  $(window).resize(board.resize);

  return {
    reset: function () {
      playerColor = "";
      game.reset();
      board.position(game.fen());
      engine.postMessage("setoption name Contempt value 0");
      this.setSkillLevel(14);
      engine.postMessage("setoption name King Safety value 0"); /// Agressive 100 (it's now symetric)
    },
    loadPgn: function (pgn) {
      game.load_pgn(pgn);
    },
    redo,
    undo,
    setPlayerColor,
    setSkillLevel: function (skill) {
      var max_err, err_prob;

      if (skill < 0) {
        skill = 0;
      }
      if (skill > 20) {
        skill = 20;
      }

      time.level = skill;

      /// Change thinking depth allowance.
      if (skill < 5) {
        time.depth = "1";
      } else if (skill < 10) {
        time.depth = "2";
      } else if (skill < 15) {
        time.depth = "3";
      } else {
        /// Let the engine decide.
        time.depth = "";
      }

      engine.postMessage("setoption name Skill Level value " + skill);

      ///NOTE: Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
      /// Level 0 starts at 1
      err_prob = Math.round(skill * 6.35 + 1);
      /// Level 0 starts at 10
      max_err = Math.round(skill * -0.5 + 10);

      engine.postMessage(
        "setoption name Skill Level Maximum Error value " + max_err
      );
      engine.postMessage(
        "setoption name Skill Level Probability value " + err_prob
      );
    },
    setContempt: function (contempt) {
      engine.postMessage("setoption name Contempt value " + contempt);
    },
    setAggressiveness: function (value) {
      engine.postMessage("setoption name Aggressiveness value " + value);
    },
    start: function () {
      engine.postMessage("ucinewgame");
      engine.postMessage("isready");
      engineStatus = {};
      displayStatus();
      prepareMove();
    },
  };
}
