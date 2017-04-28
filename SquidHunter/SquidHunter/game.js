
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
                { id: "pirate", src: assetsPath + "pirate.png" },
                { id: "enemy", src: assetsPath + "enemy.png" },
                { id: "net", src: assetsPath + "net.png" },
                { id: "ink", src: assetsPath + "ink.png" },
                { id: "questionPanel", src: assetsPath + "SmallPanel.png" },
                { id: "feedbackPanel", src: assetsPath + "SmallPanel2.png" },
                { id: "redx", src: assetsPath + "redx.png" },
                { id: "answerHolder", src: assetsPath + "answerHolder.png" }

             

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
            //load introduction screen/play button
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

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 80;
                descriptionText.y = panelBG.y + 100;

                var directionsText = new createjs.Text("Directions:" + " " + gameData.Directions, "20px Alegreya", "#000000");
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
            var netContainer;
            var net;
            var inkContainer;
            var ink;
            var netdelay = 0;
            var inkdelay = 0;

            var enemyContainer;
            var enemies = [];
            var widthOfSquid = 50;
            var maxEnemyCount = 5;
            var isEnemySpawnedEnabled = true;
            var netCount = 10;

            var canEnemyFire = true;

            var isQuestionDisplayed = false;
            var questionArray = [];

            var isFeedbackDisplayed = false;
            var feedbackArray = [];

            var pausedGame = false; //not used yet

            var Score = 0; //not used yet
            var scoreLabel;

            var playerMovement = 0.75; //player speed
            var playerMaximumVelocity = 2;
            var playerVelocityX = 0;
            var playerVelocityY = 0;
            var playerMovementFriction = .98;

            var playerContainer;

            var currentQuestion = 0;


            function StartInteraction() {

                // load player
                playerContainer = new createjs.Container();
                var player = new createjs.Bitmap(queue.getResult("pirate"))


                playerContainer.addChild(player)

                //load controls
                this.document.onkeydown = keyPressed;
                var KEYCODE_LEFT = 37, KEYCODE_RIGHT = 39, KEYCODE_SPACEBAR = 32, KEYCODE_UP = 38, KEYCODE_DOWN = 40

                self.stage.addChild(playerContainer);
                playerContainer.x = 400;
                playerContainer.y = 550;

                spawnEnemy();

                scoreLabel = new createjs.Text("Score: " + Score, "bold 16px Alegreya", "#000000");
                scoreLabel.textAlign = "center";
                scoreLabel.lineWidth = 270;
                scoreLabel.color = "black";
                scoreLabel.y = 30;
                scoreLabel.x = 740;

                self.stage.addChild(scoreLabel);

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
                            deliverQuestion(gameData.Questions[currentQuestion]);
                            Score = Score - 20;
                            printScore();
                            //deliver answers?
                        }
                        //  isQuestionDisplayed = false

                    }
                }

                function printScore() {
                    //self.stage.removeChild(scoreLabel);
                    scoreLabel.text = "Score: " + Score;

                }


                //blow up the squid when the net hits the squid
                function onNetContainerTweenChange(evt) {
                    var theTween = evt.target;
                    var theNetContainer = theTween.target;
                    for (var i = 0; i < enemies.length; ++i) {

                        var pt = enemies[i].globalToLocal(theNetContainer.x, theNetContainer.y);

                        if (enemies[i].hitTest(pt.x, pt.y)) {

                            // we hit the enemy... KILL IT!
                            createjs.Tween.get(enemies[i])
                                .to({ scaleX: 1.25, scaleY: 1.25 }, 200)
                                .to({ scaleX: 1, scaleY: 1 }, 100)
                                .to({ alpha: 0 }, 100)
                                .call(function (evt) {
                                    stage.removeChild(evt.currentTarget);

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
                        }
                    }
                }

                function makeInk(theenemy) {

                    console.log("making ink")
                    inkContainer = new createjs.Container();
                    ink = new createjs.Bitmap(queue.getResult("ink"));
                    inkContainer.addChild(ink);
                    self.stage.addChild(inkContainer);

                    inkContainer.x = theenemy.x;
                    inkContainer.y = theenemy.y;

                    //when ink hits the player
                    createjs.Tween.get(inkContainer, {
                        onChange: onInkContainerTweenChange
                    })
                        //add a .to for the y  //// self.stage.canvas.height
                        .to({ y: playerContainer.y + (Math.random() * 200 - 100) , x: playerContainer.x + (Math.random() * 200) - 100 }, 4000)
                        .call(function (evt) {
                            var theThingBeingTweened = evt.target;
                            self.stage.removeChild(theThingBeingTweened);
                        });

                    madeInk = true;
                }

                function enemyShootInk() {
                    if (enemies.length > 0) {
                        var enemyindex = Math.floor(Math.random() * enemies.length)
                        var theenemy = enemies[enemyindex];


                        if (canEnemyFire && theenemy) {
                            makeInk(theenemy);
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
                        case KEYCODE_UP:
                            moveUp();
                            event.preventDefault();
                            break;
                        case KEYCODE_DOWN:
                            moveDown();
                            event.preventDefault();
                            break;
                            //map net to spacebar
                        case KEYCODE_SPACEBAR:
                            if (netdelay <= 0) {
                                netdelay = 30

                                if (netCount > 0) {
                                    makeNet();
                                    netCount--
                                }
                                if (netCount == 0 && !isQuestionDisplayed) {
                                    deliverQuestion(gameData.Questions[currentQuestion]);
                                }

                                event.preventDefault();
                                break;
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



                            //only called when enough net available
                            function makeNet() {

                                console.log("making net")
                                netContainer = new createjs.Container();
                                net = new createjs.Bitmap(queue.getResult("net"));
                                netContainer.addChild(net);


                                self.stage.addChild(netContainer);

                                netContainer.x = playerContainer.x + 9;
                                netContainer.y = playerContainer.y + 9;

                                //when net hits the squid
                                createjs.Tween.get(netContainer, {
                                    onChange: onNetContainerTweenChange
                                })
                                    .to({ y: -200 }, 500)
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
                enemyContainer = makeEnemy();
                enemyContainer.scaleX = 0;
                enemyContainer.scaleY = 0;
                enemyContainer.alpha = 0;

                //enemy functionality
                do {
                    enemyContainer.y = 30 + (Math.floor((Math.random() * maxEnemyCount)) * 50);
                } while (isEnemyAtY(enemyContainer.y));

                enemies.push(enemyContainer);

                if (enemies.length == maxEnemyCount)
                    isEnemySpawnedEnabled = false;

                enemyContainer.x = 50 + Math.random() * (self.stage.canvas.width - widthOfSquid / 2);

                var totalTime = 3000;
                var totalWidth = self.stage.canvas.width - (widthOfSquid / 2) - 50;
                var timeToTake = (enemyContainer.x / totalWidth) * totalTime;

                createjs.Tween.get(enemyContainer)
                    .to({ alpha: 1, scaleX: 0.5, scaleY: 0.5 }, 1000)
                    .wait(100)
                    .to({ x: 50 }, timeToTake, createjs.Ease.sinInOut)
                    .call(function (evt) {
                        createjs.Tween.get(evt.target, { loop: true })
                            .to({ x: totalWidth }, totalTime, createjs.Ease.sinInOut)
                            .to({ x: 50 }, totalTime, createjs.Ease.sinInOut);
                    })

                self.stage.addChild(enemyContainer);
            }

            //load enemy
            function makeEnemy() {
                var container = new createjs.Container();
                var enemy = new createjs.Bitmap(queue.getResult("enemy"));
                enemy.x = -100;
                enemy.y = -56.5;

                container.addChild(enemy);
                return container;
            }
            var questionPanel;
            var questionContainer

            //deliver questions when player is by ink
            function deliverQuestion(question) {
                
                isEnemySpawnedEnabled = false;
                canEnemyFire = false;

                questionContainer = new createjs.Container();
                questionPanel = new createjs.Bitmap(queue.getResult("questionPanel"));
                isQuestionDisplayed = true;
                questionPanel.scaleX = 2;
                questionPanel.scaleY = 2;
                questionPanel.x = 50;
                questionPanel.y = 50;

                var questionsText = new createjs.Text("Question:" + " " + question.Text, "20px Alegreya", "#FFFFFF");
                questionsText.x = questionPanel.x + 50;
                questionsText.y = questionPanel.y + 35;

                questionContainer.name = "question";
                questionContainer.addChild(questionPanel, questionsText)

                self.stage.addChild(questionContainer);
                deliverAnswers(question);

                return questionContainer;

            }

            function deliverAnswers(question) {
                var stackIncrement = 50;
                var answerContainersParent = new createjs.Container();
                answerContainersParent.name = "parent";

                for (var j = 0 ; j < gameData.Questions[0].Answers.length; j++) {
                    console.log("answers")
                    var answersText = new createjs.Text("Answer:" + " " + question.Answers[j].Text, "16px Alegreya", "#000000");
                    var answerContainer = new createjs.Container();

                    var answerHolder = new createjs.Bitmap(queue.getResult("answerHolder"))
                    answersText.x = questionPanel.x + 50;
                    answersText.y = questionPanel.y + 50 + stackIncrement;

                    answerHolder.scaleX = 2;

                    answerHolder.x = answersText.x;
                    answerHolder.y = answersText.y;
                    
                    answerContainer.name = "child";
                    answerContainer.IsCorrect = question.Answers[j].IsCorrect;
                    answerContainer.Idx = j;

                    answerContainer.addChild(answerHolder, answersText);
                    
                    stackIncrement += 50;

                    answerContainer.addEventListener("pressup", function (evt) {
                     //   alert(evt.target);
                        console.log("clicked that thing")
                        
                        if (evt.currentTarget.IsCorrect) {
                            alert("correct")
                        }
                        else
                            alert("incorrect" + evt.currentTarget.IsCorrect);

                       // deliverFeedback();
                        event.stopPropagation();
                      //  self.stage.removeChild(questionContainer);
                      //  self.stage.removeChild(answerContainersParent);
                        
                        //check if this is the last question, if yes- exit the game
                        // if not increment current question index
                        currentQuestion++;
                    });
                    answerContainersParent.addChild(answerContainer);
                }

                self.stage.addChild(answerContainersParent);

            }
            function deliverFeedback() {
                var feedbackContainer = new createjs.Container();
                var feedbackPanel = new createjs.Bitmap(queue.getResult("feedbackPanel"));
                isFeedbackDisplayed = true;
                feedbackPanel.scaleX = 2;
                feedbackPanel.x = 50;
                feedbackPanel.y = 400;


                //add net count
                //this will be the correct answer
             var feedbackText = new createjs.Text("Correct:" + " " + gameData.Questions, "20px Alegreya", "#FFFFFF");


                feedbackText.x = feedbackPanel.x + 50
                feedbackText.y = feedbackPanel.y + 35

                var redx = new createjs.Bitmap(queue.getResult("redx"))
                redx.x = feedbackPanel.x + 580;
                redx.y = feedbackPanel.y + 130;

                redx.addEventListener("click", handleClick);
                function handleClick(event) {
                    self.stage.removeChild(feedbackContainer);
                    netCount = 10;
                    canEnemyFire = true;
                    isQuestionDisplayed = false;
                    isEnemySpawnedEnabled = true;

                }

                feedbackContainer.addChild(feedbackPanel, feedbackText, redx)
                self.stage.addChild(feedbackContainer);

                var redx = new createjs.Bitmap(queue.getResult("redx"))



                return feedbackContainer;


            }
            function gameOverScreen() {

            }
            function DisplayEndingNotes(EndedHow) {
                replayContainer.addEventListener("click", handleClick);
                function handleClick(event) {
                    StartitALL()
                }
            }

            function pauseGame() {

            }

            var fps = 45;

            //this updates the stage every tick not sure if we need it but
            createjs.Ticker.addEventListener("tick", handleTick);
            createjs.Ticker.on("tick", handleTick);
            createjs.Ticker.setFPS(fps);

            function handleTick(event) {
                if (netdelay > 0)
                    netdelay--

                playerVelocityX = playerVelocityX * playerMovementFriction;
                playerVelocityY = playerVelocityY * playerMovementFriction;

                movePlayerContainer();

                self.stage.update();
            }

            function movePlayerContainer() {
                if (playerContainer) {
                    playerContainer.x += playerVelocityX;
                    playerContainer.y += playerVelocityY;

                    if (playerContainer.x < 20)
                        playerContainer.x = 20;
                    else if (playerContainer.x > 730)
                        playerContainer.x = 730;

                    if (playerContainer.y < 400)
                        playerContainer.y = 400;
                    else if (playerContainer.y > 550)
                        playerContainer.y = 550;
                }
            }

        }
    }
    return Game;
})(createjs);

