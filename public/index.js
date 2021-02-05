let WIDTH= document.documentElement.clientWidth-20; 
let HIGH = document.documentElement.clientHeight-20; 
let game;
let shape= {}
let movement= {};

 


async function setup() {  
  let queryString = window.location.search;
  let urlParams= new URLSearchParams(queryString);
  let age =  urlParams.get('age');
  let level = urlParams.get('level');
  let config = await $.ajax({url: '/age/'+age+'/level/'+level+'/config',type: 'GET'});
  WIDTH =document.documentElement.clientWidth-20;  
  HIGH =  document.documentElement.clientHeight-20; 
  const canvas = createCanvas(WIDTH, HIGH);
  canvas.parent('#canvasHolder');
  game = new Game(config);
  
  
}
async function draw() {
    background(50);
    if(game)game.draw();   
}


shape['image'] = class ImageShape
{
  constructor(game,conf){
    this.game = game;
    this.conf = conf;
    this.image = loadImage('assets/'+conf.image);
  }
  draw = function(x,y){
    image(this.image, x, y, this.game.cell_width, this.game.cell_height,this.conf.sx,this.conf.sy,this.conf.sWidth,this.conf.sHeight);
  }
}
shape['point'] = class PointShape
{
  constructor(game,conf){
    this.game = game;
    this.conf = conf;
  }
  draw = function(x,y){
    stroke(this.conf.color);
    strokeWeight(this.conf.weight);
    point(x+(this.game.cell_width/2), y+(this.game.cell_height/2));
  }
}

class Element
{
  constructor(game,conf){
    this.game = game;
    this.shape =  new shape[conf.shape.type](this.game,conf.shape);
  }
  draw(x,y){
    this.shape.draw(x,y)
  }
}




//TODO: resolver por colisiones
//   mapa  contiene elementos estaticos (pared, semilla y fruta)  (pared, agua, metal)
 //  participantes   automtico o manual   
 //  reglas en base a las coliciones  () 

      // < # no avanza
      // < . come semilla y suma puntos
      // < * come fruta cambia de estado de los fantasmas
      // < A gameOver
      // A < gameOver 




class Game
{
  constructor(config){
    this.config = config;
    this.status = 'loading';
    let rows =   config.screen.split('\n');
    this.rows = rows.length;
    this.cols = rows[0].length;
    this.cell_height = Math.floor(HIGH / this.rows);
    this.cell_width = Math.floor(WIDTH / this.cols);
    this.map = new Array(rows.length);
    
       
    
    this.movement= {};
    this.movement['manual'] = new movement['manual'](this);
    this.movement['auto'] = new movement['auto'](this);

    this.element = {};
    this.element['#'] =  new Element(this,this.config.element['#']);
    this.element['.'] =  new Element(this,this.config.element['.']);
    this.element['*'] =  new Element(this,this.config.element['*']);


    this.participants = []

    for(let i=0;i<rows.length;i++){
      let row = rows[i];
      this.map[i]= new Array(row.length);
      for(let j=0;j<row.length;j++){
        let character  = row.charAt(j);
        let _config = this.config.participant[character];
        if(_config){
          let participant = new Participant(this,this.cell_width*j,this.cell_height*i,_config);
          this.participants.push(participant);
          character = ' '; 
        }
        this.map[i][j] = character;
      }
    }   
    this.status = 'playing';
  }
  draw(){ 
    if(this.status =='loading'){
      //TODO: mostrar algo que indique que esta cargabdo
   }
   else if(this.status== 'playing'){
      this.drawScene();
      for(let i=0;i<this.participants.length;i++){
        let participant = this.participants[i];
        participant.draw();
      }
      // this.mouth.draw();
      // for(let i=0;i<this.ghosts.length;i++){
      //   let ghost = this.ghosts[i];
      //   ghost.draw();
      //   if(ghost.posX == this.mouth.posX && ghost.posY == this.mouth.posY ){
      //     this.status = 'gameOver'
      //   }
      // }
    }
    else if(this.status =='gameOver'){
       alert('Game over !!!');
       noLoop();
    }
    else if(this.status =='winer'){
      alert('Winer !!!');
      noLoop();
   }
  }
  drawScene(){       
      let seeds = 0;
      for(let i=0;i<this.rows;i++){
        let row = this.map[i];
        for(let j=0;j<this.cols;j++){
          let character = row[j];
          if(this.element[character]){            
            let x = (j * this.cell_width);
            let y = (i * this.cell_height);
            this.element[character].draw(x,y);
          }
        }
      }
      //TODO: resolver cuando se gana.
      //if(seeds==0)this.status = 'winer'      
  }
}

class Button {  
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.button = createImg(img);
    this.button.position(x, y);
  } 
  over() {
     return mouseX > this.x && mouseX < this.x + this.button.width 
         && mouseY > this.y && mouseY < this.y + this.button.height;
  }
}

