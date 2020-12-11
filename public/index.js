let WIDTH;
let HIGH;
let game;
async function setup() {  
  let queryString = window.location.search;
  let urlParams= new URLSearchParams(queryString);
  let age =  urlParams.get('age');
  let level = urlParams.get('level');
  let config = await $.ajax({url: '/age/'+age+'/level/'+level+'/config',type: 'GET'});
  WIDTH = config.screen.width;
  HIGH = config.screen.high;
  const canvas = createCanvas(WIDTH, HIGH);
  canvas.parent('#canvasHolder');
  game = new Game(config);
}
async function draw() {
    background(0);
    if(game)game.draw();   
}


class Game
{
  constructor(config){
    this.config = config;
    this.status = 'Playing';
    let rows =   config.screen.map.split('\n');
    this.rows = rows.length;
    this.cols = rows[0].length;
    this.cell_height = Math.floor(HIGH / this.rows);
    this.cell_width = Math.floor(WIDTH / this.cols);
    this.map = new Array(rows.length);
    this.ghosts = []; 
    for(let i=0;i<rows.length;i++){
      let row = rows[i];
      this.map[i]= new Array(row.length);
      for(let j=0;j<row.length;j++){
        let character  = row.charAt(j);
        if(character=='>'){
          this.mouth = new Mouth(this,this.cell_width*j,this.cell_height*i); 
          character=' ';  
        }else if(character=='A'){
           let ghost = new Ghost(this,this.cell_width*j,this.cell_height*i);
           this.ghosts.push(ghost);
           character=' ';    
        } 
        this.map[i][j] = character;
      }
    }
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
      const drawPacFruit= function(x,y){
        stroke('red');
        strokeWeight(15);
        point(x+(this.cell_width/2), y+(this.cell_height/2));
      }
      let seeds = 0;
      for(let i=0;i<this.rows;i++){
        let row = this.map[i];
        for(let j=0;j<this.cols;j++){
          let character = row[j];            
          let x = (j * this.cell_width);
          let y = (i * this.cell_height);
          switch(character){          
              case '#': drawWall.bind(this)(x,y); break;              
              case ' ': break;
              case '*': drawPacFruit.bind(this)(x,y); break;
              case '.': drawPacDots.bind(this)(x,y);seeds++; break;
          }
        }
      }
      if(seeds==0)this.status = 'Winer!!!'      
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
      super(game,init_x,init_y,'assets/images/cat.png',game.config.mouth.speed)
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
      if(this.x<0)this.x= WIDTH-1;
      else if(this.x>WIDTH)this.x= 1;
      else if(this.y<0)this.y= HIGH-1;
      else if(this.y>HIGH)this.y= 1;
      else if(this.game.map[y][x]!='#'){
        this.x += _x;
        this.y += _y;
        if(this.game.map[y][x]=='.'){
          this.game.map[y][x]=' ';
        }
        if(this.game.map[y][x]=='*'){
          this.game.map[y][x]=' ';
        }
      }  
    }    
}
class Ghost extends Participant
{
  constructor(game,init_x,init_y){     
    let speed = Math.floor(Math.random()*(game.config.ghost.speedTo-game.config.ghost.speedFrom))+game.config.ghost.speedFrom; 
    super(game,init_x,init_y,'assets/images/dog.png',speed);
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
      if(this.x<0)this.x= WIDTH-1;
      else if(this.x>WIDTH)this.x= 1;
      if(this.y<0)this.y= HIGH-1;
      else if(this.y>HIGH)this.y= 1;       
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
}