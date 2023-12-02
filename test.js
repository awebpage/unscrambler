const c = document.getElementById("scrambler");
const ctx = c.getContext("2d");
let squareXNum = 0;
let squareYNum = 0;
let width = c.width;
let height = c.height;
var ctrlisPressed = false;
var swapClick = false;
var multiSwapClick = false;
var multiSelect = false;
var multiIdx = 0;
var rightSmall = 0;
var bottomSmall = 0;
var gridColor = "#5ff5f5";

let grid = false;

let squares = [];

let img = document.createElement("img");

let el = document.querySelector("#scrambler");

function onDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function onDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
}

function onDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
}

function onDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    undoStack = [];
    redoStack = [];
    setFiles(e.dataTransfer.files);
    return false;
}

el.addEventListener("dragenter", onDragEnter, false); // Code starts here
el.addEventListener("dragover", onDragOver, false);
el.addEventListener("dragleave", onDragLeave, false);
el.addEventListener("drop", onDrop, false); // Triggers if you Drag and Drop
var imageName;
function setFiles(files) {
    //Image loading on page
    img.src = files[0].name;
    imageName = files[0].name;
    img.onload = function () {
        c.width = img.width;
        c.height = img.height;
        width = c.width;
        height = c.height;

        squareXNum = Math.ceil(width / 96);
        squareYNum = Math.ceil(height / 128);

        splitSquares();
    };
}

//*************************** */

function splitSquares() {
    squares = [];
    for (let x = 0; x < squareXNum; x++) {
        let column = [];
        for (let y = 0; y < squareYNum; y++) {
            column.push(new Square(x, y));
        }
        squares.push(column);
    }
    if (width % 96 != 0) {
        rightSmall = 1;
    }
    if (height % 128 != 0) {
        bottomSmall = 1;
    }
}

function toggleGrid() {
    grid = !grid; // Move this line outside the if block
}

function loadProgress() {
    var progress = localStorage.getItem("progress" + imageName)
    var undoString = localStorage.getItem("undostack" + imageName)
    var redoString = localStorage.getItem("redostack" + imageName)
    if (progress != null) {
        var Okay = JSON.parse(progress)
        for (let i = 0; i < Okay.length; i++) {
            for (let j = 0; j < Okay[0].length; j++) {
                Okay[i][j] = new Square(Okay[i][j].dx / 96, Okay[i][j].dy / 128)
            }
        }
        // swapSquares
        squares = Okay

        if (undoString) {
            undoStack = JSON.parse(undoString)
        }
        if (redoString) {
            redoStack = JSON.parse(redoString)
        }
    }
}

function clearProgress() {
    localStorage.removeItem("progress" + imageName)
    localStorage.removeItem("undostack" + imageName)
    localStorage.removeItem("redostack" + imageName)
}

