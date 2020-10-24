
const WIDTH = 800;
const HIGH = 200;
let game;


function setup() {
  
  const canvas = createCanvas(WIDTH, HIGH);
  canvas.parent('#canvasHolder');
  game = new Game();
}
function draw() {
    background(0); 
    game.draw();
   
}

class Game
{

   constructor(){
      this.map =this.createMap();
      this.rows = this.map.length;
      this.cols = this.map[0].length;
      this.cell_height = HIGH / this.rows;
      this.cell_width = WIDTH / this.cols;
   } 

   createMap(){
     return [ ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#']
            , ['#','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','#']
            , ['#','.','#','#','#','.','#','#','#','#','#','#','.','#','#','#','#','#','#','#','#','#','#','#','.','#','.','#','#','#','.','#']
            , ['#','.','.','.','.','.','#','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','#','.','.','.','.',' ','#']
            , ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'] 
            ];
   }

   draw(){
      this.drawMap();
     
   }
   drawMap(){       
        const drawWall = function(x,y){
          fill('blue');
          stroke('blue');
          rect(x, y, this.cell_width, this.cell_height);
        }
        const drawPacDots= function(x,y){
              stroke('yellow');
              strokeWeight(5);
              point(x+(this.cell_width/2), y+(this.cell_height/2));
        }
        const drawEmptyRoad= function(x,y){

        }

        for(let i=0;i<this.rows;i++){
          let row = this.map[i];
          for(let j=0;j<this.cols;j++){
            let character = row[j];            
            let x = (j * this.cell_width);
            let y = (i * this.cell_height);
            switch(character){          
               case '#':  drawWall.bind(this)(x,y); break;
               case '.':  drawPacDots.bind(this)(x,y); break;
               case ' ':  drawEmptyRoad.bind(this)(x,y); break;
            }
          }
        }
   }

}



