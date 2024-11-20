const sudokuGrid = document.getElementById('sudoku-grid');
const resetBtn = document.getElementById('reset-btn');
const pause_resumeBtn = document.getElementById('pause-resume-btn');
const undoBtn = document.getElementById('undo-btn');
const actionStack = []; // Stack to track user actions

let isHoverMode = false; // Tracks if "Show Domains" mode is active

function trackAction(row, col, prevValue, newValue) {
    actionStack.push({ row, col, prevValue, newValue });
}

pause_resumeBtn.addEventListener('click', () => {
    if (isHoverMode) {
        // Switch to "Enter Data" mode
        isHoverMode = false;
        pause_resumeBtn.textContent = 'Show Domains'; // Update button text
        enableNumberEntry();
        solver.initDomains();
    } else {
        // Switch to "Show Domains" mode
        isHoverMode = true;
        pause_resumeBtn.textContent = 'Enter Data'; // Update button text
        disableNumberEntry();
        solver.initDomains();
    }
});

// Prefilled Sudoku puzzle
const sudokuPuzzles = [
    [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    [
        [0, 0, 0, 6, 0, 0, 0, 0, 1],
        [9, 0, 1, 0, 0, 4, 0, 0, 0],
        [0, 4, 5, 0, 0, 0, 3, 9, 0],
        [5, 6, 7, 0, 1, 8, 9, 0, 4],
        [0, 3, 0, 0, 2, 6, 0, 0, 0],
        [2, 0, 9, 0, 4, 7, 8, 6, 3],
        [0, 5, 0, 0, 0, 9, 0, 0, 0],
        [7, 0, 0, 4, 0, 0, 6, 1, 0],
        [0, 0, 0, 7, 0, 3, 2, 0, 9]
    ],
    [
        [0, 0, 6, 0, 4, 5, 0, 7, 8],
        [8, 0, 1, 0, 0, 6, 9, 4, 3],
        [0, 0, 0, 0, 9, 1, 0, 0, 0],
        [7, 0, 0, 0, 0, 0, 8, 0, 5],
        [6, 8, 0, 0, 0, 9, 0, 3, 0],
        [2, 0, 9, 0, 0, 8, 0, 0, 7],
        [5, 0, 8, 0, 1, 0, 0, 2, 0],
        [3, 0, 0, 6, 0, 7, 0, 0, 0],
        [0, 9, 7, 0, 5, 4, 3, 8, 6]
    ],
    [
        [0, 0, 0, 9, 0, 0, 0, 0, 3],
        [0, 0, 4, 8, 1, 0, 0, 2, 0],
        [0, 2, 0, 0, 0, 7, 1, 0, 8],
        [0, 0, 0, 0, 0, 0, 9, 7, 4],
        [0, 0, 0, 0, 0, 3, 0, 0, 0],
        [0, 0, 6, 2, 9, 1, 0, 0, 0],
        [7, 0, 0, 0, 8, 6, 0, 0, 0],
        [0, 0, 0, 3, 2, 4, 7, 8, 6],
        [0, 0, 8, 0, 0, 0, 0, 5, 2]
    ],
    [
        [2, 0, 3, 0, 4, 0, 0, 0, 1],
        [0, 0, 7, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 9, 0, 0, 8, 0, 0],
        [4, 0, 0, 0, 2, 0, 0, 0, 3],
        [0, 0, 2, 0, 3, 0, 0, 6, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 5],
        [0, 0, 0, 4, 0, 0, 1, 0, 0],
        [9, 0, 0, 0, 0, 0, 0, 0, 6],
        [0, 5, 0, 6, 0, 0, 0, 0, 0],

    ],
    [
        [0, 0, 3, 1, 0, 0, 0, 0, 4],
        [9, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 5, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 8, 0, 0, 0, 0],
        [0, 0, 8, 7, 3, 0, 0, 0, 2],
        [0, 0, 4, 0, 0, 9, 0, 0, 0],
        [0, 7, 1, 0, 0, 6, 0, 4, 0],
        [3, 0, 0, 0, 5, 0, 0, 0, 6],
        [0, 0, 6, 0, 0, 3, 0, 9, 0]

    ],
    [
        [7, 0, 0, 0, 6, 0, 0, 0, 0],
        [0, 0, 8, 7, 0, 0, 9, 0, 0],
        [4, 0, 0, 0, 2, 0, 5, 1, 0],
        [0, 0, 0, 9, 4, 8, 7, 0, 0],
        [6, 4, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 7, 0, 0, 0, 0, 5, 0],
        [0, 0, 2, 0, 0, 0, 0, 0, 0],
        [1, 0, 5, 0, 0, 0, 0, 0, 3],
        [0, 0, 0, 5, 0, 6, 0, 0, 0]

    ]
]

const randomIndex = Math.floor(Math.random() * sudokuPuzzles.length);
const puzzle = sudokuPuzzles[randomIndex];
// Create a 9x9 Sudoku grid
function createGrid() {
    for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 9; col++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.setAttribute('maxlength', '1');
            input.setAttribute('type', 'text');
            input.setAttribute('id', `cell-${row}-${col}`);
            input.readOnly = true; // Initially, make all cells non-editable
            td.appendChild(input);
            tr.appendChild(td);

            // Show domains on hover only in "Show Domains" mode
            td.addEventListener('mouseenter', () => {
                if (isHoverMode) {
                    const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                    if (cellValue === '') {
                        showDomain(row, col);
                    }
                }
            });

            td.addEventListener('mouseleave', () => {
                if (isHoverMode) {
                    const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                    if (cellValue === '') {
                        hideDomain(row, col);
                    }
                }
            });

            // Track cell input changes
            input.addEventListener('input', (event) => {
                const prevValue = event.target.dataset.prevValue || '';
                const newValue = event.target.value;
                if (newValue.match(/^[1-9]$/) || newValue === '') {
                    trackAction(row, col, prevValue, newValue);
                    event.target.dataset.prevValue = newValue; // Update previous value
                    solver.initDomains(); // Reinitialize domains
                } else {
                    event.target.value = ''; // Clear invalid input
                }
            });

            sudokuGrid.appendChild(tr);
        }
    }

    // Populate the grid with the puzzle values
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.value = puzzle[row][col] === 0 ? '' : puzzle[row][col];
            if (cell.value === '') {
                cell.style.backgroundColor = 'lightgray';
                cell.readOnly = false; // Allow editing for empty cells
            }
        }
    }
}

