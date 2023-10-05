
class Board {
  constructor() {
    this.game = new Array(9).fill(null); // Initialize the game board with empty cells
    this.winStates = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    this.end = false; // Indicates whether the game has ended
    this.turn = 'X'; // Initialize the turn to 'X'
    this.switch = new Map([['X', 'O'], ['O', 'X']]); // Map to switch turns
  }

  getCurrentPlayer() {
    return this.turn;
  }

  move(index, piece) {
    // Check if the cell is empty and it's the player's turn
    if (this.game[index] === null && piece === this.turn && !this.end) {
      this.game[index] = piece; // Make the move
      this.switchTurn(); // Switch to the other player's turn
      return true; // Valid move
    }
    return false; // Invalid move
  }

  switchTurn() {
    this.turn = this.switch.get(this.turn); // Switch the turn to the other player
  }

  checkWinner(player) {
    // Check if any of the win states have been achieved by the current player
    return this.winStates.some(state => (
      state.every(position => this.game[position] === player)
    ));
  }

  checkDraw() {
    // Check if all cells are filled (no winner) - indicating a draw
    return this.game.every(value => value !== null);
  }

  reset() {
    // Reset the game board and turn to the initial state
    this.game = new Array(9).fill(null);
    this.turn = 'X';
    this.end = false;
  }
}

module.exports = Board;
