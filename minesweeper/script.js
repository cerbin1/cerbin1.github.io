let game = {
    numberOfBombs: 0,
    isGameDone: false,
    isFirstClick: true,
    messageBox: null,
    createBoard: function () {
        this.board.numberOfFlaggedFields = 0;
        this.isGameDone = false;
        this.isFirstClick = true;
        this.board.cells = createGameBoard();
        createBorderTable();
        plantBombs();
    },
    gameField: null,
    createGameDiv: function () {
        this.gameField = document.createElement("div");
        this.gameField.setAttribute("id", "gameDiv");
        this.gameField.setAttribute("oncontextmenu", "return false");
        document.body.appendChild(this.gameField);
    },

    createMessageBox: function () {
        var divToDisplayMessages = document.createElement("div");
        divToDisplayMessages.setAttribute("id", "messageBox");
        document.getElementById("gameDiv").appendChild(divToDisplayMessages);
        this.messageBox = document.getElementById("messageBox");
    },
    clearBoard: function () {
        this.messageBox.innerHTML = "";
        this.gameField.innerHTML = "";
    },
    board: {
        width: 0,
        height: 0,
        cells: null,
        numberOfFlaggedFields: 0,
        iterateCells: function (callback) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    let cell = this.cells[i][j];
                    callback(cell);
                }
            }
        },
        isWidthProperly: function () {
            return (this.width >= 1 && this.width <= 50) && (Math.round(this.width) === this.width);
        },
        isHeightProperly: function () {
            return (this.height >= 1 && this.height <= 50) && (Math.round(this.height) === this.height);
        },
        bombsConditions: function () {
            return game.numberOfBombs === Math.round(game.numberOfBombs) && game.numberOfBombs >= 0 && game.numberOfBombs < this.height * this.width;
        },
        countBombsAdjacentToFields: function () {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    this.isBombAdjacentToField(i, j);
                }
            }
        },
        isBombAdjacentToField: function (x, y) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (this.isFieldInBoard(x + i, y + j)) {
                        if (this.cells[x + i][y + j].isBomb) {
                            this.incrementNumberOfBombsAdjacentToField(x, y);
                        }
                    }
                }
            }
        },
        isFieldInBoard: function (x, y) {
            return (0 <= x && x < this.height) && (0 <= y && y < this.width);
        },
        incrementNumberOfBombsAdjacentToField: function (x, y) {
            this.cells[x][y].numberOfBombsAdjacent++;
        },

        countUndiscoveredFields: function () {
            let numberOfUndiscoveredFields = 0;

            this.iterateCells(function (cell) {
                if (!cell.isBomb && !cell.isDiscovered) {
                    numberOfUndiscoveredFields++;
                }
            });

            return numberOfUndiscoveredFields;
        }
    }
};
let colorsOfNumberOfBombsAdjacentToField = ["blue", "green", "red", "purple", "orange", "yellow", "brown", "pink"];

function startGame() {
    if (game.gameField != null) {
        game.clearBoard();
    }

    game.board.width = document.getElementById("width").value;
    game.board.height = document.getElementById("height").value;
    game.numberOfBombs = document.getElementById("bombs").value;
    if (game.board.isWidthProperly()) {
        if (game.board.isHeightProperly()) {
            if (game.board.bombsConditions()) {
                game.createGameDiv();
                game.createBoard();
                game.createMessageBox();
            }
            else {
                alert("Podałeś niepoprawną liczbę bomb!");
            }
        }
        else {
            alert("Wysokość niepoprawna (Powinna być wartość od 1 do 50)!");
        }
    }
    else {
        alert("Szerokość niepoprawna (Powinna być wartość od 1 do 50)!");
    }
}

function createGameBoard() {
    let array = [];
    for (let i = 0; i < game.board.height; i++) {
        array[i] = [];
        for (let j = 0; j < game.board.width; j++) {
            array[i][j] = getDefaultFieldObject();
        }
    }
    return array;
}

function getDefaultFieldObject() {
    return {
        isBomb: false,
        isFlag: false,
        isDiscovered: false,
        numberOfBombsAdjacent: 0,
        gameField: null,
        changeFieldToBomb: function () {
            let bombImage = document.createElement("img");
            bombImage.setAttribute("class", "sizeOfImage");
            bombImage.src = "bomb.png";
            this.gameField.appendChild(bombImage);
        }
    };
}

function createBorderTable() {
    let table = document.createElement("table");
    table.setAttribute("id", "game.board");
    game.gameField.appendChild(table);

    for (let i = 0; i < game.board.height; i++) {
        let row = document.createElement("tr");
        row.setAttribute("id", "row" + i.toString());
        table.appendChild(row);

        for (let j = 0; j < game.board.width; j++) {
            let cell = document.createElement("td");
            cell.addEventListener("click", leftMouseClick);
            cell.addEventListener("contextmenu", rightMouseClick);
            cell.dataset.x = i.toString();
            cell.dataset.y = j.toString();
            row.appendChild(cell);
            game.board.cells[i][j].gameField = cell;
        }
    }
}

function plantBombs() {
    for (let i = 0; i < game.numberOfBombs; i++) {
        plantRandomBomb();
    }
}

function plantRandomBomb() {
    while (true) {
        let x = Math.floor(Math.random() * game.board.height);
        let y = Math.floor(Math.random() * game.board.width);
        if (!game.board.cells[x][y].isBomb) {
            game.board.cells[x][y].isBomb = true;
            break;
        }
    }
}