function draw() {
    //Renders the image and the selection box every 25 miliseconds
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    ctx.fillRect(0, 0, 96 * squareXNum, 128 * squareYNum);

    if (squares.length < 1) {
        return;
    }

    for (let x = 0; x < squareXNum; x++) {
        for (let y = 0; y < squareYNum; y++) {
            if (squares != null) {
                squares[x][y].draw(x, y);
            } else {
                setTimeout(draw, 1000)
            }
        }
    }

    if (grid) {
        for (let x = 0; x < squareXNum; x++) {
            for (let y = 0; y < squareYNum; y++) {
                ctx.strokeStyle = gridColor;
                ctx.strokeRect(x * 96, y * 128, 96, 128);
            }
        }
    }

    if (selected != null) {
        ctx.globalAlpha = 0.6;
        if (ctrlisPressed) {
            ctx.fillStyle = "#f5455c";
        } else if (swapClick) {
            ctx.fillStyle = "#32cd32";
        } else {
            ctx.fillStyle = "#1d74f5";
        }
        ctx.fillRect(selected.x * 96, selected.y * 128, 96, 128);
    }

    if (multiSelect) {
        if (selection1 && !selection2) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = "#ffa500";
            ctx.fillRect(selection1.x * 96, selection1.y * 128, 96, 128);
        } else if (selection1 && selection2) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = "#ffa500";
            if (selection1.x <= selection2.x && selection1.y <= selection2.y) {
                //Top and left
                ctx.fillRect(selection1.x * 96, selection1.y * 128, (selection2.x - selection1.x + 1) * 96, (selection2.y - selection1.y + 1) * 128);
                multiSelection = { originx: selection1.x, originy: selection1.y, width: selection2.x - selection1.x + 1, height: selection2.y - selection1.y + 1 };
            } else if (selection1.x <= selection2.x && selection1.y >= selection2.y) {
                //Bottom and left
                ctx.fillRect(selection1.x * 96, selection2.y * 128, (selection2.x - selection1.x + 1) * 96, (selection1.y - selection2.y + 1) * 128);
                multiSelection = { originx: selection1.x, originy: selection2.y, width: selection2.x - selection1.x + 1, height: selection1.y - selection2.y + 1 };
            } else if (selection1.x >= selection2.x && selection1.y <= selection2.y) {
                //Top and right
                ctx.fillRect(selection2.x * 96, selection1.y * 128, (selection1.x - selection2.x + 1) * 96, (selection2.y - selection1.y + 1) * 128);
                multiSelection = { originx: selection2.x, originy: selection1.y, width: selection1.x - selection2.x + 1, height: selection2.y - selection1.y + 1 };
            } else if (selection1.x >= selection2.x && selection1.y >= selection2.y) {
                //Bottom and right
                ctx.fillRect(selection2.x * 96, selection2.y * 128, (selection1.x - selection2.x + 1) * 96, (selection1.y - selection2.y + 1) * 128);
                multiSelection = { originx: selection2.x, originy: selection2.y, width: selection1.x - selection2.x + 1, height: selection1.y - selection2.y + 1 };
            }
        }

        if (selection1 && selection2 && multiSwapClick) {
            if (!multiSelectionMove) {
                multiSelectionMove = multiSelection;
            }
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = "#32cd32";
            ctx.fillRect(multiSelectionMove.originx * 96, multiSelectionMove.originy * 128, multiSelectionMove.width * 96, multiSelectionMove.height * 128);
        }
    }
}
var multiSelection;
var multiSelectionMove;
class Square {
    constructor(x, y) {
        this.dx = x * 96;
        this.dy = y * 128;
    }

    draw(x, y) {
        ctx.drawImage(img, this.dx, this.dy, 96, 128, x * 96, y * 128, 96, 128);
    }
}

function determineSquare(x, y) {
    //Checks if the area clicked is a block or not
    const x2 = Math.floor(x / 96);
    const y2 = Math.floor(y / 128);

    if (x2 < 0 || x2 >= squareXNum || y2 < 0 || y2 > squareYNum - 1) {
        selected = null;
        return null;
    }

    return { x: x2, y: y2 };
}

let selected = null;

function swapSquares(x1, y1, x2, y2) {
    //Swaps the selected blocks
    let temp = new Square(0, 0);
    temp.dx = squares[x1][y1].dx;
    temp.dy = squares[x1][y1].dy;
    squares[x1][y1] = squares[x2][y2];
    squares[x2][y2] = temp;
    if (multiSelect) {
        var multiIdxTemp = multiIdx;
    } else {
        var multiIdxTemp = -1;
    }
    undoStack.push({ sx: x1, sy: y1, ssx: x2, ssy: y2, multi: multiSelect, multiIdx: multiIdxTemp });
    redoStack = [];
    localStorage.setItem("redostack" + imageName, JSON.stringify(redoStack))
    localStorage.setItem("undostack" + imageName, JSON.stringify(undoStack))
    localStorage.setItem("progress" + imageName, JSON.stringify(squares))
}

function redoSquares(x1, y1, x2, y2, m1, m2) {
    //Swaps the selected blocks
    let temp = new Square(0, 0);
    temp.dx = squares[x1][y1].dx;
    temp.dy = squares[x1][y1].dy;
    squares[x1][y1] = squares[x2][y2];
    squares[x2][y2] = temp;
    undoStack.push({ sx: x1, sy: y1, ssx: x2, ssy: y2, multi: m1, multiIdx: m2 });
    localStorage.setItem("undostack" + imageName, JSON.stringify(undoStack))
    localStorage.setItem("progress" + imageName, JSON.stringify(squares))
}

