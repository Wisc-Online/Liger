﻿
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
                { id: "background", src: assetsPath + "backgroundship.jpg" },
                { id: "panel", src: assetsPath + "Panel.png" },
                { id: "playbutton", src: assetsPath + "SequencePlayButton.png" },
                { id: "pirate", src: assetsPath + "pirate.png" },
                { id: "enemy", src: assetsPath + "enemy.png" },
                { id: "harpoon", src: assetsPath + "harpoon.png" },
                { id: "inksplat", src: assetsPath + "inksplat.png" },
                { id: "questionPanel", src: assetsPath + "SmallPanel.png" },
                { id: "feedbackPanel", src: assetsPath + "SmallPanel2.png" },
                { id: "redx", src: assetsPath + "redx.png" },
                { id: "answerHolder", src: assetsPath + "answerHolder.png" },
                { id: "logo", src: assetsPath + "Logo.png" },
                { id: "treasure", src: assetsPath + "treasure.png" },
                { id: "piratesprite", src: assetsPath + "piratesprite.png" }

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

                titleText = new createjs.Text(gameData.Title, " Bold 30px Alegreya", "#000000");
                titleText.x = panelBG.x + 75;
                titleText.y = panelBG.y + 50;

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))

                playButton.regX = 97;
                playButton.regY = 100;
                playButton.x = panelBG.x + 550;
                playButton.y = panelBG.y + 300;
                playButton.scaleX = playButton.scaleY = 0.20;

                var descriptionText = new createjs.Text(gameData.Description, "20px Alegreya", "#000000");
                descriptionText.x = panelBG.x + 75;
                descriptionText.y = panelBG.y + 100;

                var directionsText = new createjs.Text("Directions:" + " " + gameData.Directions, "20px Alegreya", "#000000");
                directionsText.x = panelBG.x + 75;
                directionsText.y = panelBG.y + 150;

                var logo = new createjs.Bitmap(queue.getResult("logo"))

                logo.regX = 180;
                logo.regY = 60;
                logo.x = panelBG.x + 220;
                logo.y = panelBG.y + 210;
                logo.scaleX = logo.scaleY = 0.40;

                instructionsScreen.addChild(panelBG, titleText, descriptionText, directionsText, logo, playButton);
                createjs.Tween.get(playButton, { loop: false }).to({ rotation: 360, scaleX: .4, scaleY: .4 }, 2000);
                self.stage.addChild(instructionsScreen);

                playButton.addEventListener("click", handleClick);
                function handleClick(event) {
                    self.stage.removeChild(instructionsScreen);

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

            var playerMovement = 0.60; //player speed
            var playerMaximumVelocity = 2;
            var playerVelocityX = 0;
            var playerVelocityY = 0;
            var playerMovementFriction = .98;

            var playerContainer;
           

            var currentQuestionNumber = 0;

            //var spriteSheet;
            //var redgreenXPos = 200;
            //var redgreenYPos = 200;
            //var animation;

            /////////////////////////////////looking to add spritesheets/////////////////////
            //////////////////////////looking to finish artwork ///////
            ////////////////////looking to finish json and keep track of high score//////////
            //////add audio?/////
            ////endgame screen after all questions delivered + answered //


            function printHarpoonCount() {
                harpoonCountLabel.text = " " + harpoonCount;

            }


            function StartInteraction() {

                //load pirate
                playerContainer = new createjs.Container();
                var speed = .02;
                var data = {
                    images: [queue.getResult("piratesprite")],
                    frames: {
                        width: 60,
                        height: 100,
                        frames: 4,
                    }
                    ,
                    animations: {
                        pegleg: [0, 3, "pegleg", speed],
                    },
                };

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "pegleg");
                playerContainer.addChild(sprite);
                self.stage.addChild(playerContainer);
                playerContainer.x = 400;
                playerContainer.y = 500;

                //load controls
                this.document.onkeydown = keyPressed;
                var KEYCODE_LEFT = 37, KEYCODE_RIGHT = 39, KEYCODE_SPACEBAR = 32, KEYCODE_UP = 38, KEYCODE_DOWN = 40

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
                            //  printHarpoonCount();
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
                                .to({ scaleX: 1.25, scaleY: 1.25 }, 200)
                                .to({ scaleX: 1, scaleY: 1, rotation: 360 }, 1000)

                                .to({ alpha: 0 }, 100)

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

                function makeInk(theenemy) {

                    console.log("making ink")
                  //  inkContainer = new createjs.Container();

                    //load sprite
                    inkContainer = new createjs.Container();
                    var speed = .02;
                    var data = {
                        images: [queue.getResult("inksplat")],
                        frames: {
                            width: 50,
                            height: 50,
                            frames: 2,
                        }
                        ,
                        animations: {
                            splatter: [0, 1, "splatter", speed],
                        },
                    };

                    var spriteSheet = new createjs.SpriteSheet(data);
                    var sprite = new createjs.Sprite(spriteSheet, "splatter");
                    inkContainer.addChild(sprite);
                    self.stage.addChild(inkContainer);


                    inkContainer.x = theenemy.x;
                    inkContainer.y = theenemy.y;


                  //  ink = new createjs.Bitmap(queue.getResult("ink"));
                  //  inkContainer.addChild(ink);
                 //   self.stage.addChild(inkContainer);

                    //when ink hits the player
                    createjs.Tween.get(inkContainer, {
                        onChange: onInkContainerTweenChange
                    })
                        //add a .to for the y  //// self.stage.canvas.height

                        ////add new tween for ink here //http://andysaia.com/blog/tweenjs/
                        .to({ y: playerContainer.y + (Math.random() * 200 - 100), x: playerContainer.x + (Math.random() * 200) }, 8000)
                        .call(function (evt) {
                            var theThingBeingTweened = evt.target;
                           
                          //  inkContainer.goToAndPlay("splatter");

                            self.stage.removeChild(theThingBeingTweened);
                            //this is where im going to add ink splat sprite
                            // add child or call a function that adds the sprite
                            //self.stage.addChild()
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
                            //map harpoon to spacebar
                        case KEYCODE_SPACEBAR:
                            if (harpoondelay <= 0) {
                                harpoondelay = 30

                                if (harpoonCount > 0) {
                                    makeHarpoon();
                                    harpoonCount--;
                                    console.log(harpoonCount);

                                    printHarpoonCount();
                                }
                                if (harpoonCount == 0 && !isQuestionDisplayed) {
                                    printHarpoonCount();
                                    deliverQuestion(gameData.Questions[currentQuestionNumber]);
                                }

                              //    printHarpoonCount();
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
                                    .to({ y: -200 }, 5000, createjs.Ease.bounceInOut)
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
                enemyContainer = makeEnemy();
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
                    .to({ alpha: 1, scaleX: 0.5, scaleY: 0.5 }, 2000)
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
                        success: function (x) {
                        },
                        error: function (x, y, z) {
                        }
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
                questionPanel.scaleX = 2;
                questionPanel.scaleY = 1.8;
                questionPanel.x = 50;
                questionPanel.y = 32;

                var questionsText = new createjs.Text("Question:" + " " + question.Text, "Bold 20px Alegreya", "#000000");
                questionsText.x = questionPanel.x + 70;
                questionsText.y = questionPanel.y + 45;

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

                for (var j = 0 ; j < gameData.Questions[0].Answers.length; j++) {
                    console.log("answers")
                    var answersText = new createjs.Text("Answer:" + " " + question.Answers[j].Text, "16px Alegreya", "#000000");
                    var answerContainer = new createjs.Container();

                    var answerHolder = new createjs.Bitmap(queue.getResult("answerHolder"))
                    answersText.x = questionPanel.x + 90;
                    answersText.y = questionPanel.y + 60 + stackIncrement;


                    answerHolder.scaleX = 1.8;

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
                                deliverFeedback("correct");
                            }
                            else {
                                //    alert("incorrect" + evt.currentTarget.IsCorrect);
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
                feedbackPanel.scaleX = 2;
                feedbackPanel.scaleY = .75;
                feedbackPanel.x = 50;
                feedbackPanel.y = 410;

                //add harpoon count
                //this will be the correct answer
                if (answerstatus == "correct") {
                    feedbackText = new createjs.Text("Correct. Click the what ever to continue", "20px Alegreya", "#000000");
                } else {

                    for (var i = 0; i < gameData.Questions[currentQuestionNumber].Answers.length; i++) {
                        if (gameData.Questions[currentQuestionNumber].Answers[i].IsCorrect == true) {
                            feedbackText = new createjs.Text("I'm sorry the correct answer is, " + gameData.Questions[currentQuestionNumber].Answers[i].Text, "20px Alegrea", '#000000')
                        }
                    }

                    //  feedbackText = new createjs.Text("InCorrect:" + " " + gameData.Questions, "20px Alegreya", "#FFFFFF");
                }


                feedbackText.x = feedbackPanel.x + 100
                feedbackText.y = feedbackPanel.y + 40

                var redx = new createjs.Bitmap(queue.getResult("redx"))
                redx.x = feedbackPanel.x + 560;
                redx.y = feedbackPanel.y + 90;

                redx.addEventListener("click", handleClick);


                function handleClick(event) {

                    //create an if statement, if question iscorrect, netcount 5, if incorrect, netcount 0
                    currentQuestionNumber++;
                    self.stage.removeChild(feedbackContainer);
                    harpoonCount = 10;
                    canEnemyFire = true;
                    isQuestionDisplayed = false;
                    isFeedbackDisplayed = false;
                    isEnemySpawnedEnabled = true;
                    self.stage.removeChild(questionContainer);
                    self.stage.removeChild(answerContainersParent);

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

                initializeGame();  //wow that was easy
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
                    else if (playerContainer.y > 500)
                        playerContainer.y = 500;
                }
            }

        }
    }
    return Game;
})(createjs);

