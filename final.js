const c = document.getElementById("scrambler");
const ctx = c.getContext("2d");
let squareXNum = 8;
let squareYNum = 9;
//c.width = 96 * squareXNum;
//c.height = 128 * squareYNum;
let width = c.width;
let height = c.height;

var rightSmall = 0;
var bottomSmall = 0;

let grid = false;

let squares = [];

let img = document.createElement("img");
// img.src = "./003.png";//scram.png"

console.log("hi");
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
    setFiles(e.dataTransfer.files);
    return false;
}

el.addEventListener("dragenter", onDragEnter, false);  /// Code starts here
el.addEventListener("dragover", onDragOver, false);
el.addEventListener("dragleave", onDragLeave, false);
el.addEventListener("drop", onDrop, false);  //Drag and Drop

function setFiles(files) {   //Image loading on page   
    console.log(files[0]);
    img.src = files[0].name;
    img.onload = function() {
        c.width = img.width;
        c.height = img.height;
        width = c.width;
        height = c.height;

        squareXNum = Math.ceil(width / 96);
        squareYNum = Math.ceil(height / 128);
        
        splitSquares();
    };
    //c.width += ;
    //c.height += ;

    //splitSquares();
}


//***************************************************************************** */

function splitSquares() {
    squares = [];
    for (let x = 0; x < squareXNum; x++) {
        let column = [];
        for (let y = 0; y < squareYNum; y++) {
            column.push(new Square(x, y));
        }
        squares.push(column);
    }
    if(width%96!=0){
        rightSmall=1;
    }
    if(height%128!=0){
        bottomSmall=1;
    }
}

function toggleGrid(){
    grid = !grid; // Move this line outside the if block
    if (grid) {
        for (let x = 0; x < squareXNum; x++) {
            for (let y = 0; y < squareYNum; y++) {
                ctx.strokeStyle = "#a4ffff";
                ctx.strokeRect(x * 96, y * 128, 96, 128);
            }
        }
    }
}

function draw() {
    ctx.globalAlpha = 1;
    //console.log(img);
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
            squares[x][y].draw(x, y);
        }
    }

    if (grid) {
        for (let x = 0; x < squareXNum; x++) {
            for (let y = 0; y < squareYNum; y++) {
                ctx.strokeStyle = "#a4ffff";
                ctx.strokeRect(x * 96, y * 128, 96, 128);
            }
        }
    }
    

    if (selected != null) {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(selected.x * 96, selected.y * 128, 96, 128);
    }
}

//96 px x 128 px
//8 x 9

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
    const x2 = Math.floor(x / 96);
    const y2 = Math.floor(y / 128);

    if (x2 < 0 || x2 >= squareXNum || y2 < 0 || y2 > (squareYNum - 1)) {
        console.log("no square");
        selected = null;
        return null;
    }

    console.log(x2 + " " + y2);
    return { x: x2, y: y2 };
}

let selected = null;

function swapSquares(x1, y1, x2, y2) {
    console.log(
        "attempt swap x1: " + x1 + " y1: " + y1 + " x2: " + x2 + " y2: " + y2
    );
    let temp = new Square(0, 0);
    temp.dx = squares[x1][y1].dx;
    temp.dy = squares[x1][y1].dy;
    console.log(temp);
    squares[x1][y1] = squares[x2][y2];
    squares[x2][y2] = temp;
}
let sq;
function handleClick(event) {
    console.log(event.which);
    const rect = c.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


     sq = determineSquare(x, y);

    if (sq != null) {
        if (selected != null) {
            //swap them

            swapSquares(selected.x, selected.y, sq.x, sq.y);

            selected = null;
        } else {
            console.log("new selected");
            selected = { x: sq.x, y: sq.y };
        }
    }

    //determineSquare(x, y);
}

function handleKeyDown(event) {
    console.log(event.key);
    if (event.key === "g") {
        grid = !grid;

    }else if(event.key=="ArrowUp" && selected!=null){
        if(selected.y == 0){
            swapSquares(selected.x, selected.y, selected.x, selected.y+squares[0].length-1-bottomSmall);
            selected.y = selected.y + squares[0].length-1-bottomSmall
        }else{
            swapSquares(selected.x, selected.y, selected.x, selected.y-1);
            selected.y = selected.y - 1
        }

    }else if(event.key=="ArrowDown" && selected!=null){
        if(selected.y == squares[0].length-1-bottomSmall){
            swapSquares(selected.x, selected.y, selected.x, 0);
            selected.y = 0
        }else{
            swapSquares(selected.x, selected.y, selected.x, selected.y+1);
            selected.y = selected.y + 1
        }
    }else if(event.key=="ArrowLeft" && selected!=null){
        if(selected.x == 0){
            swapSquares(selected.x, selected.y, selected.x+squares.length-1-rightSmall, selected.y);
            selected.x = selected.x + squares.length-1-rightSmall;
        }else{
            swapSquares(selected.x, selected.y, selected.x-1, selected.y);
            selected.x = selected.x - 1
        }
    }else if(event.key=="ArrowRight" && selected!=null){
        if(selected.x == squares.length-1-rightSmall){
            swapSquares(selected.x, selected.y, 0, selected.y);
            selected.x = 0
        }else{
            swapSquares(selected.x, selected.y, selected.x+1, selected.y);
            selected.x = selected.x + 1
        }
    }else if(event.key=="i" && selected!=null){
        if(selected.y == 0){
            selected.y = selected.y + squares[0].length-1-bottomSmall;
        }else{
            selected.y = selected.y - 1
        }

    }else if(event.key=="k" && selected!=null){
        if(selected.y == squares[0].length-1-bottomSmall){
            selected.y = 0
        }else{
            selected.y = selected.y + 1
        }
    }else if(event.key=="j" && selected!=null){
        if(selected.x == 0){
            selected.x = selected.x + squares.length-1-rightSmall
        }else{
            selected.x = selected.x - 1
        }
    }else if(event.key=="l" && selected!=null){
        if(selected.x == squares.length-1-rightSmall){
            selected.x = 0
        }else{
            selected.x = selected.x + 1
        }
    }else if(event.key=="Escape"){
        selected = null;
    }
}

document.addEventListener("click", handleClick);

document.addEventListener("keydown", handleKeyDown);

//||selected.y==squares[0].length-1

//let loop = window.setTimeout(draw, 100)
window.setInterval(draw, 25);

document.getElementById("download").addEventListener("click", function (e) {
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