createGrid();

// Enable number entry by making all cells editable
function enableNumberEntry() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell.style.backgroundColor === 'lightgray') {
                cell.readOnly = false; // Allow editing}
            }
        }
    }
}

// Disable number entry by making all cells non-editable
function disableNumberEntry() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.readOnly = true; // Disallow editing
        }
    }
}

// Sudoku CSP Solver Logic (minimal for demonstration purposes)
class SudokuSolver {
    constructor() {
        this.domains = [];
        this.initDomains();
    }

    initDomains() {
        this.domains = Array.from({ length: 9 }, () => Array(9).fill([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        this.showDomainsFromPuzzle();
    }
    showDomainsFromPuzzle() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                // const cellValue = this.grid[row][col];
                if (cellValue) {
                    const value = parseInt(cellValue);

                    // Update the row and column
                    for (let i = 0; i < 9; i++) {
                        if (i !== col) {
                            this.domains[row][i] = this.domains[row][i].filter((v) => v !== value);
                        }
                        if (i !== row) {
                            this.domains[i][col] = this.domains[i][col].filter((v) => v !== value);
                        }
                    }

                    // Update the 3x3 subgrid
                    const startRow = Math.floor(row / 3) * 3;
                    const startCol = Math.floor(col / 3) * 3;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            const r = startRow + i;
                            const c = startCol + j;
                            if (r !== row || c !== col) {
                                this.domains[r][c] = this.domains[r][c].filter((v) => v !== value);
                            }
                        }
                    }
                }
            }
        }
    }

    getDomain(row, col) {
        return this.domains[row][col];
    }
}

const solver = new SudokuSolver();

resetBtn.addEventListener('click', () => {
    // Clear the existing grid
    while (sudokuGrid.firstChild) {
        sudokuGrid.removeChild(sudokuGrid.firstChild);
    }
    // Recreate the grid
    createGrid();
    // Reset button text
    pause_resumeBtn.textContent = 'Show Domains';
    // Reset hover mode
    isHoverMode = false;
    // Reinitialize domains
    solver.initDomains();
});


// Show the domain of a cell
function showDomain(row, col) {
    const domain = solver.getDomain(row, col);
    const cell = document.getElementById(`cell-${row}-${col}`);
    const domainDiv = document.createElement('div');
    domainDiv.classList.add('cell-domain', 'show');
    domainDiv.innerText = domain.join(' ');
    cell.parentNode.appendChild(domainDiv);
}

// Hide the domain of a cell
function hideDomain(row, col) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    const domainDiv = cell.parentNode.querySelector('.cell-domain');
    if (domainDiv) {
        domainDiv.remove();
    }
}

// Undo the last action
undoBtn.addEventListener('click', () => {
    if (actionStack.length > 0) {
        const lastAction = actionStack.pop();
        const cell = document.getElementById(`cell-${lastAction.row}-${lastAction.col}`);
        cell.value = lastAction.prevValue; // Revert to the previous value
        cell.dataset.prevValue = lastAction.prevValue; // Update the dataset
        solver.initDomains(); // Reinitialize domains after undo
    } else {
        alert('No actions to undo!');
    }
});
