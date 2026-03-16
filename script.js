//game over
const gameover = document.getElementById('gameover');
const densitySlider = document.getElementById('densitySlider');
const sideSlider = document.getElementById('sideSlider');
const densityOutput = document.getElementById('densityOutput');
const sideOutput = document.getElementById('sideOutput');

//generate board dynamically
const board = document.getElementById('board');
let side = 13;
if(localStorage.getItem('side') !== null){
    side = Number(localStorage.getItem('side'));
    sideSlider.value = side;
    sideOutput.value = side;
}
board.innerHTML = "<div class='tile'></div>".repeat(side*side);
board.style.gridTemplateColumns = 'repeat('+side+', 1fr)';

//setup mine and sweeper
let density = 20;
if(localStorage.getItem('density') !== null){
    density = Number(localStorage.getItem('density'));
    densitySlider.value = density;
    densityOutput.value = density;
}
let safeSpot = side*side;
let minefield = Array(side*side).fill(false);
for(let i = 0; i<side*side; i++){
    minefield[i] = Math.random()*100 < density;
    safeSpot -= minefield[i];
}
let sweeper;

//first strike aint no die
let firstStrike = true;
let safeSpotUncover = 0;

//main loop
const tiles = document.querySelectorAll('.tile');
for(let i = 0; i<side*side; i++){
    tiles[i].style.fontSize = (45/side)+'vmin';
    tiles[i].addEventListener('click', () => {
        if(tiles[i].textContent != 'F'){
            //die
            if(minefield[i] && !firstStrike){
                tiles[i].style.background = 'red';
                gameover.textContent = 'Loser';
                body.classList.add('die');
            }
            else{
                if(firstStrike){
                    //first strike, likely to destroy nearby mine
                    firstStrike = false;
                    if(minefield[i]){
                        minefield[i] = false;
                        safeSpot++;
                    }
                    for(let j = 0; j<100; j++){
                        let num = Math.floor(Math.random()*6)-3 + (Math.floor(Math.random()*6)-3)*side;
                        if(num+i >= 0 && num+i < side*side && minefield[num+i]){
                            minefield[num+i] = false;
                            safeSpot++;
                        }
                    }
                    //sweep grid
                    sweeper = Array(side*side).fill(0);
                    for(let y = 0; y<side; y++)
                        for(let x = 0; x<side; x++)
                            for(let dir of [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]])
                                if(x+dir[0] >= 0 && x+dir[0] < side && y+dir[1] >= 0 && y+dir[1] < side)
                                    sweeper[x+y*side] += minefield[x+dir[0] + (y+dir[1])*side];
                }
                //uncover and sweep
                leakSafe(i);
                if(safeSpotUncover >= safeSpot)
                    gameover.textContent = 'Good Game';
            }
        }
    });
    //flag
    tiles[i].addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if(tiles[i].classList.contains('uncovered')) return;
        if(tiles[i].textContent == 'F') tiles[i].textContent = '';
        else tiles[i].textContent = 'F';
    });
}

function leakSafe(order){
    if(tiles[order].classList.contains('uncovered')) return;
    if(tiles[order].textContent == 'F') return;

    tiles[order].classList.add('uncovered');
    safeSpotUncover++;
    if(sweeper[order] > 0){
        tiles[order].textContent = sweeper[order];
        return;
    }

    let x = order%side;
    let y = Math.floor(order/side);

    for(let dir of [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]]){
        let dx = x+dir[0];
        let dy = y+dir[1];
        if(dx >= 0 && dx < side && dy >= 0 && dy < side)
            leakSafe(dx + dy*side);
    }
}

function reset(){
    localStorage.setItem('density', densitySlider.value);
    localStorage.setItem('side', sideSlider.value);
    location.reload();
}

//debug
function reveal(){
    for(let y = 0; y<side*side; y++)
        if(minefield[y])
            tiles[y].style.background = 'red';
        else
            tiles[y].style.background = 'white';
}