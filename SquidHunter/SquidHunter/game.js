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
                var currentIndex = array.length, temporaryValue, randomIndex;

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
                 { id: "background", src: assetsPath + "background.jpg" },
                   { id: "panel", src: assetsPath + "Panel.png" },
                   { id: "playbutton", src: assetsPath + "SequencePlayButton.png" },
                   { id: "crate", src: assetsPath + "crate.png" },
                   { id: "enemy", src: assetsPath + "enemy.png" },
                  { id: "beam", src: assetsPath + "beam.png" },
                  { id: "laser", src: assetsPath + "laser.png" }
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
                var bgimage = new createjs.Bitmap(queue.getResult("background"))
                gameBackground.addChild(bgimage)

                self.stage.addChild(gameBackground);
                introductionScreen();

            }
            //load introduction screen /play button
            function introductionScreen() {

                var instructionsScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 50;
                panelBG.y = 100;

                titleText = new createjs.Text(gameData.Title, "24px Alegreya", "#FFFFFF");
                titleText.x = panelBG.x + 45;
                titleText.y = panelBG.y + 30;

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 97;
                playButton.regY = 100;
                playButton.x = panelBG.x + 550;
                playButton.y = panelBG.y + 300;
                playButton.scaleX = playButton.scaleY = 0.20;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#FFFFF2");
                descriptionText.x = panelBG.x + 80;
                descriptionText.y = panelBG.y + 100;

                var directionsText = new createjs.Text("Directions:" + " " + gameData.Directions, "20px Alegreya", "#FFFFFF");
                directionsText.x = panelBG.x + 80;
                directionsText.y = panelBG.y + 200;


                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, playButton);
                createjs.Tween.get(playButton, { loop: false }).to({ rotation: 360, scaleX: .4, scaleY: .4 }, 2000);
                self.stage.addChild(instructionsScreen);

                playButton.addEventListener("click", handleClick);
                function handleClick(event) {
                    self.stage.removeChild(instructionsScreen);

                    StartInteraction();
                };

            }

            //declare vars for start of game
            var beamContainer;
            var beam;
            var laserContainer;
            var laser;
            var beamdelay = 0;
            var laserdelay = 0;

            var enemyContainer;
            var enemies = [];
            var widthOfSquid = 200;
            var maxEnemyCount = 5;


            function StartInteraction() {

                // load player
                var playerContainer = new createjs.Container();
                var player = new createjs.Bitmap(queue.getResult("crate"))
                var playerMovement = 6

                playerContainer.addChild(player)

                //load controls
                this.document.onkeydown = keyPressed;
                var KEYCODE_LEFT = 37, KEYCODE_RIGHT = 39, KEYCODE_SPACEBAR = 32

                self.stage.addChild(playerContainer);
                playerContainer.x = 400;
                playerContainer.y = 550;


                spawnEnemy();

                setInterval(function () {
                    if (enemies.length < maxEnemyCount) {
                        spawnEnemy();
                    }
                }, 2000);

                function delayEnemyShootLaser() {

                    enemyShootLaser();

                    setTimeout(delayEnemyShootLaser, Math.random() * 500 + 1000)
                }

                setTimeout(delayEnemyShootLaser, Math.random() * 500 + 1000)


                function makeLaser(theenemy) {

                    console.log("making laser")
                    laserContainer = new createjs.Container();
                    laser = new createjs.Bitmap(queue.getResult("laser"));
                    laserContainer.addChild(laser);
                    self.stage.addChild(laserContainer);

                    laserContainer.x = theenemy.x + 100;
                    laserContainer.y = theenemy.y + 100;

                    //when laser hits the player
                    createjs.Tween.get(laserContainer, {
                        //      onChange: onLaserContainerTweenChange
                    })
                                  .to({ y: playerContainer.y, x : playerContainer.x + (Math.random() * 200) - 100 }, 1000)
                                    .call(function (evt) {
                                        var theThingBeingTweened = evt.target;
                                        self.stage.removeChild(theThingBeingTweened);
                                    });

                    madeLaser = true;

                }
                function enemyShootLaser() {
                    if (enemies.length > 0) {
                        var enemyindex = Math.floor(Math.random() * enemies.length)
                        var theenemy = enemies[enemyindex];

                        if (theenemy) {
                            makeLaser(theenemy);
                        }
                        else {
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
                            //beam mapped to spacebar
                        case KEYCODE_SPACEBAR:
                            if (beamdelay <= 0) {
                                beamdelay = 30
                                makeBeam();
                            }

                            event.preventDefault();
                            break;

                    }

                    function moveRight() {
                        // Console.log("in move right")
                        playerContainer.x += playerMovement;
                        if (playerContainer.x > 730) {
                            playerContainer.x = 730
                        }
                    }

                    function moveLeft() {
                        // console.log(playerContainer.x)
                        playerContainer.x -= playerMovement;
                        if (playerContainer.x < 20) {
                            playerContainer.x = 20
                        }

                    }

                    //blow up the squid when the beam hits the squid
                    function onBeamContainerTweenChange(evt) {
                        var theTween = evt.target;
                        var theBeamContainer = theTween.target;
                        for (var i = 0; i < enemies.length; ++i) {

                            var pt = enemies[i].globalToLocal(theBeamContainer.x, theBeamContainer.y);

                            if (enemies[i].hitTest(pt.x, pt.y)) {

                                // we hit the enemy... KILL IT!

                                createjs.Tween.get(enemies[i])
                                                .to({ scaleX: 1.25, scaleY: 1.25 }, 200)
                                                .to({ scaleX: 1, scaleY: 1 }, 100)
                                                .to({ alpha: 0 }, 100)
                                                .call(function (evt) {
                                                    stage.removeChild(evt.currentTarget);
                                                });


                                // remove it from the array
                                enemies.splice(i, 1);


                                // we removed an item from the array, fix the index so we dont skip checking any enemies.
                                --i;
                            }
                        }
                    }


                    function makeBeam() {

                        console.log("making beam")
                        beamContainer = new createjs.Container();
                        beam = new createjs.Bitmap(queue.getResult("beam"));
                        beamContainer.addChild(beam);
                        self.stage.addChild(beamContainer);

                        beamContainer.x = playerContainer.x + 9;
                        beamContainer.y = 500;

                        //when beam hits the squid
                        createjs.Tween.get(beamContainer, {
                            onChange: onBeamContainerTweenChange
                        })
                                      .to({ y: -200 }, 500)
                                       .call(function (evt) {
                                           var theThingBeingTweened = evt.target;
                                           self.stage.removeChild(theThingBeingTweened);
                                       });

                        madeBeam = true;

                    }
                }
            }




            var madeBeam = false;
            var madeLaser = false;

            function spawnEnemy() {
                //spawn enemies
                console.log("made enemy")
                enemyContainer = makeEnemy();
                enemies.push(enemyContainer);
                enemyContainer.x = Math.random() * (self.stage.canvas.width - widthOfSquid);
                enemyContainer.y = 100


                createjs.Tween.get(enemyContainer, { loop: true })
                    .to({ x: 50 }, 5000)
                    
                    .to({ rotation: 360 }, 1000)
                 //   .to({x:Math.random()})
                    .to({ x: self.stage.canvas.width - widthOfSquid}, 10000)
                    

                self.stage.addChild(enemyContainer);
            }

            //load enemy
            function makeEnemy() {
                var container = new createjs.Container();
                var enemy = new createjs.Bitmap(queue.getResult("enemy"));
                container.addChild(enemy);
                return container;
            }

            function deliverQuestions() {

            }
            function deliverAnswers() {

            }


            function gameOverScreen() {

            }

            function DisplayEndingNotes(EndedHow) {
                replayContainer.addEventListener("click", handleClick);
                function handleClick(event) {
                    StartitALL()
                }
            }

            var fps = 30;

            //this updates the stage every tick not sure if we need it but
            createjs.Ticker.addEventListener("tick", handleTick);
            createjs.Ticker.on("tick", handleTick);
            createjs.Ticker.setFPS(fps);

            function handleTick(event) {
                if (beamdelay > 0)
                    beamdelay--
                self.stage.update();

            }

        }
    }
    return Game;
})(createjs);