function displayAllBombs() {
    for (let i = 0; i < game.board.height; i++) {
        for (let j = 0; j < game.board.width; j++) {
            let cellToChange = game.board.cells[i][j];
            if (cellToChange.isBomb) {
                if (cellToChange.isFlag) {
                    cellToChange.gameField.innerHTML = "";
                    cellToChange.gameField.style.backgroundColor = "lightGreen";
                }
                else {
                    cellToChange.gameField.style.backgroundColor = "#FF4500";//TODO add red color only when player lose, otherwise, set all bombs background color on green
                }
                cellToChange.changeFieldToBomb();
            }
        }
    }
}

function leftMouseClick() {
    if (game.isGameDone) {
        game.messageBox.innerHTML = "Rozpocznij nową grę";
    } else {
        let x = parseInt(this.dataset.x);
        let y = parseInt(this.dataset.y);

        let cell = game.board.cells[x][y];
        if (game.isFirstClick) {
            if (cell.isBomb) {
                plantRandomBomb();
                cell.isBomb = false;
            }
            game.board.countBombsAdjacentToFields();
            game.isFirstClick = false;
        }

        discoverField(x, y, cell);
        checkIfPlayerWins();
    }
}

function rightMouseClick() {
    game.isFirstClick = false;
    if (game.isGameDone) {
        game.messageBox.innerHTML = "Rozpocznij nową grę";
    } else {
        let x = parseInt(this.dataset.x);
        let y = parseInt(this.dataset.y);

        setFlag(game.board.cells[x][y]);
        checkIfPlayerWins();
    }
}

function discoverField(x, y, cellToDiscover) {
    if (cellToDiscover.isFlag) {
        return;
    }
    if (cellToDiscover.isDiscovered) {
        return;
    }
    if (cellToDiscover.isBomb) {
        displayAllBombs();
        game.messageBox.innerHTML = "Przegrałeś";
        game.isGameDone = true;
    } else {
        if (cellToDiscover.numberOfBombsAdjacent > 0) {
            displayAndColorField(cellToDiscover);
        } else {
            floodFill(x, y);
        }
    }
}

function displayAndColorField(cellToDiscover) {
    cellToDiscover.gameField.innerText = cellToDiscover.numberOfBombsAdjacent;
    cellToDiscover.gameField.style.color = colorNumberOfBombs(cellToDiscover.numberOfBombsAdjacent);
    cellToDiscover.gameField.style.backgroundColor = "darkGray";
    cellToDiscover.isDiscovered = true;
}

function colorNumberOfBombs(numberOfBombs) {
    return colorsOfNumberOfBombsAdjacentToField[numberOfBombs - 1];
}

function floodFill(x, y) {
    if (isFieldOutsideBoard(x, y)) {
        return;
    }

    let cell = game.board.cells[x][y];

    if (isEmptyOrDiscovered(cell)) {
        return;
    }

    if (cell.numberOfBombsAdjacent > 0) {
        fillFieldWithBombsAdjacent(cell);
    }
    else {
        fillEmptyField(cell);
        recursiveFloodFill(x, y);
    }
}

function isFieldOutsideBoard(x, y) {
    return (0 > y || y >= game.board.width) || (0 > x || x >= game.board.height);
}

function isEmptyOrDiscovered(cell) {
    return cell.isDiscovered || cell.isFlag || cell.isBomb;
}

function fillFieldWithBombsAdjacent(cell) {
    cell.gameField.innerHTML = cell.numberOfBombsAdjacent.toString();
    cell.gameField.style.color = colorNumberOfBombs(cell.numberOfBombsAdjacent);
    cell.gameField.style.backgroundColor = "darkGray";
    cell.isDiscovered = true;
}

function fillEmptyField(cell) {
    cell.gameField.style.backgroundColor = "darkGray";
    cell.isDiscovered = true;
}

function recursiveFloodFill(x, y) {
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            floodFill(x + i, y + j);
        }
    }
}

function checkIfPlayerWins() {
    if (winCondition()) {
        displayAllBombs();
        game.messageBox.innerHTML = "Wygrałeś!!!";
        game.isGameDone = true;
    }
}

function winCondition() {
    return countFlagPoints() === game.numberOfBombs || game.board.countUndiscoveredFields() === 0;
}

function countFlagPoints() {
    let numberOfPoints = 0;
    game.board.iterateCells(function (cell) {
        if (cell.isFlag) {
            if (cell.isBomb) {
                numberOfPoints++;
            }
            else {
                numberOfPoints--;
            }
        }
    });
    if (allFieldsDiscovered()) {
        return numberOfPoints;
    }
    return 0;
}

function allFieldsDiscovered() {
    let allDiscovered = true;
    game.board.iterateCells(function (cell) {
        if (!cell.isDiscovered) {
            allDiscovered = false;
        }
    });
    return allDiscovered;
}


function setFlag(cellToSetFlag) {
    if (cellToSetFlag.isDiscovered) {
        return;
    }
    if (cellToSetFlag.isFlag) {
        cellToSetFlag.gameField.innerHTML = "";
        cellToSetFlag.isFlag = false;
        game.board.numberOfFlaggedFields--;
    } else {
        let flagImage = document.createElement("img");
        flagImage.setAttribute("class", "sizeOfImage");
        flagImage.src = "flag.png";
        cellToSetFlag.isFlag = true;
        game.board.numberOfFlaggedFields++;
        cellToSetFlag.gameField.appendChild(flagImage);
    }
    game.messageBox.innerHTML = "Pozostalo bomb: " + (game.numberOfBombs - game.board.numberOfFlaggedFields);
}