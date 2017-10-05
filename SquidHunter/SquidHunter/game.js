
/// <reference path="//code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs) {
    //alert("Game starting");


    //define keycode numbers for controls
    var keyCodes = {
        SPACEBAR: 32,
        LEFT_ARROW: 37,
        RIGHT_ARROW: 39,
        UP_ARROW: 38,
        DOWN_ARROW: 40
    };

    //override the windows key spacebar control
    window.onkeydown = function (e) {
        return !(e.keyCode == keyCodes.SPACEBAR);
    };


    function Game(canvas, gameData) {

        StartitALL()

        function StartitALL() {
            var self = this;
            self.stage = new createjs.Stage(canvas);
            var stageBG = new createjs.Shape();
            stageBG.name = "stageBG";
            stageBG.graphics.setStrokeStyle(3).beginStroke("black").beginFill("silver").drawRect(0, 0, 800, 600).endStroke().endFill();
            self.stage.addChild(stageBG);
            createjs.Touch.enable(self.stage, false, true);
            self.stage.enableMouseOver(25);
            self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

            // ***********     Declare all assests and preload them. (declare the path) ************************
            var assetsPath = gameData.assetsPath || "";
            assetsPath += "Assets/"

            var QuestionsRandomized = [];

            for (var d = 0; d < gameData.Questions.length; d++) {
                gameData.Questions[d].OrderId = d;
            }

            function shuffle(array) {
                var currentIndex = array.length,
                    temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);

                    usedQuestions.splice(0, 0, randomIndex);

                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                //alert("ran it")
                return array;
            }

            //declare each individual asset
            var assets = [

                { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
                { id: "background", src: assetsPath + "newbackground.png" },
                { id: "panel", src: assetsPath + "Panel.png" },
                { id: "playbutton", src: assetsPath + "SequencePlayButton.png" },
                { id: "yesbutton", src: assetsPath + "yesButton.png" },
                { id: "nobutton", src: assetsPath + "noButton.png" },
                { id: "pirate", src: assetsPath + "pirate.png" },
                { id: "enemy", src: assetsPath + "enemy.png" },
                { id: "harpoon", src: assetsPath + "harpoon.png" },
                { id: "ink", src: assetsPath + "ink.png" },
                { id: "questionPanel", src: assetsPath + "SmallPanel.png" },
                { id: "feedbackPanel", src: assetsPath + "SmallPanel2.png" },
                { id: "redx", src: assetsPath + "continuechk.png" },
                { id: "answerHolder", src: assetsPath + "answerHolder.png" },
                { id: "logo", src: assetsPath + "logo.png" },
                { id: "treasure", src: assetsPath + "treasure.png" },
                { id: "piratesprite", src: assetsPath + "newpirate.png" },
                { id: "splat", src: assetsPath + "splat.png" },
                { id: "squidsprite", src: assetsPath + "squidsprite2.png" },
                { id: "gameover", src: assetsPath + "gameover.wav" },
                { id: "harpoonsound", src: assetsPath + "harpoonsound.wav" },
                { id: "oceanwave", src: assetsPath + "oceanwave.mp3" },
                { id: "chime", src: assetsPath + "chime.mp3" },
                { id: "wrong", src: assetsPath + "wrong.wav" },
                { id: "inksplat", src: assetsPath + "inksplat.mp3" },
                { id: "musicOn", src: assetsPath + "musicOn.png" },
                { id: "musicOff", src: assetsPath + "musicOff.png" },
                { id: "arrowleft", src: assetsPath + "arrowleft.png" },
                { id: "arrowright", src: assetsPath + "arrowright.png" },
                { id: "arrowup", src: assetsPath + "arrowup.png" },
                { id: "arrowdown", src: assetsPath + "arrowdown.png" },
                { id: "fish", src: assetsPath + "fish.wav" },
                { id: "bass", src: assetsPath + "bass.wav" },
                { id: "level-up", src: assetsPath + "level-up.mp3" },
                { id: "page", src: assetsPath + "page.wav" },
                { id: "coin", src: assetsPath + "coin.wav" },
                { id: "splash", src: assetsPath + "splash.wav" },
                { id: "instructions_question", src: assetsPath + "instructions_question.png" },
                { id: "instructions_background", src: assetsPath + "instructions_background.png" }

            ];


            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                addBackground();
            });
            queue.loadManifest(assets);

            //declare vars for start of game
            var harpoonContainer;
            var harpoon;
            var inkContainer;
            var ink;
            var harpoondelay = 0;
            var inkdelay = 0;

            var enemyContainer;
            var enemies = [];
            var squidAquarium;
            var widthOfSquid = 50;
            var maxEnemyCount = 5;
            var isEnemySpawnEnabled = true;
            var canEnemyFire = true;

            var isQuestionDisplayed = false;
            var questionArray = [];

            var isFeedbackDisplayed = false;
            var feedbackArray = [];

            var Score = 0;
            var scoreLabel;

            var harpoonCount = 10;
            var harpoonCountLabel;

            var submittedScoreAlready = false;

            var playerMovement = 2; //player speed
            var playerMaximumVelocity = 2;
            var playerVelocityX = 0;
            var playerVelocityY = 0;
            var playerMovementFriction = .98;

            var playerContainer;

            var currentQuestionNumber = 0;

            var musicOn = true;

            var isMobile = false;
            var touchContainer;

            var isBassPlaying = false;
            var isGameRunning = false;
            var isGamePaused = false;

            var playButton;

            var inkContainerTweens = [];

            var instructionsScreen;

            var backText;

            //loads background image
            function addBackground() {

                var gameBackground = new createjs.Container();
                //define background as a sprite
                var speed = .02;
                var data = {
                    images: [queue.getResult("background")],
                    frames: {
                        width: 800,
                        height: 600,
                        frames: 3,
                    },
                    animations: {
                        pegleg: [0, 2, "pegleg", speed],
                    },
                };

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "pegleg");

                gameBackground.x = 0;
                gameBackground.y = 0;
                gameBackground.addChild(sprite);
                self.stage.addChild(gameBackground);

                //call mobile or desktop
                mobilePanel();

            }

            function pauseTheGame() {
                // hide the player
                playerContainer.alpha = 0;
                // hide the squids
                squidAquarium.alpha = 0;
                // prevent ink from being spawned
                canEnemyFire = false;
                // pause the ink animations
                for (var i = 0; i < inkContainerTweens.length; ++i) {
                    inkContainerTweens[i].setPaused(true);
                }
                // prevent player from shooting
                isGameRunning = false;

                //add the back button
            //    backText.alpha = 1;

            }

            function resumeTheGame() {
                // show the player
                playerContainer.alpha = 1;
                // show the squids
                squidAquarium.alpha = 1;
                // allow ink from being spawned
                canEnemyFire = true;
                // resume the ink animations
                for (var i = 0; i < inkContainerTweens.length; ++i) {
                    inkContainerTweens[i].setPaused(false);
                }
                // allow player from shooting
                isGameRunning = true;
            }



            //scales the current target on mouseover and mouse out with a tween 
            //used for volume on/off switch
            function handleButtonHover(event) {

                var initScareX = 1;
                var initScareY = 1;
                if (event.type == "mouseover") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: initScareX * 1.0625, scaleY: initScareY * 1.0625 }, 100)
                                                            .to({ scaleX: initScareX, scaleY: initScareY }, 100)
                                                            .to({ scaleX: initScareX * 1.0625, scaleY: initScareY * 1.0625 }, 100);
                }
                if (event.type == "mouseout") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: initScareX, scaleY: initScareY }, 100);
                }
            }

            //used for scaling the question mark on mouseover
            function handleInstructionsMouseOver(event) {
                if (event.type == "mouseover") {
                    createjs.Tween.get(questionMark, { loop: false }).to({ scaleX: 1.0625, scaleY: 1.0625 }, 50);
                }
                else {
                    createjs.Tween.get(questionMark, { loop: false }).to({ scaleX: 1.0, scaleY: 1.0 }, 50);
                }
            }

            //loads volume on/off switch
            function createSoundContainer() {
                var scaleX = .75;
                var scaleY = .75;

                var soundContainer = new createjs.Container();
                soundContainer.x = 0;
                soundContainer.y = 0;
                soundContainer.visible = true;
                soundContainer.name = "theSoundContainer";
                soundContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawCircle(0, 50, 50));
                soundContainer.cursor = 'pointer';

                var sound = new createjs.Bitmap(queue.getResult("musicOn"));
                sound.name = "musicOnImage"
                sound.scaleX = scaleX;
                sound.scaleY = scaleY;
                soundContainer.addChild(sound);
                soundContainer.addEventListener("click", function (evt) {
                    if (musicOn == true) {

                        musicOn = false;
                        var sound = new createjs.Bitmap(queue.getResult("musicOff"));
                        sound.scaleX = scaleX;
                        sound.scaleY = scaleY;
                        sound.name = "musicOffImage"
                        var destroy = evt.currentTarget.getChildByName("musicOnImage");
                        evt.currentTarget.removeChild(destroy);
                        evt.currentTarget.addChild(sound);
                        createjs.Sound.setMute(true);
                    }
                    else {
                        musicOn = true;
                        var sound = new createjs.Bitmap(queue.getResult("musicOn"));
                        sound.scaleX = scaleX;
                        sound.scaleY = scaleY;
                        sound.name = "musicOnImage"
                        var destroy = evt.currentTarget.getChildByName("musicOffImage");
                        evt.currentTarget.removeChild(destroy);
                        evt.currentTarget.addChild(sound);
                        createjs.Sound.setMute(false);
                    }

                }
                );

                soundContainer.on("mouseover", handleButtonHover);
                soundContainer.on("mouseout", handleButtonHover);
                return soundContainer;
            }



           

            //define bass sound in beginning on load
            var bassSound = createjs.Sound.createInstance("bass");

            //call base sound if it's playing pause the next iteration
            function playBass() {

                if (!bassSound.paused) {
                    bassSound.play();
                }
            }

            //loads intro screen for are you on mobile? y/n
            function mobilePanel() {

                playBass();

                var mobileScreen = new createjs.Container();
                var instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;


                var titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;
                titleText.alpha = 0;

                createjs.Tween.get(titleText)
                    .wait(600)
                    .to({ alpha: 1, visible: true }, 1000)
                    .to({ scaleX: 2, scaleY: 2 }, 2000, createjs.Ease.ElasticOut)
                    .to({color:"red"}, 500)

                var mobileText = new createjs.Text("Are you on mobile?", "28px Alegreya", "#000000");
                mobileText.x = panelBG.x + 130;
                mobileText.y = panelBG.y + 170;
                //add a tween
                createjs.Tween.get(mobileText)
                    .to({ x: 200, y: 250}, 2000 , createjs.Ease.ElasticOut)
                    


                var yesButton = new createjs.Bitmap(queue.getResult("yesbutton"))

                yesButton.regX = 93;
                yesButton.regY = 95;
                yesButton.x = panelBG.x + 200;
                yesButton.y = panelBG.y + 300;
                yesButton.scaleX = yesButton.scaleY = 0.20;

                var noButton = new createjs.Bitmap(queue.getResult("nobutton"))
                noButton.regX = 93;
                noButton.regY = 95;
                noButton.x = panelBG.x + 400;
                noButton.y = panelBG.y + 300;
                noButton.scaleX = noButton.scaleY = 0.20;

                instructionsScreen.addChild(panelBG, titleText, mobileText, yesButton, noButton);

                //create a tween and pass in the yes/no buttons
                createjs.Tween.get(yesButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);

                createjs.Tween.get(noButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);

                var soundContain = createSoundContainer();

                self.stage.addChild(instructionsScreen);
                self.stage.addChild(soundContain);
                yesButton.addEventListener("click", yesClick);
                noButton.addEventListener("click", noClick);

                function yesClick(event) {
                    playBass();
                    self.stage.removeChild(instructionsScreen);
                    mobileIntroScreen();
                    isGameRunning = true;
                }

                function noClick(event) {
                    self.stage.removeChild(instructionsScreen);
                    introductionScreen();
                    isGameRunning = true;
                }
            }

            //call the mobile version of the instructions screen
            function mobileIntroScreen() {

                instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;

                titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 130;
                descriptionText.y = panelBG.y + 125;

                var directionsText = new createjs.Text("Directions: Touch Directional Arrow Buttons to move along the ship." +
                   "\nHarpoons will fire every 2 seconds.\nEliminate squids for treasure." +
                    "\nIf the pirate gets hit by the ink, you will need to answer a question." +
                    "\nIf the pirate runs out of harpoons, you will need to answer a question.", "20px Alegreya", "#000000");
                directionsText.x = panelBG.x + 130;
                directionsText.y = panelBG.y + 155;

                var logo = new createjs.Bitmap(queue.getResult("logo"))
                logo.alpha = 0;
                createjs.Tween.get(logo).wait(500).to({ alpha: 1, visible: true }, 1000).call(handleComplete);
                function handleComplete() {
                    //self.stage.addChild(logo)
                }

                logo.regX = 180;
                logo.regY = 60;
                logo.x = panelBG.x + 220;
                logo.y = panelBG.y + 305;
                logo.scaleX = logo.scaleY = 0.30;

                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, logo);


                var soundContain = createSoundContainer();

                self.stage.addChild(instructionsScreen);
                self.stage.addChild(soundContain);

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 93;
                playButton.regY = 95;
                playButton.x = panelBG.x + 600;
                playButton.y = panelBG.y + 400;
                playButton.scaleX = playButton.scaleY = 0.20;

                createjs.Tween.get(playButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);

                instructionsScreen.addChild(playButton);

                playButton.addEventListener("click", handleClickPlay);

                function handleClickPlay(event) {
                    instructionsScreen.removeChild(playButton);
                    self.stage.removeChild(instructionsScreen);
                    isMobile = true;
                    playBass();
                    StartInteraction();
                };


                    
            //    if (isGamePaused == true) {
                    backText = new createjs.Text("Back", "Bold 23px Alegreya", "#000000");
                    backText.x = instructionsScreen.x + 450;
                    backText.y = instructionsScreen.y + 450;
                    backText.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#FFF").drawRoundRect(0, 0, 100, 40, 50));
               //     self.stage.addChild(backText);
                 //   backText.alpha = 0;

                    backText.addEventListener("click", handleClick);

                    backText.on("mouseover", handleButtonHover);
                    backText.on("mouseover", function (evt) {
                        evt.currentTarget.color = "white";
                    });

                    backText.on("mouseout", handleButtonHover);
                    backText.on("mouseout", function (evt) {
                        evt.currentTarget.color = "black";
                    })


                    function handleClick(event) {
                        //self.stage.removeChild(backText);
                        self.stage.removeChild(instructionsScreen);
                        resumeTheGame();
                    }
         //       }


            }

            //load introduction screen/play button
            function introductionScreen() {

                instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;

                var titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 130;
                descriptionText.y = panelBG.y + 125;

                var directionsText = new createjs.Text("Directions: Use 'Spacebar' key to fire harpoons.\nUse 'Directional Arrow' keys to move along the ship." +
                   "\nEliminate squids for treasure." +
                    "\nIf the pirate gets hit by the ink, you will need to answer a question." +
                    "\nIf the pirate runs out of harpoons, you will need to answer a question.", "20px Alegreya", "#000000");
                directionsText.x = panelBG.x + 130;
                directionsText.y = panelBG.y + 155;

                var logo = new createjs.Bitmap(queue.getResult("logo"))
                logo.alpha = 0;

                createjs.Tween.get(logo).wait(500).to({ alpha: 1, visible: true }, 1000).call(handleComplete);
                function handleComplete() {
                }

                logo.regX = 180;
                logo.regY = 60;
                logo.x = panelBG.x + 220;
                logo.y = panelBG.y + 300;
                logo.scaleX = logo.scaleY = 0.30;


                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, logo);

                var soundContain = createSoundContainer();
                self.stage.addChild(instructionsScreen);
                self.stage.addChild(soundContain);

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 93;
                playButton.regY = 95;
                playButton.x = panelBG.x + 600;
                playButton.y = panelBG.y + 400;
                playButton.scaleX = playButton.scaleY = 0.20;

                instructionsScreen.addChild(playButton);

                createjs.Tween.get(playButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);


                playButton.addEventListener("click", handleClickPlay);

                function handleClickPlay(event) {
                    instructionsScreen.removeChild(playButton);
                    self.stage.removeChild(instructionsScreen);
                    StartInteraction();
                };

                //    if (isGamePaused == true) {
                backText = new createjs.Text("Back", "Bold 23px Alegreya", "#000000");
                backText.x = instructionsScreen.x + 450;
                backText.y = instructionsScreen.y + 450;
                backText.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#FFF").drawRoundRect(0, 0, 100, 40, 50));
                //     self.stage.addChild(backText);
                //   backText.alpha = 0;

                backText.addEventListener("click", handleClick);

                backText.on("mouseover", handleButtonHover);
                backText.on("mouseover", function (evt) {
                    evt.currentTarget.color = "white";
                });

                backText.on("mouseout", handleButtonHover);
                backText.on("mouseout", function (evt) {
                    evt.currentTarget.color = "black";
                })


                function handleClick(event) {
                    //self.stage.removeChild(backText);
                    self.stage.removeChild(instructionsScreen);
                    resumeTheGame();
                }
                //       }



            }

            function moveRight() {
                playerVelocityX += playerMovement;
            }

            function moveLeft() {
                playerVelocityX -= playerMovement;
            }

            function moveUp() {
                playerVelocityY -= playerMovement;
            }

            function moveDown() {
                playerVelocityY += playerMovement;
            }

            function printHarpoonCount() {
                harpoonCountLabel.text = " " + harpoonCount;
            }

            function printScore() {
                scoreLabel.text = " " + Score;
                var coin = createjs.Sound.createInstance("coin");
                coin.play();
            }

            function StartInteraction() {



                //if isMobile true, add directional arrows
                if (isMobile == true) {

                    var directionalArrows = new createjs.Container();

                    leftContainer = new createjs.Container();
                    left = new createjs.Bitmap(queue.getResult("arrowleft"));
                    leftContainer.y = 475;
                    leftContainer.x = 600;
                    leftContainer.scaleX = 1.2
                    leftContainer.scaleY = 1.2
                    leftContainer.addChild(left);

                    rightContainer = new createjs.Container();
                    right = new createjs.Bitmap(queue.getResult("arrowright"));
                    rightContainer.y = 475;
                    rightContainer.x = 700;
                    rightContainer.scaleX = 1.2
                    rightContainer.scaleY = 1.2
                    rightContainer.addChild(right);

                    upContainer = new createjs.Container();
                    up = new createjs.Bitmap(queue.getResult("arrowup"));
                    upContainer.y = 425;
                    upContainer.x = 650;
                    upContainer.scaleX = 1.2
                    upContainer.scaleY = 1.2
                    upContainer.addChild(up);

                    downContainer = new createjs.Container();
                    down = new createjs.Bitmap(queue.getResult("arrowdown"));
                    downContainer.y = 525;
                    downContainer.x = 650;
                    downContainer.scaleX = 1.2
                    downContainer.scaleY = 1.2
                    downContainer.addChild(down);

                    //add functionality to the containers of the arrows
                    leftContainer.on("mousedown", function (evt) {
                        var event = evt;
                        moveLeft();
                    });
                    rightContainer.on("mousedown", function (evt) {
                        var event = evt;
                        moveRight();
                    });

                    upContainer.on("mousedown", function (evt) {
                        var event = evt;
                        moveUp();
                    });
                    downContainer.on("mousedown", function (evt) {
                        var event = evt;
                        moveDown();
                    });

                    directionalArrows.addChild(leftContainer, rightContainer, upContainer, downContainer);

                    self.stage.addChild(directionalArrows);


                }

                //create a container for the squids to live in (separate from the stage)
                squidAquarium = new createjs.Container();
                self.stage.addChild(squidAquarium);

                var oceanwave = createjs.Sound.createInstance("oceanwave");
                oceanwave.volume = oceanwave.volume * .2;
                oceanwave.play();

                var fish = createjs.Sound.createInstance("fish");
                fish.volume = oceanwave.volume * .4;
                fish.play();

                //load pirate as a sprite
                playerContainer = new createjs.Container();
                var speed = .02;
                var data = {
                    images: [queue.getResult("piratesprite")],
                    frames: {
                        width: 250,
                        height: 350,
                        frames: 2,
                    },
                    animations: {
                        pegleg: [0, 1, "pegleg", speed],
                    },
                };

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "pegleg");
                playerContainer.addChild(sprite);
                self.stage.addChild(playerContainer);
                playerContainer.x = 300;
                playerContainer.y = 420;
                playerContainer.scaleX = .25;
                playerContainer.scaleY = .25;

                //load controls
                this.document.onkeydown = keyPressed;
                var KEYCODE_LEFT = keyCodes.LEFT_ARROW,
                    KEYCODE_RIGHT = keyCodes.RIGHT_ARROW,
                    KEYCODE_FIRE = keyCodes.SPACEBAR, // spacebar
                    KEYCODE_UP = keyCodes.UP_ARROW,
                    KEYCODE_DOWN = keyCodes.DOWN_ARROW;

                //load squid/s
                for (var i = 0; i < maxEnemyCount; ++i) {
                    setTimeout(function () {
                        spawnEnemy();
                    }, i * 1000);
                }

                //load help icon/background
                var questionMark = new createjs.Bitmap(queue.getResult("instructions_question"));

                var helpContainer = new createjs.Container();
                helpContainer.x = 0;
                helpContainer.y = 550;
                helpContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawCircle(0, 50, 50));
                helpContainer.cursor = 'pointer';

                helpContainer.addChild(new createjs.Bitmap(queue.getResult("instructions_background")));
                helpContainer.addChild(questionMark);

                helpContainer.addEventListener("click", handleClick);

                function handleClick(event) {
                    
                   // isGamePaused = true;
                    pauseTheGame();



                    if (isMobile) {
                        // self.stage.removeChild(squidAquarium);

                        self.stage.addChild(instructionsScreen);
                        instructionsScreen.addChild(backText)
                        instructionsScreen.alpha = 0.45;
                    } else {
                        // self.stage.removeChild(squidAquarium);

                        self.stage.addChild(instructionsScreen);
                        instructionsScreen.addChild(backText)

                        instructionsScreen.alpha = 0.45;
                    }
                };



                self.stage.addChild(helpContainer);

                //load score label
                scoreLabel = new createjs.Text(Score, "Bold 20px Alegreya", "#FFFFFF");
                scoreLabel.textAlign = "center";
                scoreLabel.lineWidth = 270;
                scoreLabel.color = "white";
                scoreLabel.y = 30;
                scoreLabel.x = 720;
                self.stage.addChild(scoreLabel);

                //load treasure icon
                treasureContainer = new createjs.Container();
                var treasure = new createjs.Bitmap(queue.getResult("treasure"))
                treasureContainer.y = 15;
                treasureContainer.x = 635;
                treasureContainer.scaleX = 0.3
                treasureContainer.scaleY = 0.3
                treasureContainer.addChild(treasure)
                self.stage.addChild(treasureContainer);

                //load harpoon count label
                harpoonCountLabel = new createjs.Text(" " + harpoonCount, "Bold 20px Alegreya", "#FFFFFF");
                harpoonCountLabel.textAlign = "center";
                harpoonCountLabel.lineWidth = 270;
                harpoonCountLabel.color = "white";
                harpoonCountLabel.y = 30;
                harpoonCountLabel.x = 600;
                self.stage.addChild(harpoonCountLabel);

                //load harpoon icon
                harpoonContainer = new createjs.Container();
                harpoon = new createjs.Bitmap(queue.getResult("harpoon"));
                harpoonContainer.y = 15;
                harpoonContainer.x = 575;
                harpoonContainer.scaleX = 1.2
                harpoonContainer.scaleY = 1.2
                harpoonContainer.rotation = 45
                harpoonContainer.addChild(harpoon);
                self.stage.addChild(harpoonContainer);


                function delayEnemyShootInk() {
                    enemyShootInk();
                    setTimeout(delayEnemyShootInk, Math.random() * 500 + 300)
                }

                setTimeout(delayEnemyShootInk, Math.random() * 500 + 1000)

                function onInkContainerTweenChange(evt) {
                    var theTween = evt.target;
                    var theInkContainer = theTween.target;

                    var pt = playerContainer.globalToLocal(theInkContainer.x, theInkContainer.y);


                    if (playerContainer.hitTest(pt.x, pt.y)) {
                        console.log("ink hit the player")

                        if (!isQuestionDisplayed) {
                            canEnemyFire = false;
                            if (currentQuestionNumber >= gameData.Questions.length) {
                                console.log("game over")
                                gameOverScreen();
                            }
                            else
                                deliverQuestion(gameData.Questions[currentQuestionNumber]);

                            Score = Score - 20;
                            printScore();
                        }

                    }
                }

                //blow up the squid when the harpoon hits the squid
                function onHarpoonContainerTweenChange(evt) {
                    var theTween = evt.target;
                    var theHarpoonContainer = theTween.target;
                    for (var i = 0; i < enemies.length; ++i) {

                        var pt = enemies[i].globalToLocal(theHarpoonContainer.x, theHarpoonContainer.y);

                        if (enemies[i].hitTest(pt.x, pt.y)) {
                            var splash = createjs.Sound.createInstance("splash");
                            splash.volume = splash.volume * .6;
                            splash.play();

                            // we hit the enemy... KILL IT!
                            createjs.Tween.get(enemies[i], { override: true })
                                .to({
                                    scaleX: 1.25,
                                    scaleY: 1.25
                                }, 200)
                                .to({
                                    scaleX: 1,
                                    scaleY: 1,
                                    rotation: 360
                                }, 1000)

                                .to({
                                    alpha: 0
                                }, 100)

                                .call(function (evt) {
                                    stage.removeChild(evt.currentTarget);
                                    stage.removeChild(theTween.target);
                                    Score = Score + 10;
                                    printScore();
                                })
                            .call(function () {
                                spawnEnemy();
                            })
                            ;

                            // remove it from the array
                            enemies.splice(i, 1);
                            // we removed an item from the array, fix the index so we dont skip checking any enemies.
                            --i;

                        }
                    }
                }

                function handlesplatter() {
                    sprite.gotoAndPlay("splatter")
                }

                function makeInk(theenemy) {
                    console.log("making ink")
                    inkContainer = new createjs.Container();

                    

                    inkContainer.x = theenemy.x;
                    inkContainer.y = theenemy.y;
                    ink = new createjs.Bitmap(queue.getResult("ink"));
                    inkContainer.addChild(ink);
                    inkContainer.scaleX = 0;
                    inkContainer.scaleY = 0;

                    self.stage.addChild(inkContainer);

                    createjs.Tween.get(inkContainer).to({ scaleX: 1, scaleY: 1 }, 250);

                    

                    //when ink hits the player
                    var theTween = createjs.Tween.get(inkContainer, {
                        onChange: onInkContainerTweenChange
                    })

                        .to({
                            y: playerContainer.y + (Math.random() * 200 - 100),
                            x: playerContainer.x + (Math.random() * 200)
                        }, 8000)

                        .call(function (evt) {

                            var theThingBeingTweened = evt.target;
                            var theContainer = theThingBeingTweened.parent;

                            var containerIndex = inkContainerTweens.indexOf(evt);

                            if (containerIndex > -1) {
                                inkContainerTweens.splice(containerIndex, 1);
                            }

                            if (theContainer != null) {
                                theContainer.removeChild(theThingBeingTweened);

                                var splatContainer = new createjs.Container();
                                splat = new createjs.Bitmap(queue.getResult("splat"));
                                splatContainer.addChild(splat);
                                splatContainer.x = theThingBeingTweened.x;
                                splatContainer.y = theThingBeingTweened.y;

                                if (!isQuestionDisplayed) {
                                    theContainer.addChild(splatContainer);
                                }
                                var inksplat = createjs.Sound.createInstance("inksplat", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
                                createjs.Sound.play("inksplat");


                                setTimeout(function () {

                                    createjs.Tween.get(splatContainer).to({ alpha: 0 }, 1000).call(function () {
                                        theContainer.removeChild(splatContainer);
                                    })
                                }, 3000);
                            }
                        });
                    madeInk = true;

                    inkContainerTweens.push(theTween);
                }

                function enemyShootInk() {
                    if (enemies.length > 0) {
                        var enemyindex = Math.floor(Math.random() * enemies.length)
                        var theenemy = enemies[enemyindex];

                        if (canEnemyFire && theenemy) {
                            makeInk(theenemy);
                        }
                    }
                }

                function makeHarpoonOrAskQuestion() {
                    if (harpoondelay <= 0) {
                        harpoondelay = 30

                        if (harpoonCount >= 0 && !isQuestionDisplayed) {
                            if (isGameRunning) {
                                makeHarpoon();
                                harpoonCount--;
                            }
                            console.log(harpoonCount);

                            var harpoonsound = createjs.Sound.createInstance("harpoonsound");
                            harpoonsound.volume = harpoonsound.volume * .2;
                            harpoonsound.play();

                            printHarpoonCount();
                        }
                        if (harpoonCount <= 0 && !isQuestionDisplayed) {
                            printHarpoonCount();
                            if (currentQuestionNumber >= gameData.Questions.length) {
                                gameOverScreen();
                            }
                            else
                                deliverQuestion(gameData.Questions[currentQuestionNumber]);
                        }
                    }
                }


                function moveRight() {
                    playerVelocityX += playerMovement;
                }

                function moveLeft() {
                    playerVelocityX -= playerMovement;
                }

                function moveUp() {
                    playerVelocityY -= playerMovement;
                }

                function moveDown() {
                    playerVelocityY += playerMovement;
                }


                //only called when enough harpoon available
                function makeHarpoon() {
                    console.log("making harpoon")
                    harpoonContainer = new createjs.Container();
                    harpoon = new createjs.Bitmap(queue.getResult("harpoon"));
                    if (!isQuestionDisplayed) {
                        harpoonContainer.addChild(harpoon);
                    }
                    self.stage.addChild(harpoonContainer);

                    harpoonContainer.x = playerContainer.x + 9;
                    harpoonContainer.y = playerContainer.y + 9;

                    //when harpoon hits the squid
                    createjs.Tween.get(harpoonContainer, {
                        onChange: onHarpoonContainerTweenChange
                    })
                        //.wait(2000)
                        .to({
                            y: -200
                        }, 5000, createjs.Ease.bounceInOut)
                        .wait(2000)
                        .call(function (evt) {
                            var theThingBeingTweened = evt.target;
                            self.stage.removeChild(theThingBeingTweened);
                        });
                }

                function keyPressed(event) {
                    //  console.log(event.keyCode);
                    switch (event.keyCode) {
                        case KEYCODE_LEFT:
                            moveLeft();
                            event.preventDefault();
                            break;
                        case KEYCODE_RIGHT:
                            moveRight();
                            event.preventDefault();
                            break;
                        case KEYCODE_UP:
                            moveUp();
                            event.preventDefault();
                            break;
                        case KEYCODE_DOWN:
                            moveDown();
                            event.preventDefault();
                            break;
                            //map harpoon to spacebar
                        case KEYCODE_FIRE:
                            makeHarpoonOrAskQuestion();
                            event.preventDefault();
                            break;
                    }
                }

                if (isMobile) {

                    var harpoonProgressBar = new createjs.Shape();
                    var height = 10;

                    harpoonProgressBar.graphics.beginFill("#ff0000").drawRect(0, 0, canvas.width, height);
                    harpoonProgressBar.scaleX = 0;
                    harpoonProgressBar.alpha = 0;
                    harpoonProgressBar.y = canvas.height - height;

                    createjs.Tween.get(harpoonProgressBar, { loop: true })
                                  .to({ scaleX: 1, alpha: 1 }, 2000)
                                  .call(function () {
                                      makeHarpoonOrAskQuestion();
                                  });

                    stage.addChild(harpoonProgressBar);
                }
            }

            function isEnemyAtY(y) {
                //check enemies array to spawn at diff y locations
                for (var i = 0; i < enemies.length; ++i) {
                    if (enemies[i].y == y)
                        return true;
                }
                return false;
            }


            function spawnEnemy() {

                //spawn enemies
                console.log("made enemy")
                enemyContainer =

                 //  var container = new createjs.Container();
                squidContainer = new createjs.Container();
                var speed = .02;
                // var enemy = new createjs.Bitmap(queue.getResult("enemy"));
                var data = {
                    images: [queue.getResult("squidsprite")],
                    frames: {
                        width: 125,
                        height: 100,
                        frames: 4,
                    },
                    animations: {
                        pegleg: [0, 3, "pegleg", speed],
                    },
                };
                //container.addChild(enemy);

                //enemy.x = -100;
                //enemy.y = -56.5;

                //return container;

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "pegleg");
                squidContainer.addChild(sprite);
                self.stage.addChild(squidContainer);
                squidContainer.x = 300;
                squidContainer.y = 233;

                //makeEnemy();
                enemyContainer.scaleX = 0;
                enemyContainer.scaleY = 0;
                enemyContainer.alpha = 1;
                enemyContainer.regX = 50;
                enemyContainer.regY = 125 / 2;


                //enemy functionality
                do {
                    enemyContainer.y = 50 + (Math.floor((Math.random() * maxEnemyCount)) * 50) + enemyContainer.regY;
                } while (isEnemyAtY(enemyContainer.y));

                enemies.push(enemyContainer);

                enemyContainer.x = 50 + Math.random() * (self.stage.canvas.width - widthOfSquid / 2);

                var totalTime = 5000;
                var totalWidth = self.stage.canvas.width - (widthOfSquid / 2) - 50;
                var timeToTake = (enemyContainer.x / totalWidth) * totalTime;

                createjs.Tween.get(enemyContainer)
                    .to({
                        alpha: 1,
                        scaleX: 0.7,
                        scaleY: 0.7
                    }, 2000)
                    .wait(100)
                    .to({
                        x: 50
                    }, timeToTake, createjs.Ease.sinInOut)
                    .call(function (evt) {
                        createjs.Tween.get(evt.target, {
                            loop: true
                        })
                            .to({
                                x: 700
                            }, totalTime, createjs.Ease.sinInOut)
                            .to({
                                x: 50
                            }, totalTime, createjs.Ease.sinInOut);
                    })

                squidAquarium.addChild(enemyContainer);
            }

            //load enemy
            function makeEnemy() {
                squidContainer = new createjs.Container();

                var speed = .02;
                var data = {
                    images: [queue.getResult("squidsprite")],
                    frames: {
                        width: 125,
                        height: 100,
                        frames: 4,
                    },
                    animations: {
                        pegleg: [0, 3, "pegleg", speed],
                    },
                };
                //container.addChild(enemy);

                //enemy.x = -100;
                //enemy.y = -56.5;

                //return container;

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "pegleg");
                squidContainer.addChild(sprite);
                self.stage.addChild(squidContainer);
                squidContainer.x = 300;
                squidContainer.y = 233;
                //squidContainer.scaleX = 1.5;
                //squidContainer.scaleY = 1.5;


            }
            var questionPanel;
            var questionContainer

            function submitScore(score) {
                // alert("test");
                if (submittedScoreAlready == true)
                    return false;
                if (points == 0)
                    return false;

                var url = gameData.leaderboardUrl;

                if (url) {
                    var data = {
                        gameId: gameData.id,
                        score: score
                    };
                    $.ajax(url, {
                        type: "POST",
                        data: data,
                        success: function (x) { },
                        error: function (x, y, z) { }
                    });

                }
                submittedScoreAlready = true;
            }

            //deliver questions when player is by ink
            function deliverQuestion(question) {

                var page = createjs.Sound.createInstance("page");
                page.play();

                isEnemySpawnEnabled = false;
                canEnemyFire = false;

                questionContainer = new createjs.Container();
                questionPanel = new createjs.Bitmap(queue.getResult("questionPanel"));
                isQuestionDisplayed = true;
                questionPanel.scaleX = 2.2;
                questionPanel.scaleY = 2;
                questionPanel.x = 10;
                questionPanel.y = 32;

                var questionsText = new createjs.Text("Question:" + " " + question.Text, "Bold 20px Alegreya", "#000000");
                questionsText.x = questionPanel.x + 100;
                questionsText.y = questionPanel.y + 70;

                questionContainer.name = "question";
                questionContainer.addChild(questionPanel, questionsText)

                self.stage.addChild(questionContainer);
                deliverAnswers(question);

                return questionContainer;

            }
            answerContainersParent = new createjs.Container();

            function deliverAnswers(question) {
                var stackIncrement = 50;
                answerContainersParent = new createjs.Container();
                answerContainersParent.name = "parent";

                for (var j = 0; j < gameData.Questions[0].Answers.length; j++) {
                    console.log("answers")
                    var answersText = new createjs.Text("Answer:" + " " + question.Answers[j].Text, "16px Alegreya", "#000000");
                    var answerContainer = new createjs.Container();

                    var answerHolder = new createjs.Bitmap(queue.getResult("answerHolder"))
                    answersText.x = questionPanel.x + 100;
                    answersText.y = questionPanel.y + 80 + stackIncrement;

                    answerHolder.scaleX = 1.3;
                    answerHolder.x = answersText.x - 15;
                    answerHolder.y = answersText.y - 10;

                    answerContainer.name = "child";
                    answerContainer.IsCorrect = question.Answers[j].IsCorrect;
                    answerContainer.Idx = j;

                    answerContainer.addChild(answerHolder, answersText);

                    stackIncrement += 60;

                    answerContainer.addEventListener("pressup", function (evt) {
                        //   alert(evt.target);
                        console.log("clicked that thing")
                        if (isFeedbackDisplayed != true) {
                            if (evt.currentTarget.IsCorrect) {
                                // alert("correct")
                                //this is where code goes to change color of holder container and display the answer

                                var chime = createjs.Sound.createInstance("chime", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });

                                createjs.Sound.play("chime");

                                Score = Score + 35;
                                printScore();


                                deliverFeedback("correct");
                            } else {
                                //    alert("incorrect" + evt.currentTarget.IsCorrect);
                                var wrong = createjs.Sound.createInstance("wrong", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
                                wrong.volume = wrong.volume * .5;
                                createjs.Sound.play("wrong");

                                Score = Score - 25;
                                printScore();

                                deliverFeedback("incorrect");
                            }
                        }

                        //check if this is the last question, if yes- exit the game
                        // if not increment current question index

                    });
                    answerContainersParent.addChild(answerContainer);
                }
                self.stage.addChild(answerContainersParent);
            }


            function deliverFeedback(answerstatus) {

                var feedbackContainer = new createjs.Container();
                var feedbackPanel = new createjs.Bitmap(queue.getResult("feedbackPanel"));
                var feedbackText;
                isFeedbackDisplayed = true;
                feedbackPanel.scaleX = .35;
                feedbackPanel.scaleY = .20;
                feedbackPanel.x = 50;
                feedbackPanel.y = 420;

                //add harpoon count
                //this will be the correct answer
                // <0 otherwise <1

                if (answerstatus == "correct") {
                    feedbackText = new createjs.Text("Correct. Click the red x to continue", "20px Alegreya", "#000000");
                    harpoonCount = 10;
                } else {

                    for (var i = 0; i < gameData.Questions[currentQuestionNumber].Answers.length; i++) {
                        if (gameData.Questions[currentQuestionNumber].Answers[i].IsCorrect == true) {
                            feedbackText = new createjs.Text("I'm sorry, the correct answer is, " + gameData.Questions[currentQuestionNumber].Answers[i].Text, "20px Alegrea", '#000000')
                            harpoonCount = 5;
                        }
                    }

                    //  feedbackText = new createjs.Text("InCorrect:" + " " + gameData.Questions, "20px Alegreya", "#FFFFFF");
                }


                feedbackText.x = feedbackPanel.x + 90
                feedbackText.y = feedbackPanel.y + 30

                var redx = new createjs.Bitmap(queue.getResult("redx"))
                redx.x = feedbackPanel.x + 580;
                redx.y = feedbackPanel.y + 90;

                redx.addEventListener("click", handleClick);


                function handleClick(event) {
                    var page = createjs.Sound.createInstance("page");
                    page.play();
                    //create an if statement, if question iscorrect, netcount 5, if incorrect, netcount 0
                    currentQuestionNumber++;
                    self.stage.removeChild(feedbackContainer);
                    //harpoonCount = 10;
                    canEnemyFire = true;
                    isQuestionDisplayed = false;
                    isFeedbackDisplayed = false;
                    isEnemySpawnEnabled = true;
                    self.stage.removeChild(questionContainer);
                    self.stage.removeChild(answerContainersParent);
                    printHarpoonCount();


                }

                feedbackContainer.addChild(feedbackPanel, feedbackText, redx)
                self.stage.addChild(feedbackContainer);

                var redx = new createjs.Bitmap(queue.getResult("redx"))

                return feedbackContainer;


            }

            function gameOverScreen() {
                pauseTheGame();

                //playsound
                var gameover = createjs.Sound.createInstance("gameover");
                gameover.volume = gameover.volume * 1.5;
                gameover.play();

                gameoverContainer = new createjs.Container();
                gameoverPanel = new createjs.Bitmap(queue.getResult("logo"));
                isQuestionDisplayed = true;
                gameoverPanel.x = 50;
                gameoverPanel.y = 32;


                var gameoverText = new createjs.Text("Game Over!", "Bold 55px Alegreya", "#FFFFFF");
                gameoverText.x = gameoverPanel.x + 300;
                gameoverText.y = gameoverPanel.y + 390;

                var replayText = new createjs.Text("Replay", "Bold 23px Alegreya", "#FFFFFF");
                replayText.x = gameoverPanel.x + 265;
                replayText.y = gameoverPanel.y + 145;
                replayText.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawRoundRect(0, 0, 100, 40, 50));

                var exitText = new createjs.Text("Exit", "Bold 23px Alegreya", "#FFFFFF");
                exitText.x = gameoverPanel.x + 385;
                exitText.y = gameoverPanel.y + 145;
                exitText.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawRoundRect(0, 0, 100, 50, 50));

                exitText.addEventListener("click", handleClicks);

                replayText.addEventListener("click", handleClick);


                replayText.on("mouseover", handleButtonHover);
                replayText.on("mouseover", function (evt) {
                    evt.currentTarget.color = "green";
                });

                replayText.on("mouseout", handleButtonHover);


                exitText.on("mouseover", handleButtonHover);
                exitText.on("mouseover", function (evt) {
                    evt.currentTarget.color = "red";
                });
                exitText.on("mouseout", handleButtonHover);


                function handleClicks(event) {
                    //    replay();

                }

                function handleClick(event) {
                    //    self.stage.removeChild(gameoverContainer);
                    replay();
                }

                gameoverContainer.addChild(gameoverPanel, gameoverText, replayText, exitText);

                self.stage.addChild(gameoverContainer);
                self.stage.removeChild(squidAquarium, playerContainer, inkContainer);
                if (isMobile == true) {
                    self.stage.removeChild(rightContainer, downContainer, upContainer, leftContainer);
                }


            }

            function DisplayEndingNotes(EndedHow) {
                replayContainer.addEventListener("click", handleClick);

                function handleClick(event) {
                    StartitALL()
                }
            }


            function replay() {

                inkContainer.removeAllChildren();
                enemyContainer.removeAllChildren();

                StartitALL();

            }
            var fps = 45;

            //this updates the stage every tick not sure if we need it but
            createjs.Ticker.addEventListener("tick", handleTick);
            createjs.Ticker.on("tick", handleTick);
            createjs.Ticker.setFPS(fps);

            function handleTick(event) {
                if (harpoondelay > 0)
                    harpoondelay--

                playerVelocityX = playerVelocityX * playerMovementFriction;
                playerVelocityY = playerVelocityY * playerMovementFriction;

                movePlayerContainer();

                var deltaS = event.delta / 1000;


                self.stage.update();
            }

            function movePlayerContainer() {
                if (playerContainer) {
                    playerContainer.x += playerVelocityX;
                    playerContainer.y += playerVelocityY;

                    if (playerContainer.x < 40)
                        playerContainer.x = 40;
                    else if (playerContainer.x > 730)
                        playerContainer.x = 730;

                    if (playerContainer.y < 300)
                        playerContainer.y = 300;
                    else if (playerContainer.y > 480)
                        playerContainer.y = 480;
                }
            }

        }
    }
    return Game;
})(createjs);