function undoSquares(x1, y1, x2, y2, m1, m2) {
    //Swaps the selected blocks
    let temp = new Square(0, 0);
    temp.dx = squares[x1][y1].dx;
    temp.dy = squares[x1][y1].dy;
    squares[x1][y1] = squares[x2][y2];
    squares[x2][y2] = temp;
    redoStack.push({ sx: x1, sy: y1, ssx: x2, ssy: y2, multi: m1, multiIdx: m2 });
    localStorage.setItem("redostack" + imageName, JSON.stringify(redoStack))
    localStorage.setItem("progress" + imageName, JSON.stringify(squares))
}

let sq;
function handleClick(event) {
    //Function checks if the clicked is a block and swaps if the clicked is not a new block
    const rect = c.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x > Math.floor(width / 96) * 96 || y > Math.floor(height / 128) * 128) {
        return;
    }

    sq = determineSquare(x, y);
    if (sq != null) {
        if (selected != null && (ctrlisPressed || swapClick)) {
            swapSquares(selected.x, selected.y, sq.x, sq.y);
            selected = null;
        } else if (selected != null && sq.x == selected.x && sq.y == selected.y) {
            selected = null;
        } else {
            selected = { x: sq.x, y: sq.y };
        }
    }
}
// selection vale m ek dikat h jese ki agr tune right v
var selectedPositionY = 0;

