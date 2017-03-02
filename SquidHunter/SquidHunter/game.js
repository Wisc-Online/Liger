/// <reference path="//code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs) {
    //alert("Game starting");

    function Game(canvas, gameData) {
        StartitALL()
        function StartitALL() {
            ////++++++++++++   Create a stage by getting a reference to the canvas   +++++++++++++++
            // Game variables

            var self = this;
            self.stage = new createjs.Stage(canvas);
            var stageBG = new createjs.Shape();
            stageBG.name = "stageBG";
            stageBG.graphics.setStrokeStyle(3).beginStroke("black").beginFill("silver").drawRect(0, 0, 800, 600).endStroke().endFill();
            self.stage.addChild(stageBG);
            createjs.Touch.enable(self.stage, false, true);
            self.stage.enableMouseOver(25);
            self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

            //++++++++++++++++++ SCORM CODE ++++++++++++++++++++++++

            var isLmsConnected = false;
            var currentLmsInteraction = null;

            if (typeof ScormHelper !== 'undefined') {
                isLmsConnected = ScormHelper.initialize();
            }

            var quit;

            if (isLmsConnected) {
                quit = function () {
                    ScormHelper.cmi.exit("");
                    ScormHelper.adl.nav.request("exitAll");
                    ScormHelper.terminate();
                }
            }
            else {
                quit = function () {
                    window.location = "http://www.wisc-online.com";
                }
            }
            //++++++++++++++++++   END SCORM   ++++++++++++++++++++++

            // ***********     Declair all assests and preload them. ************************
            var assetsPath = gameData.assetsPath || "";

            assetsPath += "Assets/"
            var originalOrdedList = [];
            var correctlySortedSubset = [];
            var randomTermsForUserSorting = [];
            var usedQuestions = [];


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


            var assets = [

                { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
                { id: "clockBack", src: assetsPath + "clockBack.png" },
                { id: "clockHand", src: assetsPath + "clockHand.png" },
                //{ id: "background", src: assetsPath + "greenback.png" },
                { id: "background", src: assetsPath + "Capture.PNG" },
                { id: "snakeHead", src: assetsPath + "SnakeHead.png" },
                { id: "snakeBody", src: assetsPath + "snakeBody.png" },
                { id: "snakeTail", src: assetsPath + "snakeTail.png" },
                { id: "snakeCandyImage", src: assetsPath + "snakeCandy.png" },
                { id: "buttonClick", src: assetsPath + "click.mp3" },
                { id: "gameOver", src: assetsPath + "GameOver.mp3" },
                { id: "restart_button", src: assetsPath + "button.png" },
                { id: "Pill", src: assetsPath + "BrownPill.png" },
                { id: "Snack", src: assetsPath + "donut.png" },
                { id: "Snack2", src: assetsPath + "IceCreamBar.png" },
                { id: "HalfEatenIceCreamBar", src: assetsPath + "HalfEatenIceCreamBar.png" },
                { id: "Ghost", src: assetsPath + "Ghost.png" },
                { id: "smoke", src: assetsPath + "smoke.png" },
                { id: "star", src: assetsPath + "star.png" },
                { id: "panel", src: assetsPath + "Panel.png" },
                { id: "sm_panel", src: assetsPath + "SmallPanel.png" },
                { id: "levelup", src: assetsPath + "level-up.mp3" }
            ];

            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                addBackground();
            });
            queue.loadManifest(assets);

            function addBackground() {
                self.stage.removeAllChildren();
                var gameBackground = new createjs.Container();
                gameBackground.x = 0;
                gameBackground.y = 0;
                var dirBackgroundImage = new createjs.Bitmap(queue.getResult("background"));
                gameBackground.addChild(dirBackgroundImage);
                //var dirBorderImage = new createjs.Bitmap(queue.getResult("border"));
                //dirBackgroundImage.x = 200;
                //dirBackgroundImage.y = 200;
                //gameBackground.addChild(dirBackgroundImage);

                self.stage.addChild(gameBackground);
                introductionScreen();
            }

            function introductionScreen() {
                var instructionScreen = new createjs.Container();

                titleText = new createjs.Text(gameData.Title, "18px Arial", "#ffffff");
                titleText.x = 90;
                titleText.y = 75;
                titleText.lineWidth = 600;

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 40;
                panelBG.y = 50;

                var startButton = new createjs.Bitmap(queue.getResult("start_button"));

                startButton.regX = 93;
                startButton.regY = 95;
                startButton.x = 650;
                startButton.y = 350;
                startButton.scaleX = startButton.scaleY = 0.20;

                var directionsScreen = new createjs.Container();

                //displaybox = new createjs.Shape();
                //displaybox.graphics.beginFill("#ffba3e").drawRoundRect(0, 0, 380, 200, 8);
                //displaybox.name = "DirectionsBox";
                //displaybox.x = 25;
                //displaybox.y = 200;

                var label = new createjs.Text("Directions  \nDirect the snake to the correct answer by using your arrow keys. Collect the snacks if you can for extra points. Avoid the red spikes around the edge of the game board. Press the play button to begin.", "bold 20px Arial", "#000000");
                // label.textAlign = "center";
                label.lineHeight = "30";
                label.lineWidth = 500;
                label.y = 140;
                label.x = 90;
                //label.y = displaybox.y + 5;
                //label.x = displaybox.x + 190;

                instructionScreen.addChild(panelBG, startButton, label, titleText);
                createjs.Tween.get(startButton, { loop: false }).to({ rotation: 360, scaleX: .4, scaleY: .4 }, 2000);
                self.stage.addChild(instructionScreen);

                instructionScreen.addEventListener("click", handleClick);
                function handleClick(event) {
                    //console.log("clicked it");
                    self.stage.removeChild(instructionScreen);

                    StartInteraction();
                };

            }

            var gameIsRunning = false;
            var snakeGameContainer = new createjs.Container();
            var snakePlayerContainer = new createjs.Container();
            var snakeCandyContainer = new createjs.Container();
            var snakeCandy;
            var isMovingLeft = false;
            var isMovingRight = true;
            var isMovingUp = false;
            var isMovingDown = false;
            var questionContainerBool = false;
            var locations = [];

            var Score;
            var scoreTick;
            var tick;
            var scoreLabel;
            var speed;

            if (Score == null) {
                Score = 0;
            }

            if (scoreTick == null) {
                scoreTick = 0;
            }
            if (tick == null) {
                tick = 0;
            }

            var snakeSquareSize = 10;
            var snakePlayingBoardWidth = 78;
            var snakePlayingBoardHeight = 58;

            snakeGameContainer.x = snakeSquareSize;
            snakeGameContainer.y = snakeSquareSize;
            var questionsArray = [];
            var onThisQuestionNumber = 0;
            var answersContainer;
            var answerText;
            var answersArray = [];
            var pausedGame = false;
            var questionContainer = new createjs.Container();
            var answersContainer2 = new createjs.Container();

            var randomCandyContainer;
            var randomCandyBorder;
            var randomCandyBorder2;
            var randomGhostBorder;
            var randomCandyDecider;
            var randomGhostDecider;
            var correctMultiplier;
            var smoke;
            var star;
            var halfEaten;
            var KillAnimation;
            var image;
            var questionsAnswered = 0;

            var currentHeadArrayX = [];
            var currentHeadArrayY = [];

            if (correctMultiplier == null) {
                correctMultiplier = 0;
            }


            function StartInteraction() {



                if (smoke != null) {
                    self.stage.removeChild(smoke);
                    KillAnimation = false;
                }

                if (star != null) {
                    self.stage.removeChild(star);
                    KillAnimation = false;
                }

                if (halfEaten != null) {
                    self.stage.removeChild(halfEaten);
                    KillAnimation = false;
                }

                printScore();




                function deliverQuestions() {
                    IsCheckIfEatingFoodFunctionRunning = true;
                    if (pausedGame == false) {

                        if (questionsArray.length == 0) {

                            questionsArray = gameData.Questions;
                        }
                        // var questionContainer = new createjs.Container();
                        if (onThisQuestionNumber < questionsArray.length) {

                            questionbox = new createjs.Shape();
                            questionbox.graphics.beginFill("#E6E6E6").drawRoundRect(0, 0, 660, 50, 8);
                            questionbox.name = "questionbox";
                            questionbox.x = 25;
                            questionbox.y = 10;

                            var questionText = new createjs.Text(questionsArray[onThisQuestionNumber].Text, "bold 14px Arial", "#000000");
                            questionText.lineWidth = 650;
                            questionText.y = questionbox.y + 5;
                            questionText.x = questionbox.x + 5;

                            if (questionText.length <= 55) {
                                questionText.font = "bold 24px Arial";
                            }
                            if (questionText.length >= 150) {
                                questionText.font = "bold 12px Arial";
                            }

                            questionContainer.addChild(questionbox, questionText);
                            self.stage.addChild(questionContainer);

                            pausedGame = true;

                            setTimeout(deliverAnswers, 2000);

                            setTimeout(unpauseGame, 2000);

                            function unpauseGame() {
                                pausedGame = false;
                            }
                        }
                    }
                }

                function deliverAnswers() {

                    for (var i = 0; i < questionsArray[onThisQuestionNumber].Answers.length; i++) {
                        answersContainer = new createjs.Container();
                        answerText = new createjs.Text(questionsArray[onThisQuestionNumber].Answers[i].Text, "bold 12px Arial", "#000000");
                        answerText.textAlign = "center";
                        answerText.lineWidth = 125;

                        var answerString = answerText.text;

                        //if (answerString.length > 16) {
                        //    answerText.font = "bold 14px Arial";
                        //    if (answerString.length > 22) {
                        //        answerText.font = "bold 14px Arial";
                        //        if (answerString.length > 35) {
                        //            answerText.font = "bold 12px Arial";
                        //        }
                        //    }
                        //}

                        answerText;


                        if (currenthead != null) {
                            currentHeadArrayX = image.x;
                            currentHeadArrayY = image.y;
                        }

                        var isNearTheHead = false;


                        if (i == 0) {
                            do {
                                answerText.y = Math.floor((Math.random() * 43) + 7) * 5;
                                //answerText.x = Math.floor((Math.random() * 55) + 0) * 5;
                                answerText.x = Math.floor((Math.random() * 60) + 0) * 5;
                            } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);

                            if (randomCandyContainer != null) {
                                do {
                                    do {
                                        answerText.y = Math.floor((Math.random() * 43) + 7) * 5;
                                        answerText.x = Math.floor((Math.random() * 55) + 0) * 5;
                                    } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                                } while (answerText.x >= randomCandyContainer.x - 20 && answerText.x <= randomCandyContainer.x + 20 || answerText.y >= randomCandyContainer.y - 20 && answerText.y <= randomCandyContainer.y + 20)
                            }

                            if (answerText.x < 60) {
                                answerText.x = answerText.x + 60;
                            }

                            if (answerText.y < 60) {
                                answerText.y = 60;
                            }

                        }
                        if (i == 1) {
                            do {
                                do {
                                    answerText.y = Math.floor((Math.random() * 43) + 7) * 10;
                                } while (answerText.y < 300);
                                answerText.x = Math.floor((Math.random() * 55) + 0) * 5;
                            } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                            if (randomCandyContainer != null) {
                                do {
                                    do {
                                        do {
                                            answerText.y = Math.floor((Math.random() * 43) + 7) * 10;
                                        } while (answerText.y < 300);
                                        answerText.x = Math.floor((Math.random() * 55) + 0) * 5;
                                    } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                                } while (answerText.x >= randomCandyContainer.x - 20 && answerText.x <= randomCandyContainer.x + 20 || answerText.y >= randomCandyContainer.y - 20 && answerText.y <= randomCandyContainer.y + 20)
                            }

                            if (answerText.x < 60) {
                                answerText.x = answerText.x + 60;
                            }
                        }
                        if (i == 2) {
                            do {
                                answerText.y = Math.floor((Math.random() * 43) + 7) * 5;
                                do {
                                    answerText.x = Math.floor((Math.random() * 60) + 5) * 10;
                                } while (answerText.x < 365)
                            } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                            if (randomCandyContainer != null) {
                                do {
                                    do {
                                        answerText.y = Math.floor((Math.random() * 43) + 7) * 5;
                                        do {
                                            answerText.x = Math.floor((Math.random() * 60) + 5) * 10;
                                        } while (answerText.x < 365)
                                    } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                                } while (answerText.x >= randomCandyContainer.x - 20 && answerText.x <= randomCandyContainer.x + 20 || answerText.y >= randomCandyContainer.y - 20 && answerText.y <= randomCandyContainer.y + 20)
                            }

                            if (answerText.y < 60) {
                                answerText.y = 60;
                            }
                        }
                        if (i == 3) {
                            do {
                                do {
                                    answerText.y = Math.floor((Math.random() * 43) + 7) * 10;
                                    answerText.x = Math.floor((Math.random() * 60) + 5) * 10;
                                } while (answerText.y < 300 || answerText.x < 365);
                            } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                            if (randomCandyContainer != null) {
                                do {
                                    do {
                                        do {
                                            answerText.y = Math.floor((Math.random() * 43) + 7) * 10;
                                            answerText.x = Math.floor((Math.random() * 60) + 5) * 10;
                                        } while (answerText.y < 300 || answerText.x < 365);
                                    } while (answerText.x >= currentHeadArrayX - 70 && answerText.x <= currentHeadArrayX + 70 || answerText.y >= currentHeadArrayY - 70 && answerText.y <= currentHeadArrayY + 70);
                                } while (answerText.x >= randomCandyContainer.x - 20 && answerText.x <= randomCandyContainer.x + 20 || answerText.y >= randomCandyContainer.y - 20 && answerText.y <= randomCandyContainer.y + 20)
                            }
                        }

                        answerboarder = new createjs.Bitmap(queue.getResult("Pill"));

                        answerboarder.x = answerText.x - 75;
                        answerboarder.y = answerText.y - 20;

                        //if (answerText.text.length < 50) {
                        //    answerboarder.y = answerText.y - 9;
                        //}
                        //if (answerText.text.length < 45) {
                        //    answerboarder.y = answerText.y - 13;
                        //}
                        //if (answerText.text.length < 35) {
                        //    answerboarder.y = answerText.y - 15;
                        //}
                        //if (answerText.text.length < 25) {
                        //    answerboarder.y = answerText.y - 16;
                        //}
                        //if (answerText.text.length < 20) {
                        //    answerboarder.y = answerText.y - 17;
                        //}
                        //if (answerText.text.length < 15) {
                        //    answerboarder.y = answerText.y - 18;
                        //}
                        //if (answerText.text.length < 12) {
                        //    answerboarder.y = answerText.y - 22;
                        //}
                        //if (answerText.text.length < 10) {
                        //    answerboarder.y = answerText.y - 25;
                        //}

                        //randomCandyDecider = Math.floor(Math.random() * (5 + correctMultiplier - 0) + 0);
                        //randomGhostDecider = Math.floor(Math.random() * (3 - 0) + 0);
                        randomGhostDecider = 1;
                        randomCandyDecider = 7;


                        if (randomCandyContainer != null) {
                            randomCandyContainer = null;
                            self.stage.removeChild(randomCandyContainer);
                        }


                        randomCandyContainer = new createjs.Container();

                        if (randomCandyDecider == 1 || randomGhostDecider == 5) {
                            randomCandyBorder = new createjs.Bitmap(queue.getResult("Snack"));
                            do {
                                randomCandyBorder.y = Math.floor((Math.random() * 43) + 15) * 5;
                                randomCandyBorder.x = Math.floor((Math.random() * 64) + 5) * 5;
                            } while (randomCandyBorder.x < answerText.x + 15 && randomCandyBorder.x > answerText.x - 15 || randomCandyBorder.y < answerText.y + 25 && randomCandyBorder.y > answerText.y - 25);
                            randomCandyContainer.addChild(randomCandyBorder);
                            KillAnimation = false;
                        } else {
                            randomCandyBorder = null;
                        }
                        if (randomCandyDecider == 2 || randomGhostDecider == 6) {
                            randomCandyBorder2 = new createjs.Bitmap(queue.getResult("Snack2"));
                            do {
                                randomCandyBorder2.y = Math.floor((Math.random() * 43) + 15) * 5;
                                randomCandyBorder2.x = Math.floor((Math.random() * 64) + 5) * 5;
                            } while (randomCandyBorder2.x < answerText.x + 15 && randomCandyBorder2.x > answerText.x - 15 || randomCandyBorder2.y < answerText.y + 25 && randomCandyBorder2.y > answerText.y - 25);
                            randomCandyContainer.addChild(randomCandyBorder2);
                            KillAnimation = false;
                        } else {
                            randomCandyBorder2 = null;
                        }
                        if (randomCandyDecider == 3 && randomGhostDecider == 1 || randomCandyDecider == 7 && randomGhostDecider == 1) {
                            randomGhostBorder = new createjs.Bitmap(queue.getResult("Ghost"));
                            do {
                                randomGhostBorder.y = Math.floor((Math.random() * 43) + 15) * 5;
                                randomGhostBorder.x = Math.floor((Math.random() * 64) + 5) * 5;
                            } while (randomGhostBorder.x < answerText.x + 15 && randomGhostBorder.x > answerText.x - 15 || randomGhostBorder.y < answerText.y + 25 && randomGhostBorder.y > answerText.y - 25);
                            randomCandyContainer.addChild(randomGhostBorder);
                            KillAnimation = false;
                        } else {
                            randomGhostBorder = null;
                        }

                        //answerboarder.graphics.beginFill("#E6E6E6").drawRoundRect(answerText.x, answerText.y, 100, 20, 10);

                        answersContainer.addChild(answerboarder, answerText);
                        answersContainer.IsCorrect = questionsArray[onThisQuestionNumber].Answers[i].IsCorrect;
                        answersArray.push(answersContainer);
                        // self.stage.addChild(answersContainer);
                        answersContainer2.addChild(answersContainer);
                    }


                    if (questionContainerBool == true) {
                        self.stage.addChild(questionContainer);
                    }
                    //onThisQuestionNumber = onThisQuestionNumber + 1;
                    self.stage.addChild(answersContainer2);
                    questionContainerBool = true;
                    self.stage.removeChild(randomCandyContainer);
                    self.stage.addChild(randomCandyContainer);
                    self.stage.addChild(snakePlayerContainer);

                    clearInterval(speed);

                    if (Score < 20) {
                        speed = setInterval(function () {
                            if (gameIsRunning == true) {
                                movePlayer();
                                checkIfHitBorder();
                                checkIfHittingSelf();
                            }
                        }, 50);
                    } else if (Score >= 20 && Score < 50) {
                        speed = setInterval(function () {
                            if (gameIsRunning == true) {
                                movePlayer();
                                checkIfHitBorder();
                                checkIfHittingSelf();
                            }
                        }, 45);
                    } else if (Score >= 50 && Score < 75) {
                        speed = setInterval(function () {
                            if (gameIsRunning == true) {
                                movePlayer();
                                checkIfHitBorder();
                                checkIfHittingSelf();
                            }
                        }, 40);
                    } else if (Score >= 75) {
                        speed = setInterval(function () {
                            if (gameIsRunning == true) {
                                movePlayer();
                                checkIfHitBorder();
                                checkIfHittingSelf();
                            }
                        }, 35);
                    }

                }

                deliverQuestions();
                gameIsRunning = true;
                // snakeGameContainer.removeAllChildren();
                snakeGameContainer.addChild(snakePlayerContainer, snakeCandyContainer);
                self.stage.addChild(snakeGameContainer);
                //var self = this;
                player();
                this.document.onkeydown = keyPressed;

                // Clock();
                var KEYCODE_LEFT = 37, KEYCODE_RIGHT = 39, KEYCODE_UP = 38, KEYCODE_DOWN = 40;


                function keyPressed(event) {
                    // console.log(event.keyCode);

                    switch (event.keyCode) {
                        case KEYCODE_LEFT:
                            if (isMovingRight == false) {
                                moveLeft();
                                event.preventDefault();
                            }
                            break;
                        case KEYCODE_RIGHT:
                            if (isMovingLeft == false) {
                                moveRight();
                                event.preventDefault();
                            }
                            break;
                        case KEYCODE_UP:
                            if (isMovingDown == false) {
                                moveUp();
                                event.preventDefault();
                            }
                            break;
                        case KEYCODE_DOWN:
                            if (isMovingUp == false) {
                                moveDown();
                                event.preventDefault();
                            }
                            break;
                    }
                }

                StartPlayer();

                clearInterval(speed);

                if (Score < 20) {
                    speed = setInterval(function () {
                        if (gameIsRunning == true) {
                            movePlayer();
                            checkIfHitBorder();
                            checkIfHittingSelf();
                        }
                    }, 50);
                } else if (Score >= 20 && Score < 50) {
                    speed = setInterval(function () {
                        if (gameIsRunning == true) {
                            movePlayer();
                            checkIfHitBorder();
                            checkIfHittingSelf();
                        }
                    }, 45);
                } else if (Score >= 50 && Score < 75) {
                    speed = setInterval(function () {
                        if (gameIsRunning == true) {
                            movePlayer();
                            checkIfHitBorder();
                            checkIfHittingSelf();
                        }
                    }, 40);
                } else if (Score >= 75) {
                    speed = setInterval(function () {
                        if (gameIsRunning == true) {
                            movePlayer();
                            checkIfHitBorder();
                            checkIfHittingSelf();
                        }
                    }, 35);
                }

                var headImage, bodyImage, tailImage, candyImage;

                function StartPlayer() {

                    headImage = queue.getResult("snakeHead");
                    bodyImage = queue.getResult("snakeBody");
                    tailImage = queue.getResult("snakeTail");
                    candyImage = queue.getResult("snakeCandyImage")

                    drawPlayer();

                }

                function drawPlayer() {
                    snakePlayerContainer.removeAllChildren();
                    for (var i = 0; i < locations.length; i++) {
                        if (i == 0) {
                            image = new createjs.Bitmap(tailImage);;
                        } else if (i == locations.length - 1) {
                            image = new createjs.Bitmap(headImage);
                        } else {
                            image = new createjs.Bitmap(bodyImage);
                        }
                        image.x = locations[i].x * snakeSquareSize;
                        image.y = locations[i].y * snakeSquareSize;

                        snakePlayerContainer.addChild(image);
                    }
                }
                function player() {
                    var self = this;
                    locations = [{ x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }]
                }

                var currenthead;
                function movePlayer() {
                    if (pausedGame == false) {
                        if (isMovingRight == true) {
                            currenthead = locations[locations.length - 1];
                            locations.push({ x: currenthead.x + 1, y: currenthead.y });
                        } else if (isMovingLeft == true) {
                            currenthead = locations[locations.length - 1];
                            locations.push({ x: currenthead.x - 1, y: currenthead.y });
                        } else if (isMovingUp == true) {
                            currenthead = locations[locations.length - 1];
                            locations.push({ x: currenthead.x, y: currenthead.y - 1 });
                        } else if (isMovingDown == true) {
                            currenthead = locations[locations.length - 1];
                            locations.push({ x: currenthead.x, y: currenthead.y + 1 });
                        }

                        if (!checkIfeatingFood()) { // if we're not eating then we remove the tail.  If we are eating, leave the tail there and "grow"
                            locations.splice(0, 1);
                        }

                        CheckIfEatingCandy();

                        drawPlayer();
                    }
                }
                function moveRight() {
                    isMovingRight = true;
                    isMovingLeft = false;
                    isMovingUp = false;
                    isMovingDown = false;
                }
                function moveLeft() {
                    isMovingLeft = true;
                    isMovingRight = false;
                    isMovingUp = false;
                    isMovingDown = false;
                }
                function moveUp() {
                    isMovingUp = true;
                    isMovingRight = false;
                    isMovingLeft = false;
                    isMovingDown = false;
                }
                function moveDown() {
                    isMovingDown = true;
                    isMovingRight = false;
                    isMovingLeft = false;
                    isMovingUp = false;
                }
                // var loc;

                function checkIfeatingFood() {
                    var isEating = false;
                    var loc = snakePlayerContainer.children[snakePlayerContainer.children.length - 1];
                    for (var j = 0; j < answersArray.length; j++) {

                        var answerLocation = answersArray[j];
                        var pt = loc.localToLocal(0, 0, answerLocation);
                        if (answerLocation.hitTest(pt.x, pt.y)) {
                            if (answerLocation.IsCorrect == true) {
                                self.stage.removeChild(randomCandyContainer);
                                var question = questionsArray[onThisQuestionNumber]
                                pausedGame = true;
                                self.stage.removeChild(answerLocation);
                                answersArray.splice(0, 4);
                                answersContainer2.removeAllChildren();
                                isEating = true;
                                showFeedbackCorrect();
                                correctMultiplier = correctMultiplier + 1;
                                if (correctMultiplier == 4) {
                                    correctMultiplier = 3;
                                }
                            } else {
                                var question = questionsArray[onThisQuestionNumber]
                                answersContainer2.removeAllChildren();
                                self.stage.removeChild(answerLocation);
                                answersArray.splice(0, 4);
                                showFeedbackIncorrect();
                            }
                            pausedGame = true;

                        }
                    } return isEating;

                }

                function CheckIfEatingCandy() {
                    var isEatingCandy = false;
                    var candyLoc = snakePlayerContainer.children[snakePlayerContainer.children.length - 1];
                    var candyPt;
                    if (randomCandyBorder != null) {
                        var candyLocation = randomCandyBorder;
                        candyPt = candyLoc.localToLocal(0, 0, candyLocation);
                    }
                    if (randomCandyBorder2 != null) {
                        var candyLocation2 = randomCandyBorder2;
                        var pt2 = candyLoc.localToLocal(0, 0, candyLocation2);
                    }
                    if (randomGhostBorder != null) {
                        var ghostLocation = randomGhostBorder;
                        var ptGhost = candyLoc.localToLocal(0, 0, ghostLocation);
                    }
                    if (candyLocation != null) {
                        if (!KillAnimation) {
                            if (candyLocation.hitTest(candyPt.x, candyPt.y)) {
                                star = new createjs.Bitmap(queue.getResult("star"));
                                star.x = candyLocation.x;
                                star.y = candyLocation.y;
                                star.alpha = .5;
                                self.stage.addChild(star);
                                createjs.Tween.get(star).wait(90).to({ alpha: 0, visible: false });
                                self.stage.removeChild(randomCandyContainer);
                                isEatingCandy = true;
                                Score = Score + 10;
                                scoreTick = 0;
                                printScore();
                                KillAnimation = true;
                            }
                        }
                    }
                    if (candyLocation2 != null) {
                        if (!KillAnimation) {
                            if (candyLocation2.hitTest(pt2.x, pt2.y)) {
                                halfEaten = new createjs.Bitmap(queue.getResult("HalfEatenIceCreamBar"));
                                halfEaten.x = candyLocation2.x;
                                halfEaten.y = candyLocation2.y;
                                halfEaten.alpha = .5;
                                self.stage.addChild(halfEaten);
                                createjs.Tween.get(halfEaten).wait(90).to({ alpha: 0, visible: false });
                                self.stage.removeChild(randomCandyContainer);
                                isEatingCandy = true;
                                Score = Score + 10;
                                scoreTick = 0;
                                printScore();
                                KillAnimation = true;
                            }
                        }
                    }
                    if (ghostLocation != null) {
                        if (!KillAnimation) {
                            if (ghostLocation.hitTest(ptGhost.x, ptGhost.y)) {
                                //createjs.Tween.get(randomGhostBorder).to(smoke);//.call(handleComplete);
                                //function handleComplete() {
                                //    createjs.Tween.get(smoke).wait(50).to({ alpha: 0, visible: false }, 1000).call(handleComplete2);
                                //}
                                //function handleComplete2() {
                                //    self.stage.removeChild(smoke);
                                //}
                                smoke = new createjs.Bitmap(queue.getResult("smoke"));
                                smoke.x = ghostLocation.x;
                                smoke.y = ghostLocation.y;
                                smoke.alpha = .7;
                                self.stage.addChild(smoke);
                                createjs.Tween.get(smoke).wait(90).to({ alpha: 0, visible: false });
                                self.stage.removeChild(randomCandyContainer);
                                isEatingCandy = true;
                                Score = Score + 25;
                                scoreTick = 0;
                                printScore();
                                KillAnimation = true;
                            }
                        }
                    }
                }

                function printScore() {
                    self.stage.removeChild(scoreLabel);

                    scoreLabel = new createjs.Text("Score: " + Score, "bold 16px Arial", "#FFFFFF");
                    scoreLabel.textAlign = "center";
                    scoreLabel.lineWidth = 270;
                    scoreLabel.color = "white";
                    scoreLabel.y = 30;
                    scoreLabel.x = 740;


                    self.stage.addChild(scoreLabel);
                }

                //used in the feedback correct and incorrect
                var stopListening = false;

                function showFeedbackCorrect() {
                    // TO DO - Show feedback after each correct or incorrect answer
                    var directionsbox = new createjs.Container();
                    //displaybox = new createjs.Shape();
                    //displaybox.graphics.beginFill("#ffba3e").drawRoundRect(0, 0, 250, 140, 8);
                    //displaybox.name = "DirectionsBox";
                    //displaybox.x = 275;
                    //displaybox.y = 450;

                    var panelSm = new createjs.Bitmap(queue.getResult("sm_panel"));
                    panelSm.x = 215;
                    panelSm.y = 380;


                    Score = Score + 15;
                    Score = Score - scoreTick;
                    scoreTick = 0;

                    printScore();
                    var labeltitle = new createjs.Text("Good Job!", "bold 18px Arial", "#FFFFFF");
                    labeltitle.lineWidth = 215;
                    labeltitle.y = panelSm.y + 10;
                    labeltitle.x = panelSm.x + 20;

                    var label = new createjs.Text("You answered the question correctly, congratulations! \n\n Press enter to start the next round.", "bold 16px Arial", "#000000");
                    label.textAlign = "center";
                    label.lineWidth = 215;
                    label.y = panelSm.y + 70;
                    label.x = panelSm.x + 180;

                    questionsAnswered++;

                    directionsbox.addChild(panelSm, label, labeltitle);

                    if (questionsAnswered == gameData.Questions.length) {
                        gameIsRunning = false;
                        // DisplayEndingNotes();
                    }

                    self.stage.addChild(directionsbox);
                    directionsbox.addEventListener("click", handleClick);
                    function handleClick(event) {
                        onThisQuestionNumber = onThisQuestionNumber + 1;
                        self.stage.removeChild(directionsbox);
                        questionContainer.removeAllChildren();
                        //answersContainer.removeAllChildren()
                        // StartInteraction();
                        pausedGame = false;

                        if (questionsAnswered == gameData.Questions.length) {
                            gameIsRunning = false;
                            DisplayEndingNotes();
                        }
                        deliverQuestions();
                    };

                    stopListening = false;

                    document.addEventListener("keypress", handlePress);
                    function handlePress(event) {
                        if (event.keyCode == 13) {

                            self.stage.removeChild(directionsbox);
                            if (pausedGame == true)
                                if (stopListening == false) {
                                    {
                                        onThisQuestionNumber = onThisQuestionNumber + 1;
                                        questionContainer.removeAllChildren();
                                        randomCandyContainer.removeAllChildren();
                                        pausedGame = false;
                                        //  console.log("Problem is here");
                                        if (questionsAnswered == gameData.Questions.length) {
                                            gameIsRunning = false;
                                            DisplayEndingNotes();
                                        }
                                        deliverQuestions();
                                        stopListening = true;
                                    }

                                }
                        }
                    };
                }

                //gives the correct answer to ShowFeedbackIncorrect function
                function getTheCorrectAnswer() {
                    for (var i = 0; questionsArray[onThisQuestionNumber].Answers.length; i++) {
                        if (questionsArray[onThisQuestionNumber].Answers[i].IsCorrect == true) {
                            return questionsArray[onThisQuestionNumber].Answers[0].Text
                        }

                    }
                }

                function showFeedbackIncorrect() {
                    var answer = getTheCorrectAnswer();

                    var directionsbox = new createjs.Container();


                    var panelSm = new createjs.Bitmap(queue.getResult("sm_panel"));
                    panelSm.x = 215;
                    panelSm.y = 380;

                    var labeltitle = new createjs.Text("Incorrect", "bold 18px Arial", "#FFFFFF");
                    labeltitle.lineWidth = 215;
                    labeltitle.y = panelSm.y + 10;
                    labeltitle.x = panelSm.x + 20;

                    var label = new createjs.Text("Sorry, the correct answer is " + answer + ". \n\n Press enter to start the next round.", "bold 16px Arial", "#000000");
                    label.textAlign = "center";
                    label.lineWidth = 300;
                    label.y = panelSm.y + 40;
                    label.x = panelSm.x + 180;


                    questionsAnswered++;

                    self.stage.removeChild(scoreLabel);

                    Score = Score - 5;

                    //Brett Easton Ellis
                    if (Score < 0) {
                        Score = 0;
                    }

                    scoreLabel = new createjs.Text("Score: " + Score, "bold 16px Arial", "#FFFFFF");
                    scoreLabel.textAlign = "center";
                    scoreLabel.lineWidth = 215;
                    scoreLabel.y = 30;
                    scoreLabel.x = 740;


                    self.stage.addChild(scoreLabel);

                    directionsbox.addChild(panelSm, label, labeltitle);

                    if (questionsAnswered == gameData.Questions.length) {
                        gameIsRunning = false;
                        //DisplayEndingNotes();
                    }



                    self.stage.addChild(directionsbox);
                    directionsbox.addEventListener("click", handleClick);
                    function handleClick(event) {
                        onThisQuestionNumber = onThisQuestionNumber + 1;
                        self.stage.removeChild(directionsbox);
                        questionContainer.removeAllChildren();
                        randomCandyContainer.removeAllChildren();
                        pausedGame = false;
                        if (questionsAnswered == gameData.Questions.length) {
                            gameIsRunning = false;
                            DisplayEndingNotes();
                        }
                        deliverQuestions();

                    };
                    stopListening = false;

                    document.addEventListener("keypress", handlePress);
                    function handlePress(event) {
                        if (event.keyCode == 13) {

                            self.stage.removeChild(directionsbox);
                            if (pausedGame == true)
                                if (stopListening == false) {
                                    {
                                        onThisQuestionNumber = onThisQuestionNumber + 1;
                                        questionContainer.removeAllChildren();
                                        randomCandyContainer.removeAllChildren();
                                        pausedGame = false;
                                        // console.log("Problem is here Incorrect");
                                        if (questionsAnswered == gameData.Questions.length) {
                                            gameIsRunning = false;
                                            DisplayEndingNotes();
                                        }
                                        deliverQuestions();
                                        stopListening = true;
                                    }

                                }

                        }
                    };


                }

            }
            //End Interaction Function

            function gameOverScreen() {

            }

            function DisplayEndingNotes(EndedHow) {

                if (isLmsConnected) {
                    ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
                    ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.completed);
                }


                randomCandyContainer.removeAllChildren();
                answersContainer2.removeAllChildren();
                var EndScreen = new createjs.Container();

                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 40;
                panelBG.y = 50;

                var directionsbox = new createjs.Container();

                var gameOver = new createjs.Text("Game Over", "bold 28px Arial", "#FFFFFF");
                gameOver.textAlign = "center";
                gameOver.lineWidth = 215;
                gameOver.y = 80;
                gameOver.x = 160;

                if (EndedHow == "Died") {
                    var endText = new createjs.Text("Press the replay button to play again.", "bold 16px Arial", "#FFFFFF");

                } else {
                    var endText = new createjs.Text("You have answered all the questions in this game. \n\nPress the replay button to play again.", "bold 16px Arial", "#FFFFFF");

                }


                endText.lineWidth = 450;
                endText.y = 130;
                endText.x = 90;


                directionsbox.addChild(panelBG, endText, gameOver);
                // directionsbox.addChild(displaybox, label);

                var replayContainer = new createjs.Container();
                var exploreContainer = new createjs.Container();

                var replayButton = new createjs.Bitmap(queue.getResult("restart_button"));

                replayButton.scaleX = .75;
                replayButton.scaleY = .75;

                replayButton.x = 570;
                replayButton.y = 350;

                //var replayText = new createjs.Text("Replay", "bold 16px Arial", "#fff");
                //replayText.textAlign = "center";
                //replayText.lineWidth = 140;
                //replayText.y = replayButton.y + 15;
                //replayText.x = replayButton.x + 85

                replayContainer.addChild(replayButton);
                EndScreen.addChild(directionsbox, replayContainer);

                self.stage.addChild(EndScreen);

                snakeGameContainer.removeAllChildren();

                replayContainer.addEventListener("click", handleClick);
                function handleClick(event) {
                    self.stage.removeAllChildren();
                    StartitALL()

                }


            }
            //TimerLength = 30000;
            //var startTime;
            //var time;
            //var clockBack;
            //function Clock() {
            //    clockContainer = new createjs.Container();
            //    contain = new createjs.Container();
            //    clockBack = new createjs.Bitmap(queue.getResult("clockBack"));
            //    clockHand = new createjs.Bitmap(queue.getResult("clockHand"));
            //    clockBack.x = 40;
            //    clockBack.y = 480;
            //    clockHand.x = 95;
            //    clockHand.y = 535;
            //    clockHand.regX = 16
            //    clockHand.regY = 130;
            //    clockHand.scaleX = clockHand.scaleY = 0.35;
            //    clockBack.scaleX = clockBack.scaleY = 0.40;
            //    contain.addChild(clockHand);
            //    clockContainer.addChild(clockBack, contain);

            //    self.stage.addChild(clockContainer)
            //    clockContainer.alpha = .5;
            //    //Start Timer so we can base score off time.
            //    startTime = (new Date()).getTime();
            //    //TimerLength
            //    mytweentodisable = createjs.Tween.get(clockHand, { loop: false }, { override: true }).to({ rotation: 360 }, TimerLength).call(function () {
            //        if (gameIsRunning == true) {
            //            // self.stage.removeChild(mytweentodisable)
            //            //this will trigger the timer is up
            //            createjs.Sound.stop();
            //            gameIsRunning = false;
            //            createjs.Sound.play("gameOver");
            //            DisplayEndingNotes();
            //        }
            //    });
            //}//clock end


            //this updates the stage every tick not sure if we need it but
            createjs.Ticker.addEventListener("tick", handleTick);
            createjs.Ticker.on("tick", handleTick);
            createjs.Ticker.setFPS(30);



            function handleTick(event) {
                self.stage.update();

                tick = tick + 1;
                if (tick == 60) {
                    tick = 0;
                    scoreTick = scoreTick + 1;
                }

                if (scoreTick == 15) {
                    scoreTick = 14;
                }
            }

            function checkIfHittingSelf() {
                var loc = locations[locations.length - 1];
                for (var L = 0; L < locations.length - 2; L++) {
                    var spot = locations[L]
                    if (loc.x == spot.x && spot.y == loc.y) {
                        gameIsRunning = false;
                        DisplayEndingNotes("Died");
                    } else {
                        // console.log("loc = " + loc + " spot = " + spot);
                    }
                }
            }



            function checkIfHitBorder() {
                //change to snake head
                var currentHead = locations[locations.length - 1];
                if (currentHead.x >= snakePlayingBoardWidth || currentHead.x < 0) {
                    gameIsRunning = false;
                    DisplayEndingNotes("Died");
                } else {
                    //console.log(currentHead.x);
                }
                if (currentHead.y >= snakePlayingBoardHeight || currentHead.y < 0) {
                    gameIsRunning = false;
                    DisplayEndingNotes("Died")
                } else {
                    //console.log(currentHead.y);
                }
            }


            $(window).bind('beforeunload', function () {
                submitScore(Score)
                //alert("in there");
            })

            var submittedScoreAlready = false;

            function submitScore(score) {
                if (submittedScoreAlready == true)
                    return false;

                if (score == 0)
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
        }
    }
    return Game;
})(createjs);

