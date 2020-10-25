
const WIDTH = 1200;
const HIGH = 800;
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
    this.status = 'Playing';

    this.mouth = new Mouth(this,this.cell_width*13,this.cell_height*14);
    this.ghosts = new Array(4);
    this.ghosts[0] =new Ghost(this,this.cell_width*11,this.cell_height*10);
    this.ghosts[1] =new Ghost(this,this.cell_width*11,this.cell_height*12);
    this.ghosts[2] =new Ghost(this,this.cell_width*14,this.cell_height*10);
    this.ghosts[3] =new Ghost(this,this.cell_width*14,this.cell_height*12);
    // this.ghosts[4] =new Ghost(this,this.cell_width*12,this.cell_height*11);
    // this.ghosts[5] =new Ghost(this,this.cell_width*13,this.cell_height*11);


  } 
  createMap(){
    let screen = "###########################\r\n"
                +"#............#............#\r\n"
                +"#.####.#####.#.#####.####.#\r\n"
                +"#.####.#####.#.#####.####.#\r\n"                
                +"#.........................#\r\n"               
                +"#.####.#.#########.#.####.#\r\n"
                +"#......#.....#.....#......#\r\n"
                +"######.#####.#.#####.######\r\n"              
                +"     #.#           #.#     \r\n"
                +"     #.# ###  #### #.#     \r\n"
                +"######.# #       # #.######\r\n"
                +"      .  #       #  .      \r\n"
                +"######.# #       # #.######\r\n"
                +"     #.# ######### #.#     \r\n"
                +"     #.#           #.#     \r\n"
                +"######.# ######### #.######\r\n"
                +"#............#............#\r\n"
                +"#.####.#####.#.#####.####.#\r\n"                
                +"#...##...............##...#\r\n"
                +"###.##.#.#########.#.##.###\r\n"               
                +"#......#.....#.....#......#\r\n"
                +"#.##########.#.##########.#\r\n"                
                +"#.........................#\r\n"
                +"###########################\r\n";                

    let rows =   screen.split('\r\n');
    let map = new Array(rows.length);
    for(let i=0;i<rows.length;i++){
      let row = rows[i];
      map[i]= new Array(row.length);
      for(let j=0;j<row.length;j++){
          map[i][j] = row.charAt(j);
      }
    }
    return map;
  }

  draw(){    
    this.drawMap();
    this.mouth.draw();
    for(let i=0;i<this.ghosts.length;i++){
       let ghost = this.ghosts[i];
       ghost.draw();
       if(ghost.posX == this.mouth.posX && ghost.posY == this.mouth.posY ){
         this.status = 'Game over!!!'
       }
    }
    if(this.status !='Playing'){
       alert(this.status);
       noLoop();
    }
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

      let seeds = 0;
      for(let i=0;i<this.rows;i++){
        let row = this.map[i];
        for(let j=0;j<this.cols;j++){
          let character = row[j];            
          let x = (j * this.cell_width);
          let y = (i * this.cell_height);
          switch(character){          
              case '#':  drawWall.bind(this)(x,y); break;              
              case ' ':  drawEmptyRoad.bind(this)(x,y); break;
              case '.':  
                  drawPacDots.bind(this)(x,y);
                  seeds++; 
                  break;
          }
        }
      }
      if(seeds==0){
        this.status = 'Winer!!!'
      }
  }
}

class Participant
{
  constructor(game,init_x,init_y,img,speed){  
    this.game =game;      
    this.width = game.cell_width;// this.image.width
    this.height = game.cell_height;
    this.x= init_x;
    this.y= init_y;
    this.speed = speed;
    this.image = loadImage(img);
  } 
  updatepPosition(){    
  }
  get posX(){return parseInt(this.x/this.width);}
  get posY(){return parseInt(this.y/this.height);}

  draw(){ 
    this.updatepPosition();
    image(this.image, this.x, this.y,this.width, this.height);
  }
}