function handleKeyDown(event) {
    // Triggered if a key is pressed
    if (event.metaKey || event.ctrlKey) {
        ctrlisPressed = true;
    }

    if (event.key.includes("Arrow") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
    } else if (event.key.includes("Arrow")) {
        event.preventDefault();
    }

    if (event.key == "g" || event.key == "G") {
        grid = !grid;
    } else if (event.key == "m" || event.key == "M") {
        multiSelect = !multiSelect;
        if (multiSelect) {
            gridColor = "#ff0000";
            grid = true;
            selection1 = selected;
            selected = null;
            document.removeEventListener("click", handleClick);
            document.addEventListener("click", multiClick);
        } else {
            gridColor = "#5ff5f5";
            grid = false;
            if (selection1 && !selection2) {
                selected = selection1;
            }
            selection1 = null;
            selection2 = null;
            document.removeEventListener("click", multiClick);
            document.addEventListener("click", handleClick);
        }
    } else if ((event.key == "Z" || event.key == "z") && (event.metaKey || event.ctrlKey) && event.shiftKey) {
        redoWork();
    } else if ((event.key == "Z" || event.key == "z") && (event.metaKey || event.ctrlKey)) {
        undoWork();
    }

    if (!multiSelect) {
        if (event.key == "q" || event.key == "Q") {
            swapClick = !swapClick;
        }

        if (event.key == "ArrowUp" && (event.metaKey || event.ctrlKey) && selected != null) {
            if (selected.y == 0) {
                swapSquares(selected.x, selected.y, selected.x, selected.y + squares[0].length - 1 - bottomSmall);
                selected.y = selected.y + squares[0].length - 1 - bottomSmall;
            } else {
                swapSquares(selected.x, selected.y, selected.x, selected.y - 1);
                selected.y = selected.y - 1;
            }
        } else if (event.key == "ArrowDown" && (event.metaKey || event.ctrlKey) && selected != null) {
            if (selected.y == squares[0].length - 1 - bottomSmall) {
                swapSquares(selected.x, selected.y, selected.x, 0);
                selected.y = 0;
            } else {
                swapSquares(selected.x, selected.y, selected.x, selected.y + 1);
                selected.y = selected.y + 1;
            }
        } else if (event.key == "ArrowLeft" && (event.metaKey || event.ctrlKey) && selected != null) {
            if (selected.x == 0) {
                swapSquares(selected.x, selected.y, selected.x + squares.length - 1 - rightSmall, selected.y);
                selected.x = selected.x + squares.length - 1 - rightSmall;
            } else {
                swapSquares(selected.x, selected.y, selected.x - 1, selected.y);
                selected.x = selected.x - 1;
            }
        } else if (event.key == "ArrowRight" && (event.metaKey || event.ctrlKey) && selected != null) {
            if (selected.x == squares.length - 1 - rightSmall) {
                swapSquares(selected.x, selected.y, 0, selected.y);
                selected.x = 0;
            } else {
                swapSquares(selected.x, selected.y, selected.x + 1, selected.y);
                selected.x = selected.x + 1;
            }
        } else if (event.key == "ArrowUp" && selected != null) {
            if (selected.y == 0) {
                selected.y = selected.y + squares[0].length - 1 - bottomSmall;
            } else {
                selected.y = selected.y - 1;
            }
        } else if (event.key == "ArrowDown" && selected != null) {
            if (selected.y == squares[0].length - 1 - bottomSmall) {
                selected.y = 0;
            } else {
                selected.y = selected.y + 1;
            }
        } else if (event.key == "ArrowLeft" && selected != null) {
            if (selected.x == 0) {
                selected.x = selected.x + squares.length - 1 - rightSmall;
            } else {
                selected.x = selected.x - 1;
            }
        } else if (event.key == "ArrowRight" && selected != null) {
            if (selected.x == squares.length - 1 - rightSmall) {
                selected.x = 0;
            } else {
                selected.x = selected.x + 1;
            }
        } else if (event.key == "Escape") {
            selected = null;
        }
    } else {
        if (event.key == "q" || event.key == "Q") {
            multiSwapClick = !multiSwapClick;
            if (!multiSwapClick) {
                multiSelectionMove = null;
            }
        }

        if (event.key == "y" || event.key == "Y") {
            if (multiSwapClick && multiSelectionMove) {
                if (multiSelctionIntersect()) {
                    return;
                }

                for (let y = 0; y < multiSelection.height; y++) {
                    for (let x = 0; x < multiSelection.width; x++) {
                        swapSquares(multiSelection.originx + x, multiSelection.originy + y, multiSelectionMove.originx + x, multiSelectionMove.originy + y);
                    }
                }
                multiSwapClick = !multiSwapClick;
                selection1 = { x: multiSelectionMove.originx, y: multiSelectionMove.originy };
                selection2 = { x: multiSelectionMove.originx + multiSelectionMove.width - 1, y: multiSelectionMove.originy + multiSelectionMove.height - 1 };
            }
        }

        if (event.key == "ArrowUp" && selection1 && selection2) {
            if (!multiSwapClick) {
                if (multiSelection.originy != 0) {
                    for (let i = 0; i < multiSelection.width; i++) {
                        selected = { x: multiSelection.originx + i, y: multiSelection.originy - 1 };
                        for (let j = 0; j < multiSelection.height; j++) {
                            if (selected.y == squares[0].length - 1 - bottomSmall) {
                                swapSquares(selected.x, selected.y, selected.x, 0);
                                selected.y = 0;
                            } else {
                                swapSquares(selected.x, selected.y, selected.x, selected.y + 1);
                                selected.y = selected.y + 1;
                            }
                        }
                    }
                    selection1.y -= 1;
                    selection2.y -= 1;
                    selected = null;
                    multiIdx++;
                }
            } else {
                if (multiSelectionMove.originy != 0) {
                    multiSelectionMove.originy -= 1;
                }
            }
        } else if (event.key == "ArrowDown" && selection1 && selection2) {
            if (!multiSwapClick) {
                if (multiSelection.originy != squares[0].length - multiSelection.height - bottomSmall) {
                    for (let i = 0; i < multiSelection.width; i++) {
                        selected = { x: multiSelection.originx + i, y: multiSelection.originy + multiSelection.height };
                        for (let j = 0; j < multiSelection.height; j++) {
                            if (selected.y == 0) {
                                swapSquares(selected.x, selected.y, selected.x, selected.y + squares[0].length - 1 - bottomSmall);
                                selected.y = selected.y + squares[0].length - 1 - bottomSmall;
                            } else {
                                swapSquares(selected.x, selected.y, selected.x, selected.y - 1);
                                selected.y = selected.y - 1;
                            }
                        }
                    }
                    selection1.y += 1;
                    selection2.y += 1;
                    selected = null;
                    multiIdx++;
                }
            } else {
                if (multiSelectionMove.originy != squares[0].length - multiSelectionMove.height - bottomSmall) {
                    multiSelectionMove.originy += 1;
                }
            }
        } else if (event.key == "ArrowLeft" && selection1 && selection2) {
            if (!multiSwapClick) {
                if (multiSelection.originx != 0) {
                    for (let i = 0; i < multiSelection.height; i++) {
                        selected = { x: multiSelection.originx - 1, y: multiSelection.originy + i };
                        for (let j = 0; j < multiSelection.width; j++) {
                            if (selected.x == squares.length - 1 - rightSmall) {
                                swapSquares(selected.x, selected.y, 0, selected.y);
                                selected.x = 0;
                            } else {
                                swapSquares(selected.x, selected.y, selected.x + 1, selected.y);
                                selected.x = selected.x + 1;
                            }
                        }
                    }
                    selection1.x -= 1;
                    selection2.x -= 1;
                    selected = null;
                    multiIdx++;
                }
            } else {
                if (multiSelectionMove.originx != 0) {
                    multiSelectionMove.originx -= 1;
                }
            }
        } else if (event.key == "ArrowRight" && selection1 && selection2) {
            if (!multiSwapClick) {
                if (multiSelection.originx != squares.length - multiSelection.width - rightSmall) {
                    for (let i = 0; i < multiSelection.height; i++) {
                        selected = { x: multiSelection.originx + multiSelection.width, y: multiSelection.originy + i };
                        for (let j = 0; j < multiSelection.width; j++) {
                            if (selected.x == 0) {
                                swapSquares(selected.x, selected.y, selected.x + squares.length - 1 - rightSmall, selected.y);
                                selected.x = selected.x + squares.length - 1 - rightSmall;
                            } else {
                                swapSquares(selected.x, selected.y, selected.x - 1, selected.y);
                                selected.x = selected.x - 1;
                            }
                        }
                    }
                    selection1.x += 1;
                    selection2.x += 1;
                    selected = null;
                    multiIdx++;
                }
            } else {
                if (multiSelectionMove.originx != squares.length - multiSelectionMove.width - rightSmall) {
                    multiSelectionMove.originx += 1;
                }
            }
        } else if (event.key == "Escape") {
            selection1 = null;
            selection2 = null;
            grid = true;
        }
    }
    if (multiSelectionMove && multiSwapClick) {
        selectedPositionY = multiSelectionMove.originy * 128;
        var multiBottomPositionY = (multiSelectionMove.originy + multiSelectionMove.height) * 128;
        if (multiBottomPositionY > window.scrollY + window.innerHeight - 100) {
            document.documentElement.scrollTop = multiBottomPositionY - window.innerHeight + 100;
        }
        if (selectedPositionY < window.scrollY + 100) {
            document.documentElement.scrollTop = selectedPositionY;
        }

        // var bottomPosition = (window.scrollY || document.documentElement.scrollTop) + window.innerHeight || document.documentElement.clientHeight;

        // if (multiSelection.originy * 128 + multiSelection.height > window.innerHeight && multiSelection.originy * 128 + multiSelection.height >= bottomPosition) {
        //     document.documentElement.scrollTop = multiSelectionMove.originy * 128 + 256 - window.innerHeight;
        // }
    } else if (multiSelection && multiSelect) {
        selectedPositionY = multiSelection.originy * 128;
        var multiBottomPositionY = (multiSelection.originy + multiSelection.height) * 128;
        if (multiBottomPositionY > window.scrollY + window.innerHeight - 100) {
            document.documentElement.scrollTop = multiBottomPositionY - window.innerHeight;
        }
        if (selectedPositionY < window.scrollY + 100) {
            document.documentElement.scrollTop = selectedPositionY;
        }

        // var bottomPosition = (window.scrollY || document.documentElement.scrollTop) + window.innerHeight || document.documentElement.clientHeight;

        // if (multiSelection.originy * 128 + 128 > window.innerHeight && selected.y * 128 + 128 >= bottomPosition) {
        //     document.documentElement.scrollTop = multiSelection.originy * 128 + 256 - window.innerHeight;
        // }
    } else if (selected) {
        selectedPositionY = selected.y * 128;
        if (selectedPositionY > window.scrollY + window.innerHeight - 50) {
            document.documentElement.scrollTop = selectedPositionY - screen.height + 400;
        }
        if (selectedPositionY < window.scrollY + 100) {
            document.documentElement.scrollTop = selectedPositionY;
        }

        var bottomPosition = (window.scrollY || document.documentElement.scrollTop) + window.innerHeight || document.documentElement.clientHeight;

        if (selected.y * 128 + 128 > window.innerHeight && selected.y * 128 + 128 >= bottomPosition) {
            document.documentElement.scrollTop = selected.y * 128 + 256 - window.innerHeight;
        }
    }
}


