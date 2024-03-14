// Classes

class Pipe{
    constructor(gap, width){
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height-gap);
        this.gap = gap;
        this.width = width;
    }
    draw(){
        ctx.fillStyle = colors[3];
        ctx.fillRect(this.x, this.y - canvas.height, this.width, canvas.height);
        ctx.fillRect(this.x, this.y + this.gap, this.width, canvas.height);
        ctx.fillStyle = colors[1];
        ctx.fillRect(this.x+4, this.y - canvas.height-4, this.width-8, canvas.height);
        ctx.fillRect(this.x+4, this.y + this.gap+4, this.width-8, canvas.height);
        this.x -= speed;
    }
    draw2(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, canvas.height-5, 5,5);
    }
}


class Bird {
    constructor(individual, playerPosX, playerWidth){
        this.individual = individual;
        this.x = playerPosX;
        this.y = 200;
        this.playerWidth = playerWidth;
        this.jump = false;
        this.failed = false;
        this.jumpTickCounter = 0;
    }
    draw(){
        //draw circle
        if(!this.failed) {
            ctx.fillStyle = colors[2];
            ctx.beginPath();
            ctx.strokeStyle = colors[3];
            ctx.lineWidth = 3;
            ctx.arc(this.x+playerWidth/2, this.y+playerWidth/2, this.playerWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            //this.y += this.jump ? -5 : gravity;
            if(this.individual.nn.ff([nextPipePosition - playerPosX - playerWidth, this.y - pipes[activePipe].y, this.y - pipes[activePipe].y + pipesGap])[0] > .5) this.doJump();
            this.jumpTickCounter++;
            if(this.jumpTickCounter >= 10){
                this.jump = false;
                this.jumpTickCounter = 0;
            }
            this.y += this.jump ? -2 * gravity : gravity
            this.checkCollision();
        }
    }
    checkCollision(){
        if(nextPipePosition <= this.x + this.playerWidth
            && ( pipes[activePipe].y >= this.y
                || pipes[activePipe].y + pipes[activePipe].gap <= this.y + this.playerWidth)
            || this.y + this.playerWidth >= canvas.height
            || this.y <= 0){
            this.failed = true;
            this.setFitness(score);
            failedIndividuals++;
        }
    }
    setFitness(fitnessValue){
        this.individual.setFitness(fitnessValue);
    }
    doJump(){
        /*if(!this.jump) {
            this.jump = true;
            setTimeout(() => {
                this.jump = false
            }, 200);
        }*/
        this.jump = true;
    }
    reset(){
        this.y = 200;
        this.failed = false;
    }
}

const colors = [
    "#71c5cf",
    "#9fe65c",
    "#ffc30e",
    "#211f08"
    ];



// Initialize the game

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let p = new Pipe(100);

let score = 0;

let gamePlaying = false;
let speed = 1;
let gravity = 2;
let pipeGap = 100;
let pipeWidth = 50;
let pipesGap = 200;
let pipes = [];
let playerPosX = 50;
let playerWidth = 20;

let nextPipePosition = canvas.width;
let lastPipePosition = 0;
let activePipe = 0;
let populationSize = 100;

let ga = new GeneticAlgorithm(populationSize, 3, 10, 1, .1, Bird, playerPosX, playerWidth);
let failedIndividuals = 0;
let generation = 0;
let record = 0;

let fps = 120;

requestAnimationFrame(runFrame);
let skip = false;
function runFrame(){
    let nextFrameTime = performance.now();
    while(performance.now() <= nextFrameTime + 1000 / 120 && skip){
        draw();
    }
    draw();
    if(!gamePlaying) return;
    if(failedIndividuals >= ga.populationSize){
        if(score > record) record = score;
        resetGame();
        setTimeout(() => {
            gamePlaying = true;
            failedIndividuals = 0;
            requestAnimationFrame(runFrame);
        }, 0);
    }else {
        //let b = new Date().getTime();
        //fpss.push(b-a);
        /*setTimeout(() => {
            requestAnimationFrame(runFrame);
        }, performance.now() + 1000 / 120 - nextFrameTime);*/
        requestAnimationFrame(runFrame);
    }
}
function draw() {
    //let a = new Date().getTime();
    nextPipePosition -= speed;
    lastPipePosition -= speed;
    score ++;
    if(nextPipePosition <= playerPosX - pipeWidth){
        nextPipePosition += pipesGap;
        activePipe++;
        score += 200;
    }
    if(lastPipePosition <= canvas.width - pipesGap){
        lastPipePosition = canvas.width
        pipes.push(new Pipe(pipeGap, pipeWidth));
    }

    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pipes.forEach(pipe => {pipe.draw()});

    /*ctx.fillStyle = 'red';
    ctx.fillRect(nextPipePosition, 0, 5, 5);
    ctx.fillRect(lastPipePosition, 5, 5, 5);*/
    ga.forEach(obj => {obj.draw()});
    //pipes[activePipe].draw2();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(score + " | " + generation + " | " + record, 10, 20);
    return;
}
let fpss = [];
function calcFPS(){
    let x = 0;
    for (let i = 0; i < 50; i++) {
        x += 1000/(fpss[i]+0.01);
    }
    return x/50;
}
let data = [];
function resetGame(){
    data.push(score);
    ga.evolve();
    generation++;
    score = 0;
    gamePlaying = false;
    nextPipePosition = canvas.width;
    lastPipePosition = 0;
    activePipe = 0;
    pipes = [];
    ga.forEach(obj => {obj.reset()});
}


function toggleStartButton() {
    if (gamePlaying) {
        document.querySelector('#start span').textContent = "pause";
    } else {
        document.querySelector('#start span').textContent = "play_arrow";
    }
}
function toggleSkipButton() {
    if (skip) {
        document.querySelector('#fast-forward span').textContent = "resume";
    } else {
        document.querySelector('#fast-forward span').textContent = "fast_forward";
    }
}

// Event listeners

/*document.addEventListener('keydown', (e) => {
    if(e.code === 'Space'){
        b.doJump();
    }
    if(e.code === 'Enter'){
        if(!gamePlaying) {
            gamePlaying = true;
            requestAnimationFrame(runFrame);
        }
    }
    if(e.code === 'KeyR'){
        resetGame();
    }
});*/

window.addEventListener('resize', () => {
    location.reload();
});

let canvasWidth = window.innerWidth - 72 >= 400 ? 400 : window.innerWidth - 72;
document.getElementsByTagName("canvas")[0].width = canvasWidth;

// PRESENTATION MODE
let presentationMode = false;
const query = window.location.search;
const queryParams = new URLSearchParams(query);

if(queryParams.get('qr') === 'true'){
    document.body.style.flexDirection = 'column-reverse';
    document.body.style.padding = '8px';
    document.getElementsByClassName('controls')[0].style.gridTemplateColumns = 'repeat(4, 40px)';
    document.getElementsByClassName('controls')[0].style.gridTemplateRows = '40px';
    document.getElementsByClassName('controls')[0].style.columnGap = '8px';
    document.getElementsByClassName('controls')[0].style.paddingLeft = '0';
}

if(queryParams.get('presentation') === 'true'){
    presentationMode = true;
    document.body.style.backgroundColor = 'black';
    let canvas = document.getElementsByTagName("canvas")[0];
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.border = 'none';
    canvas.style.borderRadius = '0';
    document.getElementsByClassName('controls')[0].style.display = 'none';
}
let pageDownCounter = 0;
document.addEventListener("keydown", function (e) {
    if(e.key === "PageDown" && presentationMode){
        switch (pageDownCounter) {
            case 0:
                gamePlaying = true;
                runFrame();
                break;
            case 1:
                skip = true;
                break;
            case 2:
                skip = false;
                break;
            case 3:
                gamePlaying = false;
        }
        pageDownCounter++;
    }
});