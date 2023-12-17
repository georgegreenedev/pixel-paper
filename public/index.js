// Colors
const BLUE = "rgb(137, 126, 255)";
const BROWN = "rgb(136, 112, 0)";
const RED = "rgb(216, 40, 0)";
const TAN = "rgb(252, 152, 56)";
const WHITE = "rgb(255, 255, 255)";

// Key types
const ARROW_KEYS = ["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"];
const MODIFIER_KEYS = ["Alt", "Control", "Escape", "Shift"];
const NUMBER_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// Paper state
const paperHistory = new Map();
let paperMarker = -1;

let paintedSquaresMap = new Map();
const squares = new Map();

let paperRows = 16;
let paperColumns = 16;
let squareSize = 25;

// State
let isControlKeyPressed = false;
let isPointerClicked = false;
let isShiftKeyPressed = false;
let nameValue = "";
let selectedColor = undefined;
let selectedSquare = undefined;

// Control buttons
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const deleteButton = document.getElementById("delete-button");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");
const clearButton = document.getElementById("clear-button");

// Paper element
const paperElement = document.getElementById("paper");

// Paper buttons
const paperColumnsInput = document.getElementById("paper-columns-input");
const paperRowsInput = document.getElementById("paper-rows-input");
const paperSquareSizeInput = document.getElementById("paper-square-size-input");

// Color buttons
const blueColorButton = document.getElementById("blue-color-button");
const brownColorButton = document.getElementById("brown-color-button");
const redColorButton = document.getElementById("red-color-button");
const tanColorButton = document.getElementById("tan-color-button");

// Dialogs
const loadConfirmationDialog = document.getElementById("load-confirmation-dialog");
const saveConfirmationDialog = document.getElementById("save-confirmation-dialog");
const deleteConfirmationDialog = document.getElementById("delete-confirmation-dialog");

// Dialog inputs and buttons
const graphSelect = document.getElementById("graph-select");
const cancelSaveButton = document.getElementById("cancel-save-button");
const cancelLoadButton = document.getElementById("cancel-load-button");
const confirmSaveButton = document.getElementById("confirm-save-button");
const confirmLoadButton = document.getElementById("confirm-load-button");
const nameInput = document.getElementById("name-input");

blueColorButton.addEventListener("click", changeActiveColor);
brownColorButton.addEventListener("click", changeActiveColor);
cancelSaveButton.addEventListener("click", cancelSave);
cancelLoadButton.addEventListener("click", cancelLoad);
confirmLoadButton.addEventListener("click", confirmLoad);
clearButton.addEventListener("click", clearPaper);
confirmSaveButton.addEventListener("click", confirmSave);
loadButton.addEventListener("click", openLoadDialog);
nameInput.addEventListener("input", onNameInputChange);
redColorButton.addEventListener("click", changeActiveColor);
redoButton.addEventListener("click", redo);
saveButton.addEventListener("click", openSaveDialog);
tanColorButton.addEventListener("click", changeActiveColor);
undoButton.addEventListener("click", undo);
window.addEventListener("keydown", handleKeyDownEvents);
window.addEventListener("keyup", handleKeyUpEvents);

// saveButton.setAttribute("disabled", true);
// undoButton.setAttribute("disabled", true);
// redoButton.setAttribute("disabled", true);
// clearButton.setAttribute("disabled", true);

drawPaper();