var undoStack = [];
var redoStack = [];

function undoWork() {
    if (undoStack.length == 0) {
        return;
    } else {
        var task = undoStack.pop();
        if (task.multi) {
            let temp = task.multiIdx;
            while (task && task.multi && task.multiIdx == temp) {
                undoSquares(task.sx, task.sy, task.ssx, task.ssy, task.multi, task.multiIdx);
                task = undoStack.pop();
            }
            if (task) {
                undoStack.push(task);
            }
            if (multiSelect) {
                selection1 = null;
                selection2 = null;
                grid = true;
                multiSelectionMove = null;
            }
        } else {
            undoSquares(task.sx, task.sy, task.ssx, task.ssy, task.multi, task.multiIdx);
        }
        localStorage.setItem("undostack" + imageName, JSON.stringify(undoStack))
    }
}

function redoWork() {
    if (redoStack.length == 0) {
        return;
    } else {
        var task = redoStack.pop();
        if (task.multi) {
            let temp = task.multiIdx;
            while (task && task.multi && task.multiIdx == temp) {
                redoSquares(task.sx, task.sy, task.ssx, task.ssy, task.multi, task.multiIdx);
                task = redoStack.pop();
            }
            if (task) {
                redoStack.push(task);
            }
            if (multiSelect) {
                selection1 = null;
                selection2 = null;
                grid = true;
                multiSelectionMove = null;
            }
        } else {
            redoSquares(task.sx, task.sy, task.ssx, task.ssy, task.multi, task.multiIdx);
        }
        localStorage.setItem("redostack" + imageName, JSON.stringify(redoStack))
    }
}

