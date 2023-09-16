// Classes

class Pipe{
    constructor(gap, width){
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height-gap);
        this.gap = gap;
        this.width = width;
    }
    draw(){
        ctx.fillStyle = colors[1];
        ctx.fillRect(this.x, this.y - canvas.height, this.width, canvas.height);
        ctx.fillRect(this.x, this.y + this.gap, this.width, canvas.height);
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
            ctx.arc(this.x+playerWidth/2, this.y+playerWidth/2, this.playerWidth / 2, 0, Math.PI * 2);
            ctx.fill();
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
    "#ffb3b3",
    "#5f131b",
    "#7e2a2f",
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

let ga = new GeneticAlgorithm(100, 3, 10, 1, .1, Bird, playerPosX, playerWidth);
let failedIndividuals = 0;
let generation = 0;
let record = 0;

let fps = 120;

requestAnimationFrame(draw);
function draw() {
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
    if(!gamePlaying) return;
    if(failedIndividuals >= ga.populationSize){
        if(score > record) record = score;
        resetGame();
        setTimeout(() => {
            gamePlaying = true;
            failedIndividuals = 0;
            requestAnimationFrame(draw);
        }, 1000);
    }
    requestAnimationFrame(draw);
}

function resetGame(){
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


// Event listeners

document.addEventListener('keydown', (e) => {
    /*if(e.code === 'Space'){
        b.doJump();
    }*/
    if(e.code === 'Enter'){
        if(!gamePlaying) {
            gamePlaying = true;
            requestAnimationFrame(draw);
        }
    }
    if(e.code === 'KeyR'){
        resetGame();
    }
});

window.addEventListener('resize', () => {
    location.reload();
});

let canvasWidth = window.innerWidth - 72 >= 400 ? 400 : window.innerWidth - 72;
document.getElementsByTagName("canvas")[0].width = canvasWidth;