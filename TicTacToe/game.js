/*
  Project: Tic-Tac-Toe with MiniMax AI
  Author: Anderson Pereira dos Santos
  Repository: https://github.com/andersonpereiradossantos/tic-tac-toe-ai-minimax
  License: MIT License
  Description: This JavaScript file contains the implementation of the MiniMax algorithm for the Tic-Tac-Toe game. The algorithm provides the AI opponent's logic, making it challenging to beat. Feel free to use and modify this code according to the terms of the MIT License.
*/

let game = new Array(9);
let classLine = '';
const cell = document.querySelectorAll('.cell');
let humanPlayer = 'X';
let computerPlayer = 'O';
let currentPlayer = 'X';
let gameMode = 'human'; // 'human' or 'computer'

const winningCombinations = [
    { 'combination': [0, 1, 2], 'lineClass': 'line-horizontal-top' },
    { 'combination': [3, 4, 5], 'lineClass': 'line-horizontal-center' },
    { 'combination': [6, 7, 8], 'lineClass': 'line-horizontal-bottom' },
    { 'combination': [0, 3, 6], 'lineClass': 'line-vertical-left' },
    { 'combination': [1, 4, 7], 'lineClass': 'line-vertical-center' },
    { 'combination': [2, 5, 8], 'lineClass': 'line-vertical-right' },
    { 'combination': [0, 4, 8], 'lineClass': 'line-diagonal-right' },
    { 'combination': [2, 4, 6], 'lineClass': 'line-diagonal-left' },
];

const init = () => {
    cell.forEach((el, i) => {
        el.addEventListener('click', () => {
            try {
                if (!checkWinner(game, humanPlayer) && !checkWinner(game, computerPlayer)) {
                    if (gameMode === 'human') {
                        mark(el, currentPlayer);
                        if (!checkWinner(game, currentPlayer)) {
                            currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch player
                        }
                    } else {
                        mark(el, humanPlayer);
                        if (!checkWinner(game, humanPlayer)) {
                            computer();
                        }
                    }
                } 
                checkGameEnd();
            } catch (error) {
                console.error(error);
                alert(error);
            }
        });
        el.setAttribute('data-cell', i);
    });
};

const checkGameEnd = () => {
    let result = '';
    let line = '';
    if (checkWinner(game, humanPlayer)) {
        result = `Player ${humanPlayer}`;
        line = classLine;
        document.querySelector("#line").className = classLine;
    } else if (checkWinner(game, computerPlayer)) {
        line = classLine;
        result = `Player ${computerPlayer}`;
    } else if (emptyCells(game).length === 0) {
        result = 'It is a Draw!';
    }
    document.querySelector("#line").className = line;
    document.querySelector('#result').innerHTML = result;
};

const mark = (el, player) => {
    showButtons(false);
    if (!isChecked(el)) {
        el.innerHTML = player;
        el.setAttribute('data-mark', player)
        game[parseInt(el.getAttribute('data-cell'))] = player;
        if (checkWinner(game, player)) {
            document.querySelector("#line").classList.remove('d-none');
        }      
    } else {
        throw new Error('Already marked or the game is over!');
    }
};

document.querySelector('#selectX').addEventListener('click', () => {
    selectPlayer(humanPlayer);
});

document.querySelector('#selectO').addEventListener('click', () => {
    selectPlayer(computerPlayer);
});

document.querySelector('#reset').addEventListener('click', () => {
    if (gameMode === 'human') {
        startHumanVsHumanGame();
    } else {
        startHumanVsComputerGame();
    }
});

const selectPlayer = (player) => {
    if (player == computerPlayer) {
        humanPlayer = 'O';
        computerPlayer = 'X';
    } else {
        humanPlayer = 'X';
        computerPlayer = 'O';
    }
};

const isChecked = (el) => {
    return game[parseInt(el.getAttribute('data-cell'))] !== undefined;
}

const emptyCells = (gameCurrent) => {
    let empty = [];
    for (let i = 0; i < gameCurrent.length; i++) {
        if (!gameCurrent[i]) empty.push(i);
    }
    return empty;
}

const computer = () => {
    let empty = emptyCells(game);
    if (empty.length > 0) {
        let bestMove = miniMax(game, computerPlayer, empty.length);
        mark(cell[bestMove.index], computerPlayer);
    }
}

const checkWinner = (gameCurrent, player) => {
    let pos = findPosition(gameCurrent, player);
    for (let i = 0; i < winningCombinations.length; i++) {
        if (winningCombinations[i].combination.every(item => pos.includes(item))) {
            classLine = winningCombinations[i].lineClass;
            return true;
        }
    }
    return false;
}

const findPosition = (array, value) => {
    const positions = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            positions.push(i);
        }
    }
    return positions;
}

const showButtons = (show = true) => {
    if (show) {
        document.querySelector('#selectO').classList.remove('d-none');
        document.querySelector('#selectX').classList.remove('d-none');
        document.querySelector('#home').classList.remove('d-none');
        document.querySelector('#reset').classList.add('d-none');
        return;
    }

    document.querySelector('#selectO').classList.add('d-none');
    document.querySelector('#selectX').classList.add('d-none');
    document.querySelector('#home').classList.add('d-none');
    document.querySelector('#reset').classList.remove('d-none');
}

const miniMax = (gameCurrent, player, depth) => {
    const min = (a, b) => {
        return a < b ? a : b;
    }
    
    const max = (a, b) => {
        return a > b ? a : b;
    }

    let empty = emptyCells(gameCurrent);

    if (checkWinner(gameCurrent, humanPlayer)) {
        return { score: -1 };
    }
    if (checkWinner(gameCurrent, computerPlayer)) {
        return { score: 1 };
    }
    if (empty.length === 0 || depth === 0) {
        return { score: 0 };
    }
    
    depth--;

    let movePossibles = [];

    for (let i = 0; i < empty.length; i++) {
        let move = {};
        move.index = empty[i];

        let newGame = gameCurrent.slice();
        newGame[empty[i]] = player;

        let result = miniMax(newGame, player === computerPlayer ? humanPlayer : computerPlayer, depth);
        move.score = result.score;
        movePossibles.push(move);
    }

    let bestMove;	
    if (player === computerPlayer) {
        bestScore = -Infinity;
        for (let i = 0; i < movePossibles.length; i++) {
            bestScore = max(bestScore, movePossibles[i].score);
            if (movePossibles[i].score === bestScore) {
                bestMove = i;
            }
        }
    } else {
        bestScore = Infinity;
        for (let i = 0; i < movePossibles.length; i++) {
            bestScore = min(bestScore, movePossibles[i].score);
            if (movePossibles[i].score === bestScore) {
                bestMove = i;
            }
        }
    }

    return movePossibles[bestMove];
}

const startHumanVsHumanGame = () => {
    gameMode = 'human';
    game = new Array(9);
    currentPlayer = 'X';
    document.querySelector('#reset').classList.remove('d-none');
    document.querySelector("#line").className = '';
    document.querySelector("#line").classList.add('d-none');
    cell.forEach((el) => {
        el.innerHTML = '';
        el.setAttribute('data-mark', '')
    });
    document.querySelector('#result').innerHTML = '';
    showButtons(false);
}

const startHumanVsComputerGame = () => {
    gameMode = 'computer';
    game = new Array(9);
    document.querySelector('#reset').classList.remove('d-none');
    document.querySelector("#line").className = '';
    document.querySelector("#line").classList.add('d-none');
    cell.forEach((el) => {
        el.innerHTML = '';
        el.setAttribute('data-mark', '')
    });
    document.querySelector('#result').innerHTML = '';
    showButtons();
}

init();