
/// <reference path="https://code.createjs.com/createjs-2015.11.26.min.js" />
// JavaScript Document
window.onload = function () {

    // assume Game Data was created by an external builder being passed into this script
    var theCanvas = document.getElementById("myCanvas");
    var stage = new createjs.Stage(theCanvas);
    var playerState = "normal"; // normal, turning, zombie
    var vaccine; // does player have a vaccine on hand
    // var zombie = new createjs.Shape();
    var zombie = new createjs.Bitmap("Images/bag_creature.png");


    var assets = [
           { id: "DesertBackground",src:"Images/HighDefForgroundDesert.png"} // can put all assets here ,
           
    ];

    var queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", function (event) {
        initializeGame();
    });
    queue.loadManifest(assets);

    //set ticker 
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", handleTick)

      
    //container for stage objects
    function initialize() {
        //load sounds
        createjs.Sound.registerSound("sounds/jump_sound.wav", "jump");
        createjs.Sound.registerSound("sounds/thud.wav", "thud");
        createjs.Sound.registerSound("sounds/game-die.mp3", "die");
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
        // var player = new createjs.Shape();
        var player = new createjs.Bitmap("Images/thumbsUpMan.png");
        // player.graphics.beginFill("blue").drawCircle(0, 0, 25);
        player.x = 375;
        player.y = 450;
        player.scaleX = .10;
        player.scaleY = .10;
        
        player.addEventListener("click", handleClick); //mouse click or screen tap
            
        // add character to stage
        stage.addChild(player);

       
        // zombie character
        zombie.addEventListener("click", handleZombieClick); //mouse click or screen tap
        zombie.scaleX = .75;
        zombie.scaleY = .75;
        zombie.x = 400;
        zombie.y = 20;
        stage.addChild(zombie);

        createjs.Tween.get(zombie, { loop: true })
      .to({ x: 600 }, 1000, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 175 }, 525, createjs.Ease.getPowInOut(2))
      .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
      .to({ alpha: 1, y: 225 }, 500, createjs.Ease.getPowInOut(2))
      .to({ x: 200 }, 1000, createjs.Ease.getPowInOut(5))
      .to({ alpha: 1, y: 275 }, 475, createjs.Ease.getPowInOut(2))
      .to({ x: 400 }, 900, createjs.Ease.getPowInOut(2))
      .to({ alpha: 1, y: 325 }, 450, createjs.Ease.getPowInOut(2))
      .to({ x: 600 }, 800, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 400 }, 425, createjs.Ease.getPowInOut(2))
      .to({ x: 200 }, 700, createjs.Ease.getPowInOut(3))
      .to({ alpha: 1, y: 540 }, 400, createjs.Ease.getPowInOut(2))
      .to({ x: 800 }, 2000, createjs.Ease.getPowInOut(2));

        //check for collision
        if (player.x < zombie.x + zombie.width && player.x + player.width > zombie.x &&
          player.y < zombie.y + zombie.height && player.y + player.height > zombie.y) {
            // The objects are touching
            console.log("you've been bitten!");
           
        }
        

        var checkRectCollision = function (player, zombie) {
            var b1, b2;
            b1 = getBounds(player);
            b2 = getBounds(zombie);
            return calculateIntersection(b1, b2);
        }

        if (checkRectCollision != null) {
            console.log("you've been bitten!");
        };
        
    }

    //main game view
    function createMainGameView() {
        mainView = new createjs.Container();
        mainView.name = "MainView";
        var background = new createjs.Bitmap(queue.getResult("DesertBackground"));
        mainView.addChild(background);
        currentArea = getDisplayQuestionArea();
        var viewAnswersContainer = new createjs.Container();

        mainView.addChild(viewAnswersContainer);
        ScoreLabel = new createjs.Text("Score", "14px Arial bold", "white");
        ScoreLabel.x = 725;
        ScoreLabel.y = 10;

        ScoreText = new createjs.Text(gameState.score.toString(), "18px Arial bold", "white");
        ScoreText.x = 715;
        ScoreText.y = 50;

        TimerLabel = new createjs.Text("Time", "14px Arial bold", "white");
        TimerLabel.x = 550;
        TimerLabel.y = 20;

        Timer = new createjs.Text("Test", "18px Arial bold", "white");
        Timer.x = 630;
        Timer.y = 15;
        Timer.visible = false;
        gameState.timer = timeLimit;

        ShotsLabel = new createjs.Text("Shots", "14px Arial bold", "white");
        ShotsLabel.x = 550;
        ShotsLabel.y = 60;
        Shots = new createjs.Text(currentstate.shotsLeft.toString(), "14px Arial bold", "white");
        Shots.x = 648;
        Shots.y = 60;

        mainView.addChild(Timer, TimerLabel, ScoreLabel, ShotsLabel, Shots, ScoreText);
        mainView.addChild(currentArea);
       //ar soundStuff = stage.getChildByName("theSoundContainer");
       //oundStuff.visible = false;

        return mainView;
    }

    function handleComplete(event) {

    }
   

    function handleTick() {
        stage.update();
    }

    function handleClick(event) {
        createjs.Sound.play("jump");
       // player.graphics.beginFill("yellow").drawzombie(0, 0, 25);
        
        jumpUp();
    }

    function handleZombieClick(event) {
        createjs.Sound.play("die");
        createjs.Tween.get(zombie).to({alpha: 0},5000);
        stage.removeChild(zombie);
        
        //  stage.removeChild(zombie[i]);
        // player.graphics.beginFill("yellow").drawzombie(0, 0, 25);

       
    }
     
    function jumpUp(event) {
       
        createjs.Tween.get(player)
       .to({ alpha: 1, y: player.y - 100 }, 200, createjs.Ease.circInOut(2))
        .to({ alpha: 1, y: player.y }, 500, createjs.Ease.bounceOut(30))
        .wait(150).call(function()
        {   //jumpin landing thud
            createjs.Sound.play("thud");
        })
       
    }

    function zombieEncounter() {
        
        var randomNumber = Math.round(Math.random());
        if (randomNumber === 0) {
            alert("You have been bitten!");
            //present question to player. if correct use a vaccine if one has been found or start timer to find a vaccine. If incorrect start "turning" green?
        }
        else if (randomNumber === 1) {
            alert("You fought off the zombie!");
            // you find a vaccine to keep or use if already "turning".
        }
    }

    //reset button functionality
    function reset() {

        stage.removeAllChildren();
        initialize();

    }

    initialize();
}