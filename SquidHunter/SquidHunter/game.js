
/// <reference path="//code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs) {
    //alert("Game starting");

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

                {id: "start_button", src: assetsPath + "SequencePlayButton.png"},
                {id: "background",src: assetsPath + "newbackground.png"},
                {id: "panel",src: assetsPath + "Panel.png"},
                {id: "playbutton",src: assetsPath + "SequencePlayButton.png"},
                {id: "yesbutton",src: assetsPath + "yesButton.png"},
                {id: "nobutton",src: assetsPath + "noButton.png"},
                {id: "pirate",src: assetsPath + "pirate.png"},
                {id: "enemy",src: assetsPath + "enemy.png"},
                {id: "harpoon",src: assetsPath + "harpoon.png"},
                {id: "ink",src: assetsPath + "ink.png"},
                {id: "questionPanel",src: assetsPath + "SmallPanel.png"},
                {id: "feedbackPanel",src: assetsPath + "SmallPanel2.png"},
                {id: "redx",src: assetsPath + "redx.png"},
                {id: "answerHolder",src: assetsPath + "answerHolder.png"},
                {id: "logo",src: assetsPath + "logo.png"},
                {id: "treasure",src: assetsPath + "treasure.png"},
                {id: "piratesprite",src: assetsPath + "newpirate.png"},
                {id: "splat",src: assetsPath + "splat.png"},
                {id: "squidsprite",src: assetsPath + "squidsprite2.png"},
                {id: "gameover",src: assetsPath + "GameOver.mp3"},
                {id: "harpoonsound",src: assetsPath + "harpoonsound.mp3"},
                {id: "oceanwave",src: assetsPath + "oceanwave.mp3"},
                {id: "cheer",src: assetsPath + "cheer.mp3"},
                {id: "wrong",src: assetsPath + "wrong.mp3"},
                {id: "inksplat",src: assetsPath + "inksplat.mp3"},
                {id: "musicOn",src: assetsPath + "musicOn.png"},
                {id: "musicOff",src: assetsPath + "musicOff.png"},
                {id: "arrowleft",src: assetsPath + "arrowleft.png"},
                {id: "arrowright",src: assetsPath + "arrowright.png"},
                {id: "arrowup",src: assetsPath + "arrowup.png"},
                {id: "arrowdown",src: assetsPath + "arrowdown.png"}

            ];

            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                addBackground();
            });
            queue.loadManifest(assets);

            //loads background image
            function addBackground() {
                var gameBackground = new createjs.Container();
                gameBackground.x = 0;
                gameBackground.y = 0;

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
                gameBackground.addChild(sprite);
                self.stage.addChild(gameBackground);
                gameBackground.x = 0;
                gameBackground.y = 0;

                //call mobile or desktop
                mobilePanel();


                //call intro screen
                //  introductionScreen();

            }


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



            function mobilePanel() {
                var mobileScreen = new createjs.Container();

                var instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;

                titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;

                var mobileText = new createjs.Text("Are you on mobile?", "28px Alegreya", "#000000");
                mobileText.x = panelBG.x + 130;
                mobileText.y = panelBG.y + 155;

                var yesButton = new createjs.Bitmap(queue.getResult("yesbutton"))

                yesButton.regX = 100;
                yesButton.regY = 150;
                yesButton.x = panelBG.x + 200;
                yesButton.y = panelBG.y + 300;
                yesButton.scaleX = yesButton.scaleY = 0.20;

                var noButton = new createjs.Bitmap(queue.getResult("nobutton"))
                noButton.regX = 100;
                noButton.regY = 150;
                noButton.x = panelBG.x + 400;
                noButton.y = panelBG.y + 300;
                noButton.scaleX = noButton.scaleY = 0.20;

                instructionsScreen.addChild(panelBG, titleText, mobileText, yesButton, noButton);
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

                //   var gameover = createjs.Sound.createInstance("gameover", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0});


                function yesClick(event) {
                    self.stage.removeChild(instructionsScreen);
                    //    createjs.Sound.play("gameover");

                    mobileIntroScreen();
                    // introductionScreen();

                    //if mobile checked if desktop click on click //else introduction screens//
                }

                function noClick(event) {
                    self.stage.removeChild(instructionsScreen);

                    introductionScreen();

                }


            }

            function mobileIntroScreen() {

                var instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;

                titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 100;
                playButton.regY = 150;
                playButton.x = panelBG.x + 600;
                playButton.y = panelBG.y + 400;
                playButton.scaleX = playButton.scaleY = 0.20;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 130;
                descriptionText.y = panelBG.y + 125;

                var directionsText = new createjs.Text("Directions: Touch Directional Arrow Buttons to move along the ship\nHarpoons will fire every 2 seconds\nEliminate Squids for points", "20px Alegreya", "#000000");
                directionsText.x = panelBG.x + 130;
                directionsText.y = panelBG.y + 155;

                var logo = new createjs.Bitmap(queue.getResult("logo"))
                logo.alpha = 0;
                createjs.Tween.get(logo).wait(1000).to({ alpha: 1, visible: true }, 1000).call(handleComplete);
                function handleComplete() {
                    //self.stage.addChild(logo)
                }

                logo.regX = 180;
                logo.regY = 60;
                logo.x = panelBG.x + 220;
                logo.y = panelBG.y + 275;
                logo.scaleX = logo.scaleY = 0.40;

                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, logo, playButton);
                createjs.Tween.get(playButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);

                var soundContain = createSoundContainer();

                self.stage.addChild(instructionsScreen);
                self.stage.addChild(soundContain);
                playButton.addEventListener("click", handleClick);

                //   var gameover = createjs.Sound.createInstance("gameover", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0});


                function handleClick(event) {
                    self.stage.removeChild(instructionsScreen);
                    //    createjs.Sound.play("gameover");
                    isMobile = true;
                    StartInteraction();

                };

            }




            //load introduction screen/play button
            function introductionScreen() {

                var instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 0;
                panelBG.y = 50;

                titleText = new createjs.Text(gameData.Title, " Bold 35px Alegreya", "#000000");
                titleText.x = panelBG.x + 130;
                titleText.y = panelBG.y + 75;

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 100;
                playButton.regY = 150;
                playButton.x = panelBG.x + 600;
                playButton.y = panelBG.y + 400;
                playButton.scaleX = playButton.scaleY = 0.20;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 130;
                descriptionText.y = panelBG.y + 125;

                var directionsText = new createjs.Text("Directions: Use 'F' Key to Fire Harpoons\nUse Directional Arrow Keys to move along the ship\nEliminate Squids for points ", "20px Alegreya", "#000000");
                directionsText.x = panelBG.x + 130;
                directionsText.y = panelBG.y + 155;

                var logo = new createjs.Bitmap(queue.getResult("logo"))
                logo.alpha = 0;
                createjs.Tween.get(logo).wait(1000).to({ alpha: 1, visible: true }, 1000).call(handleComplete);
                function handleComplete() {
                    //self.stage.addChild(logo)
                }

                logo.regX = 180;
                logo.regY = 60;
                logo.x = panelBG.x + 220;
                logo.y = panelBG.y + 275;
                logo.scaleX = logo.scaleY = 0.40;

                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, logo, playButton);
                createjs.Tween.get(playButton, {
                    loop: false
                }).to({
                    rotation: 360,
                    scaleX: .4,
                    scaleY: .4
                }, 2000);

                var soundContain = createSoundContainer();

                self.stage.addChild(instructionsScreen);
                self.stage.addChild(soundContain);
                playButton.addEventListener("click", handleClick);

                //   var gameover = createjs.Sound.createInstance("gameover", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0});


                function handleClick(event) {
                    self.stage.removeChild(instructionsScreen);
                    //    createjs.Sound.play("gameover");

                    StartInteraction();

                };

            }

            //declare vars for start of game
            var harpoonContainer;
            var harpoon;
            var inkContainer;
            var ink;
            var harpoondelay = 0;
            var inkdelay = 0;

            var enemyContainer;
            var enemies = [];
            var widthOfSquid = 50;
            var maxEnemyCount = 5;
            var isEnemySpawnedEnabled = true;

            var canEnemyFire = true;

            var isQuestionDisplayed = false;
            var questionArray = [];

            var isFeedbackDisplayed = false;
            var feedbackArray = [];

            var pausedGame = false; //not used yet

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

            function printHarpoonCount() {
                harpoonCountLabel.text = " " + harpoonCount;

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

            function StartInteraction() {

                if (isMobile == true) {

                    var directionalArrows = new createjs.Container();


                    leftContainer = new createjs.Container();
                    left = new createjs.Bitmap(queue.getResult("arrowleft"));
                    leftContainer.y = 475;
                    leftContainer.x = 600;
                    leftContainer.scaleX = 1.2
                    leftContainer.scaleY = 1.2
                    leftContainer.addChild(left);
                   // self.stage.addChild(leftContainer);

                    rightContainer = new createjs.Container();
                    right = new createjs.Bitmap(queue.getResult("arrowright"));
                    rightContainer.y = 475;
                    rightContainer.x = 700;
                    rightContainer.scaleX = 1.2
                    rightContainer.scaleY = 1.2
                    rightContainer.addChild(right);
                   // self.stage.addChild(rightContainer);

                    upContainer = new createjs.Container();
                    up = new createjs.Bitmap(queue.getResult("arrowup"));
                    upContainer.y = 425;
                    upContainer.x = 650;
                    upContainer.scaleX = 1.2
                    upContainer.scaleY = 1.2
                    upContainer.addChild(up);
                   // self.stage.addChild(upContainer);

                    downContainer = new createjs.Container();
                    down = new createjs.Bitmap(queue.getResult("arrowdown"));
                    downContainer.y = 525;
                    downContainer.x = 650;
                    downContainer.scaleX = 1.2
                    downContainer.scaleY = 1.2
                    downContainer.addChild(down);
                    //  self.stage.addChild(downContainer);

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
                    //createjs.Tween.get(playButton, {
                    //    loop: false
                    //}).to({
                    //    rotation: 360,
                    //    scaleX: .4,
                    //    scaleY: .4
                    //}, 2000);

                    self.stage.addChild(directionalArrows);


                }


                var oceanwave = createjs.Sound.createInstance("oceanwave");
                oceanwave.volume = oceanwave.volume * .2;

                //    createjs.Sound.play("oceanwave");

                oceanwave.play();

                //load pirate
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
                var KEYCODE_LEFT = 37,
                    KEYCODE_RIGHT = 39,
                    KEYCODE_FIRE = 70,
                    KEYCODE_UP = 38,
                    KEYCODE_DOWN = 40

                


                //load squid/s
                spawnEnemy();

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


                setInterval(function () {
                    if (isEnemySpawnedEnabled && enemies.length < maxEnemyCount) {
                        spawnEnemy();
                    }
                }, 2000);

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
                            deliverQuestion(gameData.Questions[currentQuestionNumber]);
                            Score = Score - 20;
                            printScore();
                            //deliver answers?
                            //printHarpoonCount();
                        }
                        //  isQuestionDisplayed = false

                    }
                }



                function printScore() {
                    //self.stage.removeChild(scoreLabel);
                    scoreLabel.text = " " + Score;
                }

                //blow up the squid when the harpoon hits the squid
                function onHarpoonContainerTweenChange(evt) {
                    var theTween = evt.target;
                    var theHarpoonContainer = theTween.target;
                    for (var i = 0; i < enemies.length; ++i) {

                        var pt = enemies[i].globalToLocal(theHarpoonContainer.x, theHarpoonContainer.y);

                        if (enemies[i].hitTest(pt.x, pt.y)) {

                            // we hit the enemy... KILL IT!
                            createjs.Tween.get(enemies[i])
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
                                });

                            // remove it from the array
                            enemies.splice(i, 1);

                            if (enemies.length == 0) {
                                isEnemySpawnedEnabled = true;
                            }
                            // we removed an item from the array, fix the index so we dont skip checking any enemies.
                            --i;

                            //this is where i  put the tween for harpooncontainer change
                            //this works but just makes it disappear first without removing it (still kills squids).

                            //createjs.Tween.get(theTween.target)
                            // .to({ scaleX: 1.25, scaleY: 1.25 }, 200)
                            // .to({ scaleX: 1, scaleY: 1 }, 100)
                            // .to({ alpha: 0 }, 100)
                            // .call(function (evt) {
                            //     stage.removeChild(theTween.target);
                            // });

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
                    self.stage.addChild(inkContainer);



                    //when ink hits the player
                    createjs.Tween.get(inkContainer, {
                        onChange: onInkContainerTweenChange
                    })

                        .to({
                            y: playerContainer.y + (Math.random() * 200 - 100),
                            x: playerContainer.x + (Math.random() * 200)
                        }, 8000)

                        .call(function (evt) {

                            var theThingBeingTweened = evt.target;

                            //self.stage.removeChild(theThingBeingTweened);

                            //ink sound goes 
                            //sound should only trigger on initial hit and freeze screen 
                            //no more splats after qpanel is up

                            var theContainer = theThingBeingTweened.parent;
                            theContainer.removeChild(theThingBeingTweened);

                            var splatContainer = new createjs.Container();
                            splat = new createjs.Bitmap(queue.getResult("splat"));
                            splatContainer.addChild(splat);
                            splatContainer.x = theThingBeingTweened.x;
                            splatContainer.y = theThingBeingTweened.y;
                            theContainer.addChild(splatContainer);

                            var inksplat = createjs.Sound.createInstance("inksplat", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });


                            createjs.Sound.play("inksplat");


                            setTimeout(function () {

                                createjs.Tween.get(splatContainer).to({ alpha: 0 }, 1000).call(function () {
                                    theContainer.removeChild(splatContainer);
                                })

                            }, 3000);

                        });


                    madeInk = true;
                }

                function enemyShootInk() {
                    if (enemies.length > 0) {
                        var enemyindex = Math.floor(Math.random() * enemies.length)
                        var theenemy = enemies[enemyindex];

                        if (canEnemyFire && theenemy) {
                            makeInk(theenemy);
                        } else {
                            console.log("wtf?");
                        }
                    }
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


                            if (harpoondelay <= 0) {
                                harpoondelay = 30

                                if (harpoonCount > 0) {
                                    makeHarpoon();
                                    harpoonCount--;
                                    console.log(harpoonCount);

                                    var harpoonsound = createjs.Sound.createInstance("harpoonsound");
                                    harpoonsound.volume = harpoonsound.volume * .2;
                                    harpoonsound.play();

                                    printHarpoonCount();
                                }
                                if (harpoonCount == 0 && !isQuestionDisplayed) {
                                    printHarpoonCount();
                                    deliverQuestion(gameData.Questions[currentQuestionNumber]);
                                }

                                //    printHarpoonCount();
                                event.preventDefault();
                                break;

                                event.preventDefault();
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
                                harpoonContainer.addChild(harpoon);

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
                    }
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
                //squidContainer.x = 300;
                //squidContainer.y = 233;


                //makeEnemy();
                enemyContainer.scaleX = 0;
                enemyContainer.scaleY = 0;
                enemyContainer.alpha = 0;

                //enemy functionality
                do {
                    enemyContainer.y = 50 + (Math.floor((Math.random() * maxEnemyCount)) * 50);
                } while (isEnemyAtY(enemyContainer.y));

                enemies.push(enemyContainer);

                if (enemies.length == maxEnemyCount)
                    isEnemySpawnedEnabled = false;

                enemyContainer.x = 50 + Math.random() * (self.stage.canvas.width - widthOfSquid / 2);

                var totalTime = 5000;
                var totalWidth = self.stage.canvas.width - (widthOfSquid / 2) - 50;
                var timeToTake = (enemyContainer.x / totalWidth) * totalTime;

                createjs.Tween.get(enemyContainer)
                    .to({
                        alpha: 1,
                        scaleX: 0.5,
                        scaleY: 0.5
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

                self.stage.addChild(enemyContainer);
            }



            //load enemy
            function makeEnemy() {
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

                isEnemySpawnedEnabled = false;
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

                                var cheer = createjs.Sound.createInstance("cheer", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });

                                createjs.Sound.play("cheer");

                                deliverFeedback("correct");
                            } else {
                                //    alert("incorrect" + evt.currentTarget.IsCorrect);

                                var wrong = createjs.Sound.createInstance("wrong", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
                                
                                createjs.Sound.play("wrong");
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
                if (answerstatus == "correct") {
                    feedbackText = new createjs.Text("Correct. Click the what ever to continue", "20px Alegreya", "#000000");
                    harpoonCount = 10;
                } else {

                    for (var i = 0; i < gameData.Questions[currentQuestionNumber].Answers.length; i++) {
                        if (gameData.Questions[currentQuestionNumber].Answers[i].IsCorrect == true) {
                            feedbackText = new createjs.Text("I'm sorry the correct answer is, " + gameData.Questions[currentQuestionNumber].Answers[i].Text, "20px Alegrea", '#000000')
                            harpoonCount = 5;
                        }
                    }
                    //need another if for end of game game over screen call


                    //  feedbackText = new createjs.Text("InCorrect:" + " " + gameData.Questions, "20px Alegreya", "#FFFFFF");
                }


                feedbackText.x = feedbackPanel.x + 100
                feedbackText.y = feedbackPanel.y + 40

                var redx = new createjs.Bitmap(queue.getResult("redx"))
                redx.x = feedbackPanel.x + 580;
                redx.y = feedbackPanel.y + 90;

                redx.addEventListener("click", handleClick);


                function handleClick(event) {

                    //create an if statement, if question iscorrect, netcount 5, if incorrect, netcount 0
                    currentQuestionNumber++;
                    self.stage.removeChild(feedbackContainer);
                    //harpoonCount = 10;
                    canEnemyFire = true;
                    isQuestionDisplayed = false;
                    isFeedbackDisplayed = false;
                    isEnemySpawnedEnabled = true;
                    self.stage.removeChild(questionContainer);
                    self.stage.removeChild(answerContainersParent);


                    // if questions array over ->
                    //    gameOverScreen();
                    printHarpoonCount();

                    //self.stage.removeChild(answerContainer

                }


                //turn off feedback panel if it is true
                //if (isFeedbackDisplayed == true) {
                //}

                feedbackContainer.addChild(feedbackPanel, feedbackText, redx)
                self.stage.addChild(feedbackContainer);

                var redx = new createjs.Bitmap(queue.getResult("redx"))

                return feedbackContainer;


            }

            function gameOverScreen() {

                gameoverContainer = new createjs.Container();
                gameoverPanel = new createjs.Bitmap(queue.getResult("questionPanel"));
                isQuestionDisplayed = true;
                gameoverPanel.scaleX = 2;
                gameoverPanel.scaleY = 1.8;
                gameoverPanel.x = 50;
                gameoverPanel.y = 32;

                var gameoverText = new createjs.Text("Game Over!", "Bold 60px Alegreya", "#000000");
                gameoverText.x = gameoverPanel.x + 70;
                gameoverText.y = gameoverPanel.y + 45;




                //  replay();

                self.stage.addChild(gameoverContainer);

                var redx = new createjs.Bitmap(queue.getResult("redx"))
                redx.x = gameoverPanel.x + 500;
                redx.y = gameoverPanel.y + 230;
                redx.scaleX = 2;
                redx.scaleY = 2;


                redx.addEventListener("click", handleClick);


                function handleClick(event) {

                    self.stage.removeChild(gameoverContainer);

                }



                gameoverContainer.addChild(gameoverPanel, gameoverText, redx);



            }

            function DisplayEndingNotes(EndedHow) {
                replayContainer.addEventListener("click", handleClick);

                function handleClick(event) {
                    StartitALL()
                }
            }

            function pauseGame() {

            }

            function replay() {
                gameBoard = null;

                initializeGame(); //wow that was easy
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