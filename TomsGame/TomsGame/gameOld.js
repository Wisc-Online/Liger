/// <reference path="https://code.createjs.com/createjs-2015.11.26.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs, $) {

    function Game(canvasId, gameData) {
        var helpers = {
            createButton: function (buttonText) {
                var button = new createjs.Container();
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("dark gray").beginFill("#7CC447").drawRoundRect(0, 0, 100, 25, 5).endStroke().endFill();
                var text = new createjs.Text(buttonText, "12pt Arial Black", "White");
                text.x = 50;
                text.y = 12.5;
                text.textAlign = "center";
                text.textBaseline = "middle";

                button.addChild(background, text);

                return button;
            }
        };
        var assetsPath = gameData.assetsPath || "";

        var timeLimit = 240;
        var assets = [
            { id: "instructions_background", src: assetsPath + "instructions_background.png" },
            { id: "instructions_question", src: assetsPath + "instructions_question.png" },
            { id: "instructions", src: assetsPath + "instructions_question.png" },
            { id: "title_background", src: assetsPath + "title_background.jpg" },
            { id: "plain_background", src: assetsPath + "plain_background.jpg" },
            { id: "start_button", src: assetsPath + "start_button.png" },
            { id: "rf_instructions", src: assetsPath + "RapidFireInstructions.png" },
            { id: "rf_skyBackground", src: assetsPath + "rf_skyBackground.jpg" },
            { id: "rf_skyFinalBackground", src: assetsPath + "rf_skyFinalBackground.png" },
            { id: "rf_spaceBackground", src: assetsPath + "rf_spaceBackground.jpg" },
            { id: "rf_turtle", src: assetsPath + "rf_turtle.png" },
            { id: "rf_turbitt", src: assetsPath + "rf_turbitt.png" },
            { id: "rf_rabbit", src: assetsPath + "rf_rabbit.png" },
            { id: "rf_blueLongBalloon", src: assetsPath + "rf_blueLongBalloon.png" },
            { id: "rf_blueRoundBalloon", src: assetsPath + "rf_blueRoundBalloon.png" },
            { id: "rf_greenLongBalloon", src: assetsPath + "rf_greenLongBalloon.png" },
            { id: "rf_greenRoundBalloon", src: assetsPath + "rf_greenRoundBalloon.png" },
            { id: "rf_redLongBalloon", src: assetsPath + "rf_redLongBalloon.png" },
            { id: "rf_redRoundBalloon", src: assetsPath + "rf_redRoundBalloon.png" },
            { id: "rf_yellowLongBalloon", src: assetsPath + "rf_yellowLongBalloon.png" },
            { id: "rf_yellowRoundBalloon", src: assetsPath + "rf_yellowRoundBalloon.png" },
            { id: "rf_whiteCrosshair", src: assetsPath + "rf_whiteCrosshair.png" },
            { id: "rf_game_cursor", src: assetsPath + "rf_game_cursor.png" },
            { id: "pop", src: assetsPath + "rf_balloon_pop.mp3" },
             { id: "deflate", src: assetsPath + "deflate.mp3" },
            { id: "buttonClick", src: assetsPath + "ButtonClickDry.mp3" },
            { id: "rf_POP", src: assetsPath + "rf_POP.png" },
            { id: "musicOn", src: assetsPath + "musicOn.png" },
            { id: "musicOff", src: assetsPath + "musicOff.png" }
        ];
        var queue = new createjs.LoadQueue(false);
        var mainView = null;
        queue.installPlugin(createjs.Sound);
        queue.addEventListener("complete", function (event) {
            initializeGame();
        });
        queue.loadManifest(assets);

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

        var musicOn = true;
        var pop = createjs.Sound.createInstance("pop", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
        var deflate = createjs.Sound.createInstance("deflate", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
        var buttonClick = createjs.Sound.createInstance("ButtonClickDry", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
        buttonClick.volume = buttonClick.volume * 0.75;

        gameData = gameData || {};
        var self = this;
        var mouseBp;
        function initializeGame() {
            self.gameData = gameData;
            var gameState = {
                score: 0,
                speed: "slow",
                rate: .01,
                name: gameData.UserName || "",
                color: "#008080",
                score: 0,
                questionsMissed: 0,
                timerOn: false
            }

            var currentstate = {
                shotsLeft: 3
            }
            var stage = new createjs.Stage(canvasId);

            stage.enableMouseOver(10);
            var fps = 60;
            var tickCount = 0;
            var currentArea = null;


            function tickListener() {
                if (gameState.timerOn == true) {
                    Timer.visible = true;
                    tickCount = (tickCount++) % fps;

                    if (tickCount == 0 && tickCount < 30) {
                        // 1 second occured
                        gameState.timer = --gameState.timer;

                        if (gameState.timer <= 0) {
                            gameState.timer = timeLimit;
                            Timer.visible = false;
                            gameState.timerOn = false;


                            var mainArea = stage.getChildByName("MainView");
                            if (mainArea != null) {
                                currentArea = getIncorrectAnswerArea();
                                mainArea.addChild(currentArea);
                            }

                        } else {
                            UpdateTimer();
                            CheckCollision();
                        }
                    } else {
                        gameState.timer = timeLimit;
                        Timer.visible = false;
                        gameState.timerOn = false;
                    }
                }
                stage.update();
            }
            function UpdateTimer() {
                var Seconds = gameState.timer;

                var Days = Math.floor(Seconds / 86400);
                Seconds -= Days * 86400;

                var Hours = Math.floor(Seconds / 3600);
                Seconds -= Hours * (3600);

                var Minutes = Math.floor(Seconds / 60);
                Seconds -= Minutes * (60);

                var TimeStr = LeadingZero(Minutes) + ":" + LeadingZero(Seconds);

                Timer.text = TimeStr;
            }
            function CheckCollision() {
                var answerContainer = mainView.getChildByName("answerContainer");
                var box0 = answerContainer.getChildByName("answerBox0");
                var box1 = answerContainer.getChildByName("answerBox1");
                var box2 = answerContainer.getChildByName("answerBox2");
                var box3 = answerContainer.getChildByName("answerBox3");
                if (box0 != null) {
                    if (box1 != null && box0.x < box1.x + box1.getBounds().width - 5 && box0.x + box0.getBounds().width - 5 > box1.x && box0.y < box1.y + box1.getBounds().height - 5 && box0.getBounds().height - 5 + box0.y > box1.y) {
                        divertCollision(box0);
                        console.log("Collision 0,1 Detected");
                    }
                    if (box2 != null && box0.x < box2.x + box2.getBounds().width - 5 && box0.x + box0.getBounds().width - 5 > box2.x && box0.y < box2.y + box2.getBounds().height - 5 && box0.getBounds().height - 5 + box0.y > box2.y) {
                        divertCollision(box0);
                        console.log("Collision 0,2 Detected");
                    }
                    if (box3 != null && box0.x < box3.x + box3.getBounds().width - 5 && box0.x + box0.getBounds().width - 5 > box3.x && box0.y < box3.y + box3.getBounds().height - 5 && box0.getBounds().height - 5 + box0.y > box3.y) {
                        divertCollision(box0);
                        console.log("Collision 0,3 Detected");
                    }
                }
                if (box1 != null) {
                    if (box0 != null && box1.x < box0.x + box0.getBounds().width - 5 && box1.x + box1.getBounds().width - 5 > box0.x && box1.y < box0.y + box0.getBounds().height - 5 && box1.getBounds().height - 5 + box1.y > box0.y) {
                        divertCollision(box1);
                        console.log("Collision 0,1 Detected");
                    }
                    if (box2 != null && box1.x < box2.x + box2.getBounds().width - 5 && box1.x + box1.getBounds().width - 5 > box2.x && box1.y < box2.y + box2.getBounds().height - 5 && box1.getBounds().height - 5 + box1.y > box2.y) {
                        divertCollision(box1);
                        console.log("Collision 1,2 Detected");
                    }
                    if (box3 != null && box1.x < box3.x + box3.getBounds().width - 5 && box1.x + box1.getBounds().width - 5 > box3.x && box1.y < box3.y + box3.getBounds().height - 5 && box1.getBounds().height - 5 + box1.y > box3.y) {
                        divertCollision(box1);
                        console.log("Collision 1,3 Detected");
                    }
                   
                }
                if (box2 != null) {
                    if (box0 != null && box2.x < box0.x + box0.getBounds().width - 5 && box2.x + box2.getBounds().width - 5 > box0.x && box2.y < box0.y + box0.getBounds().height - 5 && box2.getBounds().height - 5 + box2.y > box0.y) {
                        divertCollision(box2);
                        console.log("Collision 0,1 Detectedx");
                    }
                    if (box1 != null && box2.x < box1.x + box1.getBounds().width - 5 && box2.x + box2.getBounds().width - 5 > box1.x && box2.y < box1.y + box1.getBounds().height - 5 && box2.getBounds().height - 5 + box2.y > box1.y) {
                        divertCollision(box2);
                        console.log("Collision 0,1 Detectedx");
                    }
                    if (box3 != null && box2.x < box3.x + box3.getBounds().width - 5 && box2.x + box2.getBounds().width - 5 > box3.x && box2.y < box3.y + box3.getBounds().height - 5 && box2.getBounds().height - 5 + box2.y > box3.y) {
                        divertCollision(box2);
                        console.log("Collision 2,3 Detectedx");
                    }
                }
                if (box3 != null) {
                    if (box0 != null && box3.x < box0.x + box0.getBounds().width - 5 && box3.x + box3.getBounds().width - 5 > box0.x && box3.y < box0.y + box0.getBounds().height - 5 && box3.getBounds().height - 5 + box3.y > box0.y) {
                        divertCollision(box3);
                        console.log("Collision 0,1 Detectedx");
                    }
                    if (box1 != null && box3.x < box1.x + box1.getBounds().width - 5 && box3.x + box3.getBounds().width - 5 > box1.x && box3.y < box1.y + box1.getBounds().height - 5 && box3.getBounds().height - 5 + box3.y > box1.y) {
                        divertCollision(box3);
                        console.log("Collision 0,1 Detectedx");
                    }
                    if (box2 != null && box3.x < box2.x + box2.getBounds().width - 5 && box3.x + box3.getBounds().width - 5 > box2.x && box3.y < box2.y + box2.getBounds().height - 5 && box3.getBounds().height - 5 + box3.y > box2.y) {
                        divertCollision(box3);
                        console.log("Collision 2,3 Detectedx");
                    }
                }

            }
            function divertCollision(boxA) {
                
                var currentPoint = { x: boxA.x, y: boxA.y };
                var nextPoint = getNewRandomPoint(currentPoint);

                if (boxA.name == "answerBox0") {
                    nextPoint.x = 10;
                    nextPoint.y = 30;
                } else if (boxA.name == "answerBox1") {
                    nextPoint.x = 600;
                    nextPoint.y = 30;
                } else if (boxA.name == "answerBox2") {
                    nextPoint.x = 500;
                    nextPoint.y = 400;
                } else {
                    nextPoint.x = 30;
                    nextPoint.y = 400;
                }

                var distance = getDistance(currentPoint.x, nextPoint.x, currentPoint.y, currentPoint.y);

                var t = distance / gameState.rate;
                createjs.Tween.removeTweens(boxA);
                createjs.Tween.get(boxA).to({ x: nextPoint.x, y: nextPoint.y }, t)
                    .call(function (e) {
                        if (gameState.timerOn) {
                            animateToRandomPoint(boxA, gameState.rate);
                        }
                    });

            }
            function LeadingZero(Time) {
                return (Time < 10) ? "0" + Time : +Time;
            }

            createjs.Ticker.setFPS(fps);
            createjs.Ticker.addEventListener("tick", tickListener);

            createjs.Touch.enable(stage, false, true);

            var originalWidth = stage.canvas.width;
            var originalHeight = stage.canvas.height;


            var totalQuestions = gameData.Questions.length;
            var questionIndex = 0;

            function handleStartButtonHover(event) {
                if (event.type == "mouseover") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: 1.0625, scaleY: 1.0625 }, 100).to({ scaleX: 1.0, scaleY: 1.0 }, 100).to({ scaleX: 1.0625, scaleY: 1.0625 }, 200);
                }
                else {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: 1.0, scaleY: 1.0 }, 100);
                }
            }

            function createTitleView() {
                var view = new createjs.Container();
                view.name = "TitleView";
                var titleText = new createjs.Text(gameData.Title, "36px Arial Black", "#7649AE");
                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                titleText.lineWidth = 780;
                titleText.x = 10;
                titleText.y = 50;

                var descriptionText = new createjs.Text(gameData.Description, "20px Bold Arial", "dark gray");
                descriptionText.lineWidth = 780;
                descriptionText.x = 10;
                descriptionText.y = 120;

                var startButton = new createjs.Bitmap(queue.getResult("start_button"));
                startButton.shadow = new createjs.Shadow("gray", 3, 3, 3);
                startButton.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawCircle(50, 50, 50));
                startButton.cursor = 'pointer';
                startButton.regX = 50;
                startButton.regY = 50;
                startButton.x = 725;
                startButton.y = 525;

                view.addChild(new createjs.Bitmap(queue.getResult("title_background")))
                view.addChild(startButton);
                view.addChild(descriptionText);
                view.addChild(titleText);

                startButton.addEventListener("click", function (event) {
                    createjs.Sound.play("buttonClick");
                   
                    showView(createGameSpeedView());
                });

                startButton.on("mouseover", handleStartButtonHover);
                startButton.on("mouseout", handleStartButtonHover);

                return view;
            }

            function createSpeedContainer(container_image, x, y, speed) {
                var oneContainer = new createjs.Container();

                // oneContainer.hitArea =  new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawRect(0, 0, image.width, image.height));
                oneContainer.cursor = 'pointer';
                oneContainer.shadow = new createjs.Shadow("gray", 3, 3, 10);
                oneContainer.regX = 75;
                oneContainer.regY = 75;
                var image = new createjs.Bitmap(queue.getResult(container_image));
                image.regX = image.getBounds().width / 2;
                image.x = 75;

                oneContainer.addChild(image);
                var oneText = new createjs.Text(speed, "24px Arial Black", "#8e8e8e");
                oneText.textAlign = "center";
                oneText.textBaseline = "middle";
                oneText.x = 75;
                oneText.y = -10;

                oneContainer.addChild(oneText);

                oneContainer.y = y;
                oneContainer.x = x;

                return oneContainer;
            }

            function createGameSpeedView() {

                var view = new createjs.Container();

                var titleText = new createjs.Text("Choose your speed", "36px Arial Black", "#7649AE");
                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                titleText.textAlign = "center";
                titleText.x = 400;
                titleText.y = 75;

                var oneContainer = createSpeedContainer("rf_turtle", 180, 370, "Slow");
                var twoContainer = createSpeedContainer("rf_turbitt", 400, 325, "Medium");
                var threeContainer = createSpeedContainer("rf_rabbit", 620, 267, "Fast");

                oneContainer.on("mouseover", function () {
                    createjs.Tween.get(oneContainer).to({ scaleX: 1.125, scaleY: 1.125 }, 100).to({ scaleX: 1.0625, scaleY: 1.0625 }, 100).to({ scaleX: 1.125, scaleY: 1.125 }, 100);
                    createjs.Tween.get(twoContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                    createjs.Tween.get(threeContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                });

                oneContainer.on("mouseout", function () {
                    createjs.Tween.get(oneContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(twoContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(threeContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                });

                twoContainer.on("mouseover", function () {
                    createjs.Tween.get(twoContainer).to({ scaleX: 1.125, scaleY: 1.125 }, 100).to({ scaleX: 1.0625, scaleY: 1.0625 }, 100).to({ scaleX: 1.125, scaleY: 1.125 }, 100);
                    createjs.Tween.get(oneContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                    createjs.Tween.get(threeContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                });

                twoContainer.on("mouseout", function () {
                    createjs.Tween.get(twoContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(oneContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(threeContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                });

                threeContainer.on("mouseover", function () {
                    createjs.Tween.get(threeContainer).to({ scaleX: 1.125, scaleY: 1.125 }, 100).to({ scaleX: 1.0625, scaleY: 1.0625 }, 100).to({ scaleX: 1.125, scaleY: 1.125 }, 100);
                    createjs.Tween.get(oneContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                    createjs.Tween.get(twoContainer).to({ scaleX: 0.875, scaleY: 0.875 }, 100);
                });

                threeContainer.on("mouseout", function () {
                    createjs.Tween.get(threeContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(oneContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                    createjs.Tween.get(twoContainer).to({ scaleX: 1, scaleY: 1 }, 75);
                });
                var soundStuff = stage.getChildByName("theSoundContainer");

                oneContainer.addEventListener("click", function (event) {
                   createjs.Sound.play("buttonClick");
                    gameState.speed = "Slow";
                    gameState.color = "red";
                    gameState.rate = 0.01;
                    soundStuff.visible = false;
                    gameState.rate = 0.01;
                    return showView(createMainGameView());
                });

                twoContainer.addEventListener("click", function (event) {
                    createjs.Sound.play("buttonClick");
                    gameState.speed = "Medium";
                    gameState.color = "red";
                    soundStuff.visible = false;
                    gameState.rate = 0.05;

                    return showView(createMainGameView());
                });

                threeContainer.addEventListener("click", function (event) {
                    createjs.Sound.play("buttonClick");
                    gameState.speed = "Fast";
                    gameState.color = "red";
                    soundStuff.visible = false;
                    gameState.rate = 0.10;

                    return showView(createMainGameView());
                });

                view.addChild(new createjs.Bitmap(queue.getResult("plain_background")))
                view.addChild(titleText);
                view.addChild(oneContainer);
                view.addChild(twoContainer);
                view.addChild(threeContainer);
                return view;



            }

            var availableGameCells = [];

            function createMainGameView() {
                mainView = new createjs.Container();
                mainView.name = "MainView";
                var background = new createjs.Bitmap(queue.getResult("rf_skyBackground"));
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
                var soundStuff = stage.getChildByName("theSoundContainer");
                soundStuff.visible = false;

                return mainView;
            }
            function handleAnswerMouseOver(event) {

                var background = event.currentTarget.getChildAt(0);

                if (event.type == "mouseover") {
                    var currentTarget = stage.getChildByName("targetZone");
                    stage.removeChild(currentTarget);
                    mouseBp = new createjs.Bitmap(queue.getResult("rf_whiteCrosshair"));
                    mouseBp.name = "targetZone";
                    mouseBp.x = -9999;
                    mouseBp.y = -9999;
                    stage.addChild(mouseBp);

                }
                else {

                    var currentTarget = stage.getChildByName("targetZone");
                    stage.removeChild(currentTarget);
                    mouseBp = new createjs.Bitmap(queue.getResult("rf_game_cursor"));
                    mouseBp.name = "targetZone";
                    mouseBp.x = -9999;
                    mouseBp.y = -9999;
                    stage.addChild(mouseBp);
                }

            }

            function handleAnswerClick(event) {
                createjs.Ticker.setPaused(true);
                createjs.Sound.play("pop");
                //pop.play("pop");

                if (currentLmsInteraction != null) {
                    var answer = event.currentTarget.answer;

                    currentLmsInteraction.learnerResponse = answer.Text;
                    currentLmsInteraction.result = answer.IsCorrect ? ScormHelper.results.correct : ScormHelper.results.incorrect;
                    currentLmsInteraction.save();

                    currentLmsInteraction = null;
                }


                if (event.currentTarget.isCorrect) {
                    mainView.removeChild(currentArea);
                    currentArea = getCorrectAnswerArea();
                    mainView.addChild(currentArea);
                }
                else {
                    if (currentstate.shotsLeft <= 1) {
                        mainView.removeChild(currentArea);
                        currentArea = getIncorrectAnswerArea();
                        mainView.addChild(currentArea);
                    } else {
                        event.currentTarget.parent.removeChild(event.currentTarget);
                        updateShotCount();
                    }
                }
                createjs.Ticker.setPaused(false);
            }

            function updateShotCount() {
                if (currentstate.shotsLeft > 1) {
                    currentstate.shotsLeft = currentstate.shotsLeft - 1;
                    Shots.text = currentstate.shotsLeft;
                }
            }

            function getDisplayQuestionArea() {
                soundContainer.visible = false;
                var container = new createjs.Container();
                container.name = "questionArea";
                container.x = 10;
                container.y = 0;

                var questionNbr = questionIndex + 1;
                var questionAreaTitleText = new createjs.Text("Question " + questionNbr, "16px Arial bold", "white");
                var questionText = new createjs.Text(gameData.Questions[questionIndex].Text, "bold 20px Arial", "white");

                questionAreaTitleText.y = 10;
                questionText.y = 33;
                questionText.lineWidth = 500;

                container.addChild(questionAreaTitleText);
                container.addChild(questionText);
                var startButton = new createjs.Bitmap(queue.getResult("start_button"));
                startButton.shadow = new createjs.Shadow("gray", 3, 3, 3);
                startButton.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawCircle(50, 50, 50));
                startButton.cursor = 'pointer';
                startButton.regX = 50;
                startButton.regY = 50;
                startButton.x = 375;
                startButton.y = 325;
                container.addChild(startButton);


                startButton.addEventListener("click", function (event) {
                    createjs.Sound.play("buttonClick");
                    event.currentTarget.visible = false;
                    var showAnswersArea = getDisplayAnswersArea();
                    mainView.addChild(showAnswersArea);
                    gameState.timerOn = true;
                    stage.update();
                });

                if (stage.instructionsContainer == null) stage.addChild(instructionsContainer);

                return container;
            }

            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            function moveHandler() {
                mouseBp.x = stage.mouseX - 20;
                mouseBp.y = stage.mouseY - 20;
            }

            function getDisplayAnswersArea() {
                var currentTarget = stage.getChildByName("targetZone");
                stage.removeChild(currentTarget);

                var container = new createjs.Container();
                container.name = "answerContainer";
                container.x = 0;
                container.y = 100;


                stage.removeChild(instructionsContainer);

                if (isLmsConnected) {
                    var question = gameData.Questions[questionIndex];

                    currentLmsInteraction = ScormHelper.cmi.interactions().new();


                    currentLmsInteraction.id = question.Id;
                    currentLmsInteraction.type = ScormHelper.interactions.choice;
                    currentLmsInteraction.description = question.Text;
                }

                for (var i = 0, arrayLength = gameData.Questions[questionIndex].Answers.length; i < arrayLength; ++i) {
                    var answer = gameData.Questions[questionIndex].Answers[i];
                    var answerText = new createjs.Text(answer.Text, "bold 16px Arial", "black");
                    answerText.maxWidth = 160;
                    answerText.lineWidth = 160;

                    var textWidth = answerText.getBounds().width;
                    var textHeight = answerText.getBounds().height;

                    if (textHeight > 17) {
                        var answerTextContainer = new createjs.Container();
                        if (i == 0) {
                            answerText.color = "#BCF5A9";
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_redRoundBalloon"));
                        } else if (i == 1) {
                            answerText.color = "#BCF5A9";
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_blueRoundBalloon"));
                        } else if (i == 2) {
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_yellowRoundBalloon"));
                        } else {
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_greenRoundBalloon"));
                        }

                        var scale = textHeight > textWidth ? textHeight / 100 : textWidth / 100;
                        answerBackground.scaleX = answerBackground.scaleY = scale;
                        answerText.lineWidth = (answerBackground.getBounds().width * scale) - 20;
                        answerText.maxWidth = (answerBackground.getBounds().width * scale) - 20;
                        answerText.text = answer.Text;

                        answerText.x = (answerText.getBounds().width / 2) + 10;
                        answerText.y = 15;
                        answerText.textAlign = "center";

                    } else {
                        var answerTextContainer = new createjs.Container();
                        answerText.regX = textWidth / 2;
                        answerText.x = 80;
                        if (i == 0) {
                            answerText.color = "white";
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_redLongBalloon"));
                        } else if (i == 1) {
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_blueLongBalloon"));
                        } else if (i == 2) {
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_yellowLongBalloon"));
                        } else {
                            var answerBackground = new createjs.Bitmap(queue.getResult("rf_greenLongBalloon"));
                        }
                        answerTextContainer.x = 75;
                        answerTextContainer.y = 50;
                    }

                    answerBackground.x = 0;
                    answerBackground.y = 0;

                    var t2 = answerText.clone();
                    t2.outline = true;
                    t2.color = "#000";

                    answerTextContainer.addChild(t2, answerText);

                    var answerBox = new createjs.Container();




                    answerBox.name = "answerBox" + i;
                    answerBox.isCorrect = answer.IsCorrect;
                    if (i == 0) {
                        answerBox.x = 10;
                        answerBox.y = 30;
                    } else if (i == 1) {
                        answerBox.x = (700 - answerBackground.getBounds().width);
                        answerBox.y = 30;
                    } else if (i == 2) {
                        answerBox.x = (550 - answerBackground.getBounds().height);
                        answerBox.y = 400;
                    } else {
                        answerBox.x = 30;
                        answerBox.y = 400;
                    }
                    answerBox.addEventListener("click", handleAnswerClick);
                    answerBox.on("mouseover", handleAnswerMouseOver);
                    answerBox.on("mouseout", handleAnswerMouseOver);
                    answerBox.answer = answer;

                    answerBox.addChild(answerBackground, answerTextContainer);
                    animateToRandomPoint(answerBox);

                    container.addChild(answerBox);
                }

                currentstate.shotsLeft = 3;
                return container;
            }

            function animateToRandomPoint(target) {
                target.startingpoints = { x: target.x, y: target.y };
                var currentPoint = { x: target.x, y: target.y };
                var nextPoint = getNewRandomPoint(currentPoint);

                var distance = getDistance(currentPoint.x, nextPoint.x, currentPoint.y, currentPoint.y);

                var t = distance / gameState.rate;
                
                createjs.Tween.get(target).to({ x: nextPoint.x, y: nextPoint.y, override: true }, t)
                    .call(function (e) {
                        if (gameState.timerOn) {
                            animateToRandomPoint(target, gameState.rate);
                        }
                    });
            }

            function getLeftRailPoint() {
                return {
                    x: 10,
                    y: Math.random() * 450
                };
            }

            function getRightRailPoint() {
                return {
                    x: 650,
                    y: Math.random() * 450
                };
            }

            function getTopRailPoint() {
                return {
                    x: Math.random() * 650,
                    y: 10
                };
            }

            function getBottomRailPoint() {
                return {
                    x: Math.random() * 650,
                    y: 450
                };
            }

            function isTopRailPoint(point) {
                return point.y == 0;
            }

            function isLeftRailPoint(point) {
                return point.x == 0;
            }

            function isRightRailPoint(point) {
                return point.x == 750;
            }

            function isBottomRailPoint(point) {
                return point.y == 400;
            }

            function getNewRandomPoint(currentPoint) {

                var randomNumber = Math.floor(Math.random() * 3.0);

                if (isTopRailPoint(currentPoint)) {
                    switch (randomNumber) {
                        case 0: return getLeftRailPoint();
                        case 1: return getRightRailPoint();
                        case 2: return getBottomRailPoint();
                    }
                }
                else if (isLeftRailPoint(currentPoint)) {
                    switch (randomNumber) {
                        case 0: return getTopRailPoint();
                        case 1: return getRightRailPoint();
                        case 2: return getBottomRailPoint();
                    }
                }
                else if (isRightRailPoint(currentPoint)) {
                    switch (randomNumber) {
                        case 0: return getLeftRailPoint();
                        case 1: return getTopRailPoint();
                        case 2: return getBottomRailPoint();
                    }
                }
                else { // bottom
                    switch (randomNumber) {
                        case 0: return getLeftRailPoint();
                        case 1: return getRightRailPoint();
                        case 2: return getTopRailPoint();
                    }
                }
            }


            function getDistance(x1, x2, y1, y2) {

                var distance = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y1 - y2), 2));
                return distance;
            }
            function getIncorrectAnswerArea() {
                createjs.Sound.play("deflate");
                pop.stop("pop");
                var answersToRemove = mainView.getChildByName("answerContainer");
                mainView.removeChild(answersToRemove);
                gameState.timerOn = false;
                var soundStuff = stage.getChildByName("theSoundContainer");
                soundStuff.visible = true;
                var pointsEarned = (currentstate.shotsLeft * 50);
                var container = new createjs.Container();
                container.y = 100;

                var nextButton = helpers.createButton("Next");
                nextButton.x = 400;
                nextButton.regX = 50;
                nextButton.y = 450;

                nextButton.addEventListener("click", function (evt) {
                    createjs.Sound.play("buttonClick");
                    var theQuestionContainer = evt.currentTarget.parent;
                    self.currentView.removeChild(theQuestionContainer);
                    showNextQuestion();
                });

                var titleText = new createjs.Text("Sorry", "30pt Arial Black", "white");
                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                titleText.x = 400;
                titleText.regX = titleText.getBounds().width / 2;
                titleText.y = 60;
                var theCorrectAnswerLabel = new createjs.Text("The Correct Answer Is:", "20pt Arial bold", "white");
                theCorrectAnswerLabel.regX = theCorrectAnswerLabel.getBounds().width / 2;
                theCorrectAnswerLabel.x = 400;
                theCorrectAnswerLabel.y = 125;
                for (var i = 0; i < self.gameData.Questions[questionIndex].Answers.length; i++) {
                    if (self.gameData.Questions[questionIndex].Answers[i].IsCorrect) {
                        var theCorrectAnswer = new createjs.Text(self.gameData.Questions[questionIndex].Answers[i].Text, "20pt Arial bold", "white");
                        theCorrectAnswer.lineWidth = 600;
                        theCorrectAnswer.maxWidth = 600;
                        theCorrectAnswer.regX = theCorrectAnswer.getBounds().width / 2;
                        theCorrectAnswer.x = 400;
                        theCorrectAnswer.y = 155;
                    }
                }
                if (self.gameData.Questions[questionIndex].Feedback) {
                    var feedbackText = new createjs.Text(self.gameData.Questions[questionIndex].Feedback, "20pt Arial bold", "white");
                    feedbackText.lineWidth = 600;
                    feedbackText.maxWidth = 600;
                    feedbackText.regX = feedbackText.getBounds().width / 2;
                    feedbackText.x = 400;
                    feedbackText.y = (theCorrectAnswer.y + theCorrectAnswer.getBounds().height + 40);
                    container.addChild(feedbackText);
                }

                container.addChild(titleText, theCorrectAnswerLabel, theCorrectAnswer, nextButton);
                nextButton.cursor = 'pointer';

                return container;
            }

            function getCorrectAnswerArea() {
                var answersToRemove = mainView.getChildByName("answerContainer");
                mainView.removeChild(answersToRemove);
                gameState.timerOn = false;
                var soundStuff = stage.getChildByName("theSoundContainer");
                soundStuff.visible = true;
                var pointsEarned = (currentstate.shotsLeft * 50);
                var container = new createjs.Container();
                container.y = 100;

                var nextButton = helpers.createButton("Next");
                nextButton.x = 400;
                nextButton.regX = 50;
                nextButton.y = 450;

                nextButton.addEventListener("click", function (evt) {
                    createjs.Sound.play("buttonClick");
                    var theQuestionContainer = evt.currentTarget.parent;
                    self.currentView.removeChild(theQuestionContainer);
                    soundStuff.visible = false;
                    showNextQuestion();
                });

                var titleText = new createjs.Text("Correct! ", "30pt Arial Black", "white");
                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                titleText.x = 400;
                titleText.regX = titleText.getBounds().width / 2;
                titleText.y = 10;

                var pointsText = new createjs.Text("You earned " + pointsEarned + " points!", "30pt Arial Black", "white");
                pointsText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                pointsText.x = 400;
                pointsText.regX = pointsText.getBounds().width / 2;
                pointsText.y = 60;

                var theCorrectAnswerLabel = new createjs.Text("The Correct Answer Is:", "20pt Arial bold", "white");
                theCorrectAnswerLabel.regX = theCorrectAnswerLabel.getBounds().width / 2;
                theCorrectAnswerLabel.x = 400;
                theCorrectAnswerLabel.y = 125;
                for (var i = 0; i < self.gameData.Questions[questionIndex].Answers.length; i++) {
                    if (self.gameData.Questions[questionIndex].Answers[i].IsCorrect) {
                        var theCorrectAnswer = new createjs.Text(self.gameData.Questions[questionIndex].Answers[i].Text, "20pt Arial bold", "white");
                        theCorrectAnswer.lineWidth = 600;
                        theCorrectAnswer.maxWidth = 600;
                        theCorrectAnswer.regX = theCorrectAnswer.getBounds().width / 2;
                        theCorrectAnswer.x = 400;
                        theCorrectAnswer.y = 155;
                    }
                }
                if (self.gameData.Questions[questionIndex].Feedback) {
                    var feedbackText = new createjs.Text(self.gameData.Questions[questionIndex].Feedback, "20pt Arial bold", "white");
                    feedbackText.lineWidth = 600;
                    feedbackText.maxWidth = 600;
                    feedbackText.regX = feedbackText.getBounds().width / 2;
                    feedbackText.x = 400;
                    feedbackText.y = (theCorrectAnswer.y + theCorrectAnswer.getBounds().height + 40);
                    container.addChild(feedbackText);
                }

                container.addChild(theCorrectAnswerLabel, theCorrectAnswer, nextButton);
                container.addChild(titleText, pointsText, nextButton);
                gameState.score = gameState.score + pointsEarned;
                nextButton.cursor = 'pointer';
                ScoreText.text = gameState.score.toString();
                return container;
            }

            function showNextQuestion() {

                gameState.timer = timeLimit;
                Timer.visible = true;
                mainView.removeChild(currentArea);

                var oldQuestion = mainView.getChildByName("questionArea");
                if (oldQuestion != null) {
                    mainView.removeChild(oldQuestion);
                }
                currentArea = null;

                ++questionIndex;
                if (questionIndex < gameData.Questions.length) {
                    currentArea = getDisplayQuestionArea();


                }
                else {
                    currentArea = createWinnerView();
                }
                mainView.addChild(currentArea);
                stage.update();
            }

            function createWinnerView() {
                var targetCursor = stage.getChildByName("targetZone");
                stage.removeChild(targetCursor);
                var view = new createjs.Container();
                view.addChild(new createjs.Bitmap(queue.getResult("rf_skyFinalBackground")))
                if (gameState.score > 0) {
                    var titleText = new createjs.Text("You won " + gameState.score + " points!", "40pt Arial bold", "white");
                } else {
                    
                    var titleText = new createjs.Text("Sorry, you didn't win any points!", "40pt Arial bold", "white");
                }
                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                titleText.lineWidth = 600;
                titleText.maxWidth = 600;
                titleText.regX = titleText.getBounds().width / 2;
                titleText.x = 400;
                titleText.y = 50;



                    var startOverButton = new createjs.Container();
                    startOverButtonBackground = new createjs.Bitmap(queue.getResult("rf_greenRoundBalloon"));
                    startOverButtonBackground.scaleX = 2;
                    startOverButtonBackground.scaleY = 2;

                    var startingStartPositionX = getRandomInt(150, 650);
                    var startingStartPositionY = getRandomInt(190, 350);
                    startOverButton.x = startingStartPositionX;
                    startOverButton.y = startingStartPositionY;
                    createjs.Tween.get(startOverButton, { loop: true }).to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: getRandomInt(150, 650), y: getRandomInt(190, 350) }, 7000)
                                                                      .to({ x: startingStartPositionX, y: startingStartPositionY }, 7000);
                    startOverButton.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawCircle(80, 80, 80));

                    startOverButton.x = 180;
                    startOverButton.y = 300;
                    startOverButton.regX = 100;
                    startOverButton.regY = 35;
                    startOverButton.addChild(startOverButtonBackground);

                    var startOverText = new createjs.Text("Start\nOver", "20pt Arial", "white");
                    startOverText.textAlign = "center";
                    startOverText.textBaseline = "middle";
                    startOverText.x = 90;
                    startOverText.y = 75;
                    startOverText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                if (!isLmsConnected) {

                    startOverButton.addChild(startOverText)

         ////////////////////
                    startOverButton.addEventListener("click", function (evt) {

                        nextStep = "startOver";
                        questionIndex = 0;
                        gameState.score = 0;
                        createjs.Sound.play("buttonClick");
                        view.removeAllChildren();
                        showView(createTitleView());

                    });

                }
                submitScore(gameState.score);

                var thePop = function (event, nextStep) {
                    var target = event.currentTarget;
                    targetXCoordinate = target.x;
                    targetYCoordinate = target.y;
                    currentArea.removeChild(target);
                    var thePop = new createjs.Bitmap(queue.getResult("rf_POP"));
                    thePop.x = targetXCoordinate;
                    thePop.y = targetYCoordinate;
                    currentArea.addChild(thePop);
                    createjs.Tween.get(thePop)
                            .to({ scaleX: 3.5, scaleY: 3.5 }, 100)
                            .wait(400)
                            .call(function () {

                                if (nextStep == "startOver") {
                                    questionIndex = 0;
                                    gameState = {
                                        score: 0,
                                        speed: "slow",
                                        name: gameData.UserName || "",
                                        color: "#008080",
                                        score: 0,
                                        timerOn: false
                                       
                                    }
                                    showView(createTitleView());
                                } else if (nextStep == "rematch") {
                                    questionIndex = 0;
                                    gameState = {
                                        score: 0,
                                        speed: "slow",
                                        name: gameData.UserName || "",
                                        color: "#008080",
                                        score: 0,
                                        timerOn: false

                                        
                                    }
                                    createMainGameView();
                                } else {
                                    quit();
                                }




                            })
                    ;


                };


               


                if (isLmsConnected || navigator.userAgent.match(/Android/i)
                   || navigator.userAgent.match(/webOS/i)
                   || navigator.userAgent.match(/iPhone/i)
                   || navigator.userAgent.match(/iPad/i)
                   || navigator.userAgent.match(/iPod/i)
                   || navigator.userAgent.match(/BlackBerry/i)
                   || navigator.userAgent.match(/Windows Phone/i)
                   ) {

                    var quitButton = new createjs.Container();
                    quitButtonBackground = new createjs.Bitmap(queue.getResult("rf_blueRoundBalloon"))
                    quitButtonBackground.scaleX = 2;
                    quitButtonBackground.scaleY = 2;
                    quitButton.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawCircle(80, 80, 80));
                    quitButton.x = 730;
                    quitButton.y = 140;
                    quitButton.regX = 100;
                    quitButton.regY = 35;

                    createjs.Tween.get(quitButton, { loop: true })
                                                    .to({ x: 730, y: 100 }, 5000)
                                                    .to({ x: 730, y: 140 }, 5000)
                                                    .to({ x: 730, y: 100 }, 5000)
                                                    .to({ x: 730, y: 140 }, 5000)
                                                    .to({ x: 730, y: 100 }, 5000)
                    quitButton.cursor = 'pointer';
                    quitButton.addChild(quitButtonBackground);
                    quitButton.shadow = new createjs.Shadow("gray", 3, 3, 5);

                    var quitText = new createjs.Text("Quit", "20pt Arial", "white");
                    quitText.textAlign = "center";
                    quitText.textBaseline = "middle";
                    quitText.x = 85;
                    quitText.y = 75;
                    quitText.shadow = new createjs.Shadow("gray", 1, 1, 3);
                    quitButton.addChild(quitText)

                    quitButton.addEventListener("click", function (event) {
                       
                        thePop(event, "quit");

                    });
                    view.addChild(quitButton);

                    if (isLmsConnected) {
                        ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
                        ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.completed);

                        isLmsConnected = false;
                    }
                }
                if (!isLmsConnected) {
                    view.addChild(startOverButton);
                }
                view.addChild(titleText);// rematchButton,
                view.name = "WinnerView";
                return view;
            }

            function submitScore(score) {

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
            }
            function createInstructionsView() {
                var view = new createjs.Container();
                var image = new createjs.Bitmap(queue.getResult("rf_instructions"));

                var hit = new createjs.Shape();
                var exitContainer = new createjs.Container();
                var exitBox = new createjs.Shape();

                exitContainer.x = 720;
                exitContainer.y = 570;
                var exitText = new createjs.Text("BACK", 'bold 18px Arial', "#fff");
                exitText.x = 8;
                exitText.y = 8;
                exitContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#911F94").beginStroke("#000").setStrokeStyle(1).drawRoundRect(0, 0, 70, 37, 5).endFill().endStroke());
                hit.graphics.beginFill("#000").drawRect(0, 0, exitText.getMeasuredWidth(), exitText.getMeasuredHeight());
                exitBox.graphics.beginFill("#911F94").beginStroke("#000").setStrokeStyle(1).drawRoundRect(0, 0, 70, 37, 5).endFill().endStroke();
                exitText.hitArea = hit;
                exitContainer.addChild(exitBox, exitText);

                view.addChild(image, exitContainer);//, 

                exitContainer.addEventListener("click", function (event) {
                    showView(self.previousView);
                });

                return view;
            }
            var instructionsView = null;

            var getInstructionsView = function () {
                if (instructionsView == null) {
                    instructionsView = createInstructionsView();
                }

                return instructionsView;
            }

            self.previousView = null;
            self.currentView = null;



            var showView = function (view) {

                // TODO: add transition animation (fade)

                if (self.currentView) {
                    stage.removeChild(self.currentView);
                    self.previousView = self.currentView;
                }
                else {
                    self.previousView = null;
                }

                if (view) {
                    stage.addChild(view);
                    self.currentView = view;
                }
                else {
                    self.currentView = null;
                }


                if (self.currentView == instructionsView) {
                    stage.removeChild(instructionsContainer);
                }
                else {
                    stage.addChild(instructionsContainer, soundContainer);
                    if (self.currentView.name == "TitleView") {
                        soundContainer.visible = true;
                    }
                }

                stage.update();
            };

            var instructionsContainer = new createjs.Container();
            instructionsContainer.x = 0;
            instructionsContainer.y = 550;
            instructionsContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawCircle(0, 50, 50));
            instructionsContainer.cursor = 'pointer';

            instructionsContainer.addChild(new createjs.Bitmap(queue.getResult("instructions_background")));
            instructionsContainer.addChild(new createjs.Bitmap(queue.getResult("instructions_question")));

            stage.addChild(instructionsContainer);

            instructionsContainer.addEventListener("click", function () {
                showView(getInstructionsView());
            });

            var soundContainer = new createjs.Container();
            soundContainer.x = 0;
            soundContainer.y = 0;
            soundContainer.visible = true;
            soundContainer.name = "theSoundContainer";
            soundContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawCircle(0, 50, 50));
            soundContainer.cursor = 'pointer';
            var bg = new createjs.Bitmap(queue.getResult("instructions_background"));
            bg.rotation = 90;
            bg.x = 50;
            bg.y = 0;
            soundContainer.addChild(bg);
            var sound = new createjs.Bitmap(queue.getResult("musicOn"));
            sound.name = "musicOnImage"
            sound.scaleX = .75;
            sound.scaleY = .75;
            soundContainer.addChild(sound);
            soundContainer.addEventListener("click", function (evt) {
                if (musicOn == true) {

                    musicOn = false;
                    var sound = new createjs.Bitmap(queue.getResult("musicOff"));
                    sound.scaleX = .75;
                    sound.scaleY = .75;
                    sound.name = "musicOffImage"
                    var destroy = evt.currentTarget.getChildByName("musicOnImage");
                    evt.currentTarget.removeChild(destroy);
                    evt.currentTarget.addChild(sound);
                    createjs.Sound.setMute(true);

                } else {
                    musicOn = true;
                    var sound = new createjs.Bitmap(queue.getResult("musicOn"));
                    sound.scaleX = .75;
                    sound.scaleY = .75;
                    sound.name = "musicOnImage"
                    var destroy = evt.currentTarget.getChildByName("musicOffImage");
                    evt.currentTarget.removeChild(destroy);
                    evt.currentTarget.addChild(sound);
                    createjs.Sound.setMute(false);

                }
            });
            showView(createTitleView());
            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener("tick", handleTick);
            function handleTick(event) {
                stage.update();
            }


        };////


    }

    return Game;
})(createjs, $);