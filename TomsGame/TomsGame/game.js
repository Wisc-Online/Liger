
/// <reference path="createjs-2015.11.26.min.js" />
// JavaScript Document
window.onload = function () {

    // assume Game Data was created by an external builder being passed into this script
    var theCanvas = document.getElementById("myCanvas");
    var stage = new createjs.Stage(theCanvas);
    var ball = new createjs.Shape();

    //set ticker 
    createjs.Ticker.setFPS(60);
        
    createjs.Ticker.on("tick", handleTick)

   
    //container for stage objects
    function initialize() {
        //load sounds
        createjs.Sound.registerSound("sounds/jump_sound.wav", "jump");
        createjs.Sound.registerSound("sounds/thud.wav", "thud");
      //  createjs.Sound.addEventListener("LoadComplete", handleComplete);

        // Main game box
        var mainBox = new createjs.Shape();
        mainBox.x = 120;
        mainBox.y = 20;
        mainBox.graphics.setStrokeStyle(1).beginStroke("black").beginFill("darkgrey");
        mainBox.graphics.drawRect(25, 0, 500, 560);
        // adding mainbox to stage
        stage.addChild(mainBox);
        

        // main character
        // var ball = new createjs.Shape();
        ball.addEventListener("click", handleClick); //mouse click or screen tap
        ball.graphics.beginFill("blue").drawCircle(0, 0, 25);
        ball.x = 400;
        ball.y = 540;
        // add character to stage
        stage.addChild(ball);

       

        // zombie character
        var circle = new createjs.Shape();
        circle.graphics.beginFill("red").drawCircle(0, 0, 30);
        circle.x = 400;
        circle.y = 100;
        stage.addChild(circle);

        createjs.Tween.get(circle, { loop: true })
      .to({ x: 600 }, 1000, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 175 }, 500, createjs.Ease.getPowInOut(2))
      .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
      .to({ alpha: 1, y: 225 }, 500, createjs.Ease.getPowInOut(2))
      .to({ x: 200 }, 1000, createjs.Ease.getPowInOut(5))
      .to({ alpha: 1, y: 275 }, 450, createjs.Ease.getPowInOut(2))
      .to({ x: 400 }, 900, createjs.Ease.getPowInOut(2))
      .to({ alpha: 1, y: 325 }, 400, createjs.Ease.getPowInOut(2))
      .to({ x: 600 }, 800, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 400 }, 350, createjs.Ease.getPowInOut(2))
      .to({ x: 200 }, 700, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 540 }, 300, createjs.Ease.getPowInOut(2))
      .to({ x: 800 }, 2000, createjs.Ease.getPowInOut(2));

    }

    function handleComplete(event) {

    }
   

    function handleTick() {
        stage.update();
    }

    function handleClick(event) {
        createjs.Sound.play("jump");
       // ball.graphics.beginFill("yellow").drawCircle(0, 0, 25);
        
       jumpUp();
    }
     
    function jumpUp(event) {
       
        createjs.Tween.get(ball)
       .to({ alpha: 1, y: ball.y - 100 }, 200, createjs.Ease.circInOut(2))
        .to({ alpha: 1, y: ball.y }, 500, createjs.Ease.bounceOut(30))
        .wait(150).call(function()
        {   //jumpin landing thud
            createjs.Sound.play("thud");
        })
       
    }

    //reset button functionality
    function reset() {

        stage.removeAllChildren();
        initialize();

    }

    initialize();
}