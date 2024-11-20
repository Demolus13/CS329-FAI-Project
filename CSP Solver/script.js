const sudokuGrid = document.getElementById('sudoku-grid');
const solveBtn = document.getElementById('solve-btn');
const resetBtn = document.getElementById('reset-btn');
const pause_resumeBtn = document.getElementById('pause-resume-btn');

let paused = false;  // Track whether the visualization is paused

pause_resumeBtn.addEventListener('click', () => {
    if (paused) {
        // Resume the step-through process if it's paused
        paused = false;
        solver.stepThrough();  // Start/resume the step visualization
        pause_resumeBtn.textContent = 'Pause';  // Update button text
    } else {
        // Pause the step-through process
        paused = true;
        pause_resumeBtn.textContent = 'Resume';  // Update button text
    }
});

// Prefilled Sudoku puzzle
const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

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
            input.readOnly = true; // Make all cells non-editable
            td.appendChild(input);
            tr.appendChild(td);

            // Only show the domain on empty cells (cells with value '')
            td.addEventListener('mouseenter', () => {
                const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                if (cellValue === '') { // Check if the cell is empty
                    showDomain(row, col);
                }
            });

            td.addEventListener('mouseleave', () => {
                const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                if (cellValue === '') { // Check if the cell is empty
                    hideDomain(row, col);
                }
            });

            input.addEventListener('input', () => updateDomains());
        }
        sudokuGrid.appendChild(tr);
    }

    // Populate the grid with the puzzle values
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            cell.value = puzzle[row][col] === 0 ? '' : puzzle[row][col];
        }
    }
}


createGrid();

// Sudoku CSP Solver Logic
class SudokuSolver {
    constructor() {
        this.grid = [];
        this.steps = [];
        this.initGrid();
        this.stopVisualization = false;
        this.domains = [];
        this.initDomains();
    }


    initDomains() {
        this.domains = Array.from({ length: 9 }, () => Array(9).fill([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        this.updateDomainsFromPuzzle();
    }

    showDomains() {
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

    updateDomainsFromPuzzle() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                const cellValue = this.grid[row][col];
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

    initGrid() {
        this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellValue = document.getElementById(`cell-${row}-${col}`).value;
                this.grid[row][col] = cellValue ? parseInt(cellValue) : 0;
            }
        }
    }

    isValid(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num || this.grid[i][col] === num) {
                return false;
            }
        }

        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    solve() {
        const empty = this.findEmpty();
        if (!empty) return true;

        const [row, col] = empty;

        const domain_here = this.getDomain(row, col)

        for (let i = 0; i < domain_here.length; i++) {
            const num = domain_here[i];
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;

                this.steps.push({ row, col, num, action: 'assign' });
                solver.initDomains();

                if (this.solve()) {
                    return true;
                }

                this.grid[row][col] = 0;

                this.steps.push({ row, col, num, action: 'backtrack' });
                solver.initDomains();
            }
        }

        return false;
    }

    findEmpty() {
        let ans1 = null;
        let ans2 = null;
        let mini = 10;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    const domain_here = this.getDomain(row, col)
                    if (domain_here.length < mini) {
                        mini = domain_here.length;
                        ans1 = row;
                        ans2 = col;
                    }
                }
            }
        }
        return ans1 === null ? false : [ans1, ans2];
    }

    visualizeStep(step) {
        let cell = document.getElementById(`cell-${step.row}-${step.col}`);
        cell.classList.remove('highlight', 'conflict');

        if (step.action === 'assign') {
            cell.value = step.num;
            cell.classList.add('highlight');
        } else if (step.action === 'backtrack') {
            cell.value = '';
            cell.classList.add('conflict');
        }
        this.showDomains();

    }

    stepThrough() {
        if (this.steps.length > 0 && !paused) {  // Check if not paused
            const step = this.steps.shift();

            this.visualizeStep(step);

            setTimeout(() => this.stepThrough(), 1000); // Visualize step by step
        }
    }

    reset() {
        this.stopVisualization = true; // Stop visualization
        this.steps = []; // Clear steps
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.value = '';
                cell.readOnly = true; // Ensure cells remain non-editable
                cell.classList.remove('highlight', 'conflict');
            }
        }
    }


    loadPuzzle(puzzle) {
        this.reset();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (puzzle[row][col] !== 0) {
                    const cell = document.getElementById(`cell-${row}-${col}`);
                    cell.value = puzzle[row][col];
                }
            }
        }
    }
}

const solver = new SudokuSolver();

solveBtn.addEventListener('click', () => {
    // solver.initGrid();
    solver.solve();
    solver.stepThrough(); // Visualize solution step by step
});

resetBtn.addEventListener('click', () => {
    solver.reset(); // Stop everything and clear the grid
    solver.loadPuzzle(puzzle); // Reload the predefined puzzle
    solver.stopVisualization = false; // Allow future visualizations
    solver.initGrid();
    solver.initDomains();
});

function showDomain(row, col) {
    const domain = solver.getDomain(row, col);
    const cell = document.getElementById(`cell-${row}-${col}`);
    const domainDiv = document.createElement('div');
    domainDiv.classList.add('cell-domain', 'show');
    domainDiv.innerText = domain.join(' ');
    cell.parentNode.appendChild(domainDiv);
}

function hideDomain(row, col) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    const domainDiv = cell.parentNode.querySelector('.cell-domain');
    if (domainDiv) {
        domainDiv.remove();
    }
}