class Mouth extends Participant
{
    constructor(game,init_x,init_y){  
      super(game,init_x,init_y,'assets/images/cat.png',2)
    } 
    updatepPosition(){
      let _x=0;
      let _y=0;

      if(keyIsDown(LEFT_ARROW))_x-=this.speed;
      else if(keyIsDown(RIGHT_ARROW))_x+=this.speed;
      else if(keyIsDown(UP_ARROW))_y-=this.speed;
      else if(keyIsDown(DOWN_ARROW))_y+=this.speed; 
      
      let x = parseInt((this.x + _x)/this.width);
      let y = parseInt((this.y + _y)/this.height);
      if(this.game.map[y][x]!='#'){
        this.x += _x;
        this.y += _y;
        if(this.game.map[y][x]=='.'){
          this.game.map[y][x]=' ';
        }
      }  
    }    
}

class Ghost extends Participant
{
  constructor(game,init_x,init_y){  
    super(game,init_x,init_y,'assets/images/dog.png',Math.floor(Math.random()*3)+1)
    this.directions = ['LEFT','RIGHT','UP','DOWN'];  
    this.current_direction = this.randomDirection();
    this.mode = 'CURRENT';
    this.posiblesDirections= [];
    this.currentSteps = 0;
    
  } 
  randomDirection(){
    let index=  Math.floor(Math.random() * 4);
    return this.directions[index];
  }
  getPossibleNextPosition(direction){
    let _x=0;
    let _y=0;
    switch(direction){
       case 'LEFT': _x-=this.speed; break;
       case 'RIGHT': _x+=this.speed; break;
       case 'UP': _y-=this.speed; break;
       case 'DOWN': _y+=this.speed; break;
    }
    let x = parseInt((this.x + _x)/this.width);
    let y = parseInt((this.y + _y)/this.height);
    if(this.game.map[y][x]!='#')
      return {x: _x,y: _y};
    return null;    
  }


  advanceInCurrentDirection(){
    let nextPosition = this.getPossibleNextPosition(this.current_direction);
    if(nextPosition){
      this.x = this.x + nextPosition.x;
      this.y = this.y + nextPosition.y;
      return true;
    }
    else{
      this.current_direction = this.randomDirection();
      return false;
    }    
  }
  getPosiblesDirections(){
    let posibles = [];
    for(let i=0;i<this.directions.length;i++){
      let direction = this.directions[i];
      let position = this.getPossibleNextPosition(direction);
      if(position)
         posibles.push(direction);
    }
    return posibles;
  }
  changeNewDirection(){          
      
      for(let i=0;i<this.directions.length;i++){
       let direction = this.directions[i];
       let position = this.getPossibleNextPosition(direction);
       if(position && !this.posiblesDirections.includes(direction)){           
           this.current_direction = direction;
           return true;
         }
     }
     return false;
  }

  updatepPosition(){        
    if(this.mode == 'CHANGE'){
      if(this.changeNewDirection()){
        this.mode = 'CURRENT';
      }
    }
    if(this.advanceInCurrentDirection()){
        this.currentSteps++;
        if(this.currentSteps>30){
          this.currentSteps=0;
          this.posiblesDirections = this.getPosiblesDirections();
          this.mode = 'CHANGE'
        } 
    }
  }

  // draw(){ 

      
      
  //     image(this.image, this.x, this.y,this.width, this.height);



      


  //     // let posiblesPositions = [];
  //     // for(let i=0;i<this.directions.length;i++){
  //     //   let position = this.getPossibleNextPosition(this.directions[i]);
  //     //   if(position)posiblesPositions.push(position);
  //     // }
  //     // if(posiblesPositions.length>1){
  //     //   nextPosition = posiblesPositions[Math.floor(Math.random() * posiblesPositions.length)];
  //     // }else{
  //     //   nextPosition = posiblesPositions[0];
  //     // }
  //     // if(nextPosition.x!== undefined && nextPosition.y !== undefined)  {    
  //     //   this.x = this.x + nextPosition.x;
  //     //   this.y = this.y + nextPosition.y;
  //     // }
      
  // }
}



