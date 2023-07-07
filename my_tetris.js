class Board {
    ctx;
    ctxNext;
    grid;
    piece;
    next;
    requestId;
    time;
  
    constructor(ctx, ctxNext) {
      this.ctx = ctx;
      this.ctxNext = ctxNext;
      this.init();
    }
  
    init() {
      // Calculate size of canvas from constants.
      this.ctx.canvas.width = COLS * BLOCK_SIZE;
      this.ctx.canvas.height = ROWS * BLOCK_SIZE;
  
      // Scale so we don't need to give size on every draw.
      this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }
  
    reset() {
      this.grid = this.getEmptyGrid();
      this.piece = new Slice(this.ctx);
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
  
    getNewPiece() {
      this.next = new Slice(this.ctxNext);
      this.ctxNext.clearRect(
        0,
        0, 
        this.ctxNext.canvas.width, 
        this.ctxNext.canvas.height
      );
      this.next.draw();
    }
  
    draw() {
      this.piece.draw();
      this.drawBoard();
    }
  
    drop() {
      let p = moves[KEY.DOWN](this.piece);
      if (this.valid(p)) {
        this.piece.move(p);
      } else {
        this.freeze();
        this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        this.piece = this.next;
        this.piece.ctx = this.ctx;
        this.piece.setStartingPosition();
        this.getNewPiece();
      }
      return true;
    }
  
    clearLines() {
      let lines = 0;
  
      this.grid.forEach((row, y) => {
  
        // If every value is greater than 0.
        if (row.every(value => value > 0)) {
          lines++;
  
          // Remove the row.
          this.grid.splice(y, 1);
  
          // Add zero filled row at the top.
          this.grid.unshift(Array(COLS).fill(0));
        }
      });
      
      if (lines > 0) {
        // Calculate points from cleared lines and level.
  
        account.score += this.getLinesClearedPoints(lines);
        account.lines += lines;
  
        // If we have reached the lines for next level
        if (account.lines >= LINES_PER_LEVEL) {
          // Goto next level
          account.level++;  
          
          // Remove lines so we start working for the next level
          account.lines -= LINES_PER_LEVEL;
  
          // Increase speed of game
          time.level = LEVEL[account.level];
        }
      }
    }
  
    valid(p) {
      return p.shape.every((row, dy) => {
        return row.every((value, dx) => {
          let x = p.x + dx;
          let y = p.y + dy;
          return (
            value === 0 ||
            (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
          );
        });
      });
    }
  
    freeze() {
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.grid[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
    }
  
    drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = COLORS[value];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }
  
    getEmptyGrid() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
  
    insideWalls(x) {
      return x >= 0 && x < COLS;
    }
  
    aboveFloor(y) {
      return y <= ROWS;
    }
  
    notOccupied(x, y) {
      return this.grid[y] && this.grid[y][x] === 0;
    }
  
    rotate(piece) {
      // Clone with JSON for immutability.
      let p = JSON.parse(JSON.stringify(piece));
  
      // Transpose matrix
      for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
      }
  
      // Reverse the order of the columns.
      p.shape.forEach(row => row.reverse());
      return p;
    }
  
    getLinesClearedPoints(lines) {
      const lineClearPoints =
        lines === 1
          ? POINTS.SINGLE
          : lines === 2
          ? POINTS.DOUBLE
          : lines === 3
          ? POINTS.TRIPLE
          : lines === 4
          ? POINTS.TETRIS
          : 0;
  
      return (account.level + 1) * lineClearPoints;
    }
  }


// const canvas_board = document.getElementById('board');
// const canvas_ctx = canvas_board.getContext('2d');
// const boardGrid = 32;
// const tetroSequence = []
// let btn_play = document.getElementById('btn_play')
// let btn_pause = document.getElementById('btn_pause')

// let game_score = 0;

// function score_upadte() {
//     game_score += 5;
// }

// const KEY = {
//     ESC: 27,
//     SPACE: 32,
//     LEFT: 37,
//     UP: 38,
//     RIGHT: 39,
//     DOWN: 40,
//     P: 80,
//     Q: 81
// };

// const COLORS = {
//     'I': 'cyan',
//     'O': 'yellow',
//     'T': 'purple',
//     'S': 'green',
//     'Z': 'red',
//     'J': 'blue',
//     'L': 'orange'
// }

// const SHAPES = {
//     'I': [
//         [0, 0, 0, 0],
//         [1, 1, 1, 1],
//         [0, 0, 0, 0],
//         [0, 0, 0, 0]
//     ],
//     'J': [
//         [1, 0, 0],
//         [1, 1, 1],
//         [0, 0, 0]
//     ],
//     'L': [
//         [0, 0, 1],
//         [1, 1, 1],
//         [0, 0, 0]
//     ],
//     'O': [
//         [1, 1],
//         [1, 1]

//     ],
//     'S': [
//         [0, 1, 1],
//         [1, 1, 0],
//         [0, 0, 0]
//     ],
//     'Z': [
//         [1, 1, 0],
//         [0, 1, 1],
//         [0, 0, 0]
//     ],
//     'T': [
//         [0, 1, 0],
//         [1, 1, 1],
//         [0, 0, 0]
//     ]
// }

// const playingField = []

// // get random integer
// function randomInteger(x, y) {
//     x = Math.ceil(x);
//     y = Math.floor(y);

//     rand = Math.floor(Math.random() * (y - x + 1)) + x;
//     return rand;
// }

// // generate new tetro sequence
// function new_tetro_sequence() {
//     const shapeList = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

//     while (shapeList.length) {
//         const num = randomInteger(0, shapeList.length - 1);
//         const shape = shapeList.splice(num, 1)[0];
//         tetroSequence.push(shape);
//     }
// }

// // get next seq
// function next_tetro_seq() {
//     console.log(tetroSequence)
//     if (tetroSequence.length === 0) {
//         new_tetro_sequence();
//     }
//     const name = tetroSequence.pop();
//     const tetroShape = SHAPES[name];
//     // start at center
//     const column = playingField[0].length / 2 - Math.ceil(tetroShape[0].length / 2)
//     const row = name === 'I' ? -1 : -2;
//     //console.log(tetroShape) // next tetro
//     return {
//         name: name,
//         tetroShape: tetroShape,
//         row: row,
//         column: column
//     }
// }

// // rotate by 90 degrees

// function rotate_tetro(shape) {
//     const length = shape.length - 1;
//     const result = shape.map((row, j) => row.map((x, y) => shape[length - y][j]));
//     return result;
// }

// // check if new shape is valid
// function tetro_IsValid(shape, cellRow, cellCol) {
//     for (let i = 0; i < shape.length; i++) {
//         for (let j = 0; j < shape[i].length; j++) {
//             if (shape[i][j] && (
//                     cellCol + j < 0 || cellCol + j >= playingField[0].length || cellRow + i >= playingField.length || playingField[cellRow + i][cellCol + j]
//                 )) {
//                 return false;
//             }
//         }
//     }
//     return true;
// }

// function tetro_placing() {
//     for (let i = 0; i < next_tetro.tetroShape.length; i++) {
//         for (let j = 0; j < next_tetro.tetroShape[i].length; j++) {
//             if (next_tetro.tetroShape[i][j]) {
//                 if (next_tetro.row + i < 0) {
//                     return game_IsOver();
//                 }
//                 playingField[next_tetro.row + i][next_tetro.column + j] = next_tetro.name;
//             }
//         }
//     }

//     // check if line clears from the bottom
//     for (let i = playingField.length - 1; i >= 0;) {
//         if (playingField[i].every(cell => !!cell)) {

//             for (let j = i; j >= 0; j--) {
//                 for (let k = 0; k < playingField[j].length; k++) {
//                     playingField[j][k] = playingField[j - 1][k]
//                 }
//             }
//             score_upadte();
//         } else {
//             i--;
//         }
//     }
//     next_tetro = next_tetro_seq()
//     console.log(next_tetro) // next tetro
// }

// function game_IsOver() {
//     cancel_animation_frame(animateFrame);

//     //canvas_ctx.fillStyle = 'black';
//     canvas_ctx.globalAlpha = 0.75;
//     canvas_ctx.fillText(0, canvas_board.height / 2 - 30, canvas_board.width, 60);

//     canvas_ctx.globalAlpha = 0.75;
//     canvas_ctx.fillStyle = 'red';
//     canvas_ctx.font = '40px monospace';
//     canvas_ctx.textAlign = 'center';
//     canvas_ctx.textBaseline = 'middle';
//     canvas_ctx.fillText('Game Is Over', canvas_board.width / 2, canvas_board.height / 2);
//     endOfGame = true;
// }

// function pause_game() {
//     pause = true;
//     cancel_animation_frame(animateFrame);
//     canvas_ctx.fillStyle = 'black';
//     canvas_ctx.globalAlpha = 0.75;

//     canvas_ctx.globalAlpha = 1;
//     canvas_ctx.fillStyle = 'orange';
//     canvas_ctx.font = '40px monospace';
//     canvas_ctx.textAlign = 'center';
//     canvas_ctx.textBaseline = 'middle';
//     canvas_ctx.fillText('Game Paused', canvas_board.width / 2, canvas_board.height / 2);
//     btn_play.style.display = 'block'
//     btn_pause.style.display = 'none'
// }

// function play_game() {
//     if (!pause) {
//         return;
//     }
//     btn_play.style.display = 'none'
//     btn_pause.style.display = 'block'
//     animateFrame = requestAnimationFrame(run_time);
//     if (endOfGame) {
//         endOfGame = false;
//         animateFrame = null;
//         run_time()
//     }
//     pause = false
// }

// //populate empty state
// for (let i = -2; i < 20; i++) {
//     playingField[i] = [];

//     for (let j = 0; j < 10; j++) {
//         playingField[i][j] = 0;
//     }
// }

// let next_tetro = next_tetro_seq();
// let pause = true;
// let endOfGame = false;
// let c = 0;
// let animateFrame = null;

// function run_time() {
//     animateFrame = requestAnimationFrame(run_time);
//     canvas_ctx.clearRect(0, 0, canvas_board.width, canvas_board.height);
//     document.getElementById('score').innerHTML = game_score;
//     if (endOfGame) return;
//     if (pause) return;
//     //draw the arena
//     for (let i = 0; i < 20; i++) {
//         for (let j = 0; j < 10; j++) {
//             if (playingField[i][j]) {
//                 const indicator = playingField[i][j];
//                 canvas_ctx.fillStyle = COLORS[indicator];
//                 canvas_ctx.fillRect(j * boardGrid, i * boardGrid, boardGrid - 1, boardGrid - 1);
//             }
//         }
//     }

//     if (next_tetro) {
//         if (++c > 35) {
//             next_tetro.row++;
//             c = 0;

//             if (!tetro_IsValid(next_tetro.tetroShape, next_tetro.row, next_tetro.column)) {
//                 next_tetro.row--;
//                 tetro_placing();
//             }

//         }

//         canvas_ctx.fillStyle = COLORS[next_tetro.name];

//         for (let i = 0; i < next_tetro.tetroShape.length; i++) {
//             for (let j = 0; j < next_tetro.tetroShape[i].length; j++) {
//                 if (next_tetro.tetroShape[i][j]) {
//                     canvas_ctx.fillRect((next_tetro.column + j) * boardGrid, (next_tetro.row + i) * boardGrid, boardGrid - 1, boardGrid - 1);
//                 }
//             }
//         }
//     }
// }

// function spaceBarDrop() {
//     var row = next_tetro.row + 1;
//     while (tetro_IsValid(next_tetro.tetroShape, row, next_tetro.column)) {
//         row++;
//     }
//     if (!tetro_IsValid(next_tetro.tetroShape, row, next_tetro.column)) {
//         next_tetro.row = row - 1;

//         tetro_placing();
//         return;
//     }

//     next_tetro.row = row;
// }

// document.addEventListener('keydown', function(e) {
//     //navigation codes for left and right 
//     if (e.keyCode === KEY.LEFT || e.keyCode === KEY.RIGHT) {
//         const col = e.keyCode === KEY.LEFT ?
//             next_tetro.column - 1 :
//             next_tetro.column + 1;

//         if (tetro_IsValid(next_tetro.tetroShape, next_tetro.row, col)) {
//             next_tetro.column = col;
//         }
//     }
//     //up arrow key
//     if (e.keyCode === KEY.UP) {
//         const mat = rotate_tetro(next_tetro.tetroShape);
//         if (tetro_IsValid(mat, next_tetro.row, next_tetro.column)) {
//             next_tetro.tetroShape = mat
//         }
//     }

//     //down arrow key
//     if (e.keyCode === KEY.DOWN) {
//         const row = next_tetro.row + 1;
//         if (!tetro_IsValid(next_tetro.tetroShape, row, next_tetro.column)) {
//             next_tetro.row = row - 1;

//             tetro_placing();
//             return;
//         }

//         next_tetro.row = row;
//     }
//     if (e.keyCode === KEY.SPACE && !endOfGame && !pause)
//         spaceBarDrop();

//     //pause key
//     if (e.keyCode === KEY.P && !endOfGame && !pause)
//         pause_game();

//     //end game
//     if (e.keyCode === KEY.ESC)
//         game_IsOver();
// });