function multiSelctionIntersect() {
    let temp = [[], []];
    for (let y = 0; y < multiSelection.height; y++) {
        for (let x = 0; x < multiSelection.width; x++) {
            temp[0].push({ x: multiSelection.originx + x, y: multiSelection.originy + y });
            temp[1].push({ x: multiSelectionMove.originx + x, y: multiSelectionMove.originy + y });
        }
    }
    const set1 = new Set(temp[0].map(JSON.stringify));
    const set2 = new Set(temp[1].map(JSON.stringify));

    for (const element of set1) {
        if (set2.has(element)) {
            return true;
        }
    }

    return false;
}

document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function handleKeyUp(event) {
    if (event.key === "Control" || event.key === "Meta") {
        ctrlisPressed = false;
        draw();
    }
}

//let loop = window.setTimeout(draw, 100)
window.setInterval(draw, 25);

document.getElementById("download").addEventListener("click", function (e) {
    //Download functionality
    // Convert our canvas to a data URL
    let canvasUrl = c.toDataURL();
    // Create an anchor, and set the href value to our data URL
    const createEl = document.createElement("a");
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "download";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();
});

var selection1;
var selection2;
function multiClick(event) {
    const rect = c.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x > Math.floor(width / 96) * 96 || y > Math.floor(height / 128) * 128) {
        return;
    }

    sq = determineSquare(x, y);

    if (sq != null) {
        if (!selection1) {
            selection1 = sq;
        } else if (!selection2 && !(sq.x == selection1.x && sq.y == selection1.y)) {
            selection2 = sq;
            grid = false;
        } else {
            selection1 = sq;
            selection2 = null;
            grid = true;
            multiSelectionMove = null;
        }
    }
}