movement['manual'] = class ManualMovement
{
  constructor(game){
    let w = 64;
    let h = 64;
    let x = WIDTH-200;
    let y = HIGH-200;
    this.game =  game;
    this.btLeft = new Button(x,y+h,'assets/arrow-left.png');
    this.btRight = new Button(x+(w*2),y+h,'assets/arrow-right.png');
    this.btUp = new Button(x+w,y,'assets/arrow-up.png');
    this.btDown = new Button(x+w,y+(h*2),'assets/arrow-down.png');      
  }
  left(){ return keyIsDown(LEFT_ARROW) || this.btLeft.over(); }
  right(){ return keyIsDown(RIGHT_ARROW) || this.btRight.over(); }
  up(){ return keyIsDown(UP_ARROW) || this.btUp.over(); }
  down(){ return keyIsDown(DOWN_ARROW) || this.btDown.over(); }

  nextPosition(element){
    let _x=0;
    let _y=0;
    let next = {x:element.x,y:element.y};   
    
    if(next.x<0)next.x= WIDTH-1;
    else if(next.x>WIDTH)next.x= 1;
    else if(next.y<0)next.y= HIGH-1;
    else if(next.y>HIGH)next.y= 1;
    else {
      if(this.left())_x-=element.speed;
      else if(this.right())_x+=element.speed;
      else if(this.up())_y-=element.speed;
      else if(this.down())_y+=element.speed; 
      next.x += _x;
      next.y += _y;
    }
    // return next;
    // let next = this.movement.nextPosition(this);

    let x = parseInt((next.x)/element.width);
    let x2 = parseInt((next.x + (element.width-7))/element.width);
    let y = parseInt((next.y )/element.height);
    let y2 = parseInt((next.y + (element.height-7))/element.height);
    
    if(this.game.map[y][x]!='#' && this.game.map[y2][x]!='#' && this.game.map[y][x2]!='#' && this.game.map[y2][x2]!='#' ){
      element.x = next.x;
      element.y = next.y;
      if(this.game.map[y][x]=='.'){
        this.game.map[y][x]=' ';
      }
      if(this.game.map[y][x]=='*'){
        this.game.map[y][x]=' ';
      }
    } 
  }
}

movement['auto'] = class AutoMovement
{
  constructor(game){
    this.game =  game;    
    this.directions = ['LEFT','RIGHT','UP','DOWN'];
  }
  randomElement(arr){
    let index=  Math.floor(Math.random() * arr.length);
    return arr[index];
  } 
  nextPosition(element){
    let next = {x:element.x,y:element.y};

    if(!element.directionStrategy){
      element.directionStrategy = 'CHANGE';
      element.directionSteps=0;
      element.lastPosiblesDirections = this.posiblesDirections(element);
      element.direction = this.randomElement(element.lastPosiblesDirections);
    }
    

    if(!element.directionSteps)
    if(!element.lastPosiblesDirections)element.lastPosiblesDirections = this.posiblesDirections(element);
    if(!element.direction)element.direction = element.lastPosiblesDirections[0];

    if(next.x<0)next.x= WIDTH-1;
    else if(next.x>WIDTH)next.x= 1;
    else if(next.y<0)next.y= HIGH-1;
    else if(next.y>HIGH)next.y= 1;
    else {

        if(element.directionStrategy == 'CHANGE'){
          let newDirection = null;
          if(element.lastPosiblesDirections.length==4){
            newDirection = this.randomElement(element.lastPosiblesDirections);
          }else{          
            let posiblesDirections = this.posiblesDirections(element);
            for(let i=0;i<posiblesDirections.length;i++){
              let posibleDirection = posiblesDirections[i];
              if(!element.lastPosiblesDirections.includes(posibleDirection)){
                newDirection= posibleDirection;
                break;
              }
            }
          }
          if(newDirection){
            element.direction = newDirection;
            element.directionStrategy = 'CURRENT';
          }
        }
        let next = this.possibleNextPosition(element);
        if(next){
          element.x = next.x;
          element.y = next.y;
          element.directionSteps++;
          if(element.directionSteps>30){
            element.directionSteps=0;
            element.lastPosiblesDirections = this.posiblesDirections(element);
            element.directionStrategy = 'CHANGE'
          }
        }else{
          element.direction = this.randomElement(this.directions);        
        }
    }
    return next;
  }
  posiblesDirections(element){
    let posibles = [];
    for(let i=0;i<this.directions.length;i++){
      let direction = this.directions[i];
      let position = this.possibleNextPosition(element,direction);
      if(position)
         posibles.push(direction);
    }
    return posibles;
  }
  possibleNextPosition(element,direction){
    if(!direction)direction=element.direction; 
    let _x=0;
    let _y=0;
    let next = {x:element.x,y:element.y};  
    switch(direction){
       case 'LEFT': _x-=element.speed; break;
       case 'RIGHT': _x+=element.speed; break;
       case 'UP': _y-=element.speed; break;
       case 'DOWN': _y+=element.speed; break;
    }
    next.x = next.x + _x;
    next.y = next.y + _y;
    let x = parseInt((next.x)/element.width);
    let x2 = parseInt((next.x + (element.width-7))/element.width);
    let y = parseInt((next.y )/element.height);
    let y2 = parseInt((next.y + (element.height-7))/element.height);    
    if(this.game.map[y][x]!='#' && this.game.map[y2][x]!='#' && this.game.map[y][x2]!='#' && this.game.map[y2][x2]!='#' )
      return next;
    return null;    
  }
}




class Participant
{
  constructor(game,x,y,config){  
    this.game =game;
    this.movement = game.movement[config.movement];      
    this.width = game.cell_width;// this.image.width
    this.height = game.cell_height;
    this.x= x;
    this.y= y;
    this.speed = Math.floor(Math.random()*(config.speed.to-config.speed.from))+config.speed.from;
    this.image = loadImage('assets/'+config.image);
  }
  get posX(){return parseInt(this.x/this.width);}
  get posY(){return parseInt(this.y/this.height);}

  draw(){ 
    this.movement.nextPosition(this);
    image(this.image, this.x, this.y,this.width, this.height);
  }
}