function replacer(_key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

function reviver(_key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

function onNameInputChange() {
    nameValue = this.value;
}

function openSaveDialog() {
    saveConfirmationDialog.showModal();
}

function openLoadDialog() {
    graphSelect.replaceChildren([]);
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.innerText = "--Please choose an option--";
    graphSelect.appendChild(placeholderOption);
    for (let i = 0; i < localStorage.length; i++) {
        console.debug(localStorage.key(i));
        const option = document.createElement("option");
        option.setAttribute("value", localStorage.key(i));
        option.innerText = localStorage.key(i);
        graphSelect.appendChild(option);
    }
    loadConfirmationDialog.showModal();
}

function cancelLoad() {
    graphSelect.value = "";
    loadConfirmationDialog.close();
}

function confirmLoad() {
    const loadedGraph = JSON.parse(localStorage.getItem(graphSelect.value), reviver);
    paperHistory.clear();
    paperMarker = -1;
    for (const [index, square] of squares) {
        if (loadedGraph.has(index)) {
            square.style.backgroundColor = loadedGraph.get(index)
        } else {
            square.style.backgroundColor = WHITE
        }
    }
    paintedSquaresMap = new Map(loadedGraph);
    graphSelect.value = "";
    loadConfirmationDialog.close();
}

function cancelSave() {
    if (nameValue) {
        nameInput.value = "";
        nameValue = "";
    }
    saveConfirmationDialog.close();
}

function confirmSave() {
    const stringifiedMap = JSON.stringify(paintedSquaresMap, replacer);
    localStorage.setItem(nameValue, stringifiedMap);
    nameInput.value = "";
    nameValue = "";
    saveConfirmationDialog.close();
}

function undo() {
    if (paperMarker > -1) {
        --paperMarker;
        if (!paperHistory.get(paperMarker)) {
            return;
        }
        const slice = paperHistory.get(paperMarker);
        for (const [index, square] of squares) {
            if (slice.has(index)) {
                square.style.backgroundColor = slice.get(index)
            } else {
                square.style.backgroundColor = WHITE
            }
        }
    }
}

function redo() {
    if (paperMarker < paperHistory.size - 1) {
        ++paperMarker;
        if (!paperHistory.get(paperMarker)) {
            return;
        }
        const slice = paperHistory.get(paperMarker);
        for (const [index, square] of squares) {
            if (slice.has(index)) {
                square.style.backgroundColor = slice.get(index)
            } else {
                square.style.backgroundColor = WHITE
            }
        }
    }
}

function changeActiveColor() {
    switch (this.id) {
        case "blue-color-button":
            selectedColor = BLUE;
            blueColorButton.classList.add("active")
            brownColorButton.classList.remove("active")
            redColorButton.classList.remove("active")
            tanColorButton.classList.remove("active")
            break;
        case "brown-color-button":
            selectedColor = BROWN;
            blueColorButton.classList.remove("active")
            brownColorButton.classList.add("active")
            redColorButton.classList.remove("active")
            tanColorButton.classList.remove("active")
            break;
        case "red-color-button":
            selectedColor = RED;
            blueColorButton.classList.remove("active")
            brownColorButton.classList.remove("active")
            redColorButton.classList.add("active")
            tanColorButton.classList.remove("active")
            break;
        case "tan-color-button":
            selectedColor = TAN;
            blueColorButton.classList.remove("active")
            brownColorButton.classList.remove("active")
            redColorButton.classList.remove("active")
            tanColorButton.classList.add("active")
            break;
        default:
            break;
    }
}

function clearActiveCell() {
    if (Number.isInteger(selectedSquare)) {
        squares.get(selectedSquare).classList.remove("active");
        selectedSquare = undefined;
    }
}

function clearCell() {
    const cellIndex = +this.dataset.cell;
    if (paintedSquaresMap.has(cellIndex)) {
        this.style.backgroundColor = WHITE;
        paintedSquaresMap.delete(cellIndex);
        ++paperMarker
        paperHistory.set(paperMarker, new Map(paintedSquaresMap));
    }
}

function clearPaper() {
    for (const [square, _color] of paintedSquaresMap) {
        squares.get(square).style.backgroundColor = WHITE;
    }
    paintedSquaresMap.clear();
    ++paperMarker
    paperHistory.set(paperMarker, new Map(paintedSquaresMap));
}

function colorCell() {
    if (!this.dataset || !this.dataset.cell || !selectedColor) {
        return;
    }
    if (this.style.backgroundColor === selectedColor) {
        return;
    }

    this.style.backgroundColor = selectedColor;
    paintedSquaresMap.set(+this.dataset.cell, selectedColor);
    ++paperMarker
    paperHistory.set(paperMarker, new Map(paintedSquaresMap));
}

function drawPaper() {
    for (let i = 0; i < 16 * 16; i++) {
        const div = document.createElement("div");
        div.style.backgroundColor = WHITE;
        div.setAttribute("data-cell", i);
        div.addEventListener("click", colorCell);
        div.addEventListener("click", highlightCell);
        div.addEventListener("pointerenter", function (e) {
            if (isPointerClicked || isShiftKeyPressed) {
                highlightCell.call(this);
            }
            if (isControlKeyPressed) {
                clearCell.call(this);
            }
        });
        squares.set(i, div);
        paperElement.appendChild(div);
    }
}

function handleKeyDownEvents(event) {
    if (NUMBER_KEYS.includes(event.key)) {
        handleNumberKeyDownEvent(event.key);
    }

    if (ARROW_KEYS.includes(event.key)) {
        handleArrowKeyDownEvent(event.key);
    }

    if (MODIFIER_KEYS.includes(event.key)) {
        handleModifierKeyDownEvent(event.key);
    }
}

function handleKeyUpEvents(event) {
    switch (event.key) {
        case "Control":
            isControlKeyPressed = false;
            break;
        case "Shift":
            isShiftKeyPressed = false;
            break;
        default:
            break;
    }
}

function handleNumberKeyDownEvent(key) {
    switch (key) {
        case "0":
            clearPaper();
            break;
        case "1":
            changeActiveColor.call(brownColorButton)
            break;
        case "2":
            changeActiveColor.call(redColorButton)
            break;
        case "3":
            changeActiveColor.call(tanColorButton)
            break;
        case "4":
            changeActiveColor.call(blueColorButton)
        default:
            break;
    }
}

function handleArrowKeyDownEvent(key) {
    if (!Number.isInteger(selectedSquare)) {
        return;
    }

    switch (key) {
        case "ArrowDown":
            if (selectedSquare < (squares.size - 16)) {
                highlightCell.call(squares.get(selectedSquare + 16));
            }
            else if (selectedSquare === squares.size - 1) {
                highlightCell.call(squares.get(0));
            }
            else {
                highlightCell.call(squares.get(selectedSquare - 239));
            }
            break;
        case "ArrowLeft":
            if (selectedSquare > 0) {
                highlightCell.call(squares.get(selectedSquare - 1));
            }
            else {
                highlightCell.call(squares.get(squares.size - 1));
            }
            break;
        case "ArrowRight":
            if (selectedSquare < (squares.size - 1)) {
                highlightCell.call(squares.get(selectedSquare + 1));
            }
            else {
                highlightCell.call(squares.get(0));
            }
            break;
        case "ArrowUp":
            if (selectedSquare > 15) {
                highlightCell.call(squares.get(selectedSquare - 16));
            }
            else if (selectedSquare === 0) {
                highlightCell.call(squares.get(squares.size - 1));
            }
            else {
                highlightCell.call(squares.get(selectedSquare + 239));
            }
            break;
        default:
            break;
    }
}

function handleModifierKeyDownEvent(key) {
    switch (key) {
        case "Control":
            if (!isControlKeyPressed) {
                isControlKeyPressed = true;
            }
            if (Number.isInteger(selectedSquare)) {
                clearCell.call(squares.get(selectedSquare));
            }
            break;
        case "Escape":
            if (Number.isInteger(selectedSquare)) {
                clearActiveCell.call(squares.get(selectedSquare))
            }
            break;
        case "Shift":
            if (!isShiftKeyPressed) {
                isShiftKeyPressed = true;
            }
            if (Number.isInteger(selectedSquare)) {
                colorCell.call(squares.get(selectedSquare));
            }
            break;
        default:
            break;
    }
}

function highlightCell() {
    if (!this.dataset || !this.dataset.cell) {
        return;
    }
    if (Number.isInteger(selectedSquare)) {
        squares.get(selectedSquare).classList.remove("active")
    }
    squares.get(+this.dataset.cell).classList.add("active");
    selectedSquare = +this.dataset.cell;
    if (isControlKeyPressed) {
        clearCell.call(squares.get(+this.dataset.cell))
    }
    if (isPointerClicked || isShiftKeyPressed) {
        colorCell.call(squares.get(+this.dataset.cell))
    }
}
