/// <reference path="createjs-2015.11.26.min.js" />
// JavaScript Document
// window.onload = function() {

    // assume Game Data was created by an external builder being passed into this script
    

        /* Background */
    var bgImg = new Image();
    var bg1;
    var bg2Img = new Image();
    var bg2;

        /* Jetpack */ 
        var sImg = new Image();
        var ship;
   

        /* Enemy */
    var eImg = new Image() ;

        /* planet(s) */
    var bImg = new Image() ;
    var boss;

        /* Fuel Crystals | Lives */
    var lImg = new Image(); // was lives lImg

        // variables
  //  var lives = new Container(); //stores the lives gfx 
  //  var bullets = new Container(); //stores the bullets gfx 
 //   var enemies = new Container(); //stores the enemies gfx 
    var bossHealth = 20;
    var score;
    var gfxLoaded = 0; //used as a preloader, counts the already loaded items 
    var centerX = 160;
    var centerY = 240;
    var tkr = new Object(); //used as a Ticker listener 
    var timerSource; //references a setInterval method

           

            //set ticker 
    // createjs.Ticker.setFPS(60);
   // createjs.Ticker.on("tick", handleTick)

    function Main()
{
        //code... 
    var canvas = document.getElementById("myCanvas");
    var stage = new createjs.Stage(canvas);
        stage.mouseEventsEnabled = true;

        /* Sounds */
  
  //  SoundJS.addBatch([ 
   //     {name:'boss', src:'sounds/game-die.mp3', instances:1}, 
    //    {name:'explo', src:'deflate.mp3', instances:10}, 
    //    {name:'shot', src:'rf_Balloon_Pop.mp3', instances:10}]);

        /* Load GFX */  
        bgImg.src = 'Images/bg1.png'; 
        bgImg.name = 'bg'; 
        bgImg.onload = loadGfx; 
      
        bg2Img.src = 'Images/bg2.png'; 
        bg2Img.name = 'bg2'; 
        bg2Img.onload = loadGfx; 
      
        sImg.src = 'Images/thumbsUpMan.png'; // ship or main character
        sImg.name = 'ship'; 
        sImg.onload = loadGfx; 
  
        eImg.src = 'Images/bag_creature.png';  // alien or zombie enemy
        eImg.name = 'enemy'; 
        eImg.onload = loadGfx; 
  
        bImg.src = 'Images/planet-1138237.png';  // boss or planet *different planet sprites are in the repository
        bImg.name = 'boss'; 
        bImg.onload = loadGfx; 

        /* Ticker */  
     //   Ticker.setFPS(30); 
    //    Ticker.addListener(stage);

     /* Ticker */
    //   createjs.Ticker.setFPS(30);
    //    createjs.Ticker.addListener(stage);
               

}

function loadGfx(e) 
{ 
    if(e.target.name = 'bg'){bg = new Bitmap(bgImg);} 
    if(e.target.name = 'bg2'){bg2 = new Bitmap(bg2Img);} 
    if(e.target.name = 'ship'){ship = new Bitmap(sImg);} 
      
    gfxLoaded++; 
      
    if(gfxLoaded == 9) 
    { 
        addGameView(); 
    } 
}