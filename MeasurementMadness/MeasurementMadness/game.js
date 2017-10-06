/// <reference path="createjs.min.js" />
var Game = Game || (function (createjs) {


    function Game(canvas, gameData) {
        // this is our constructor to the game
        var self = this;

        var stage = new createjs.Stage(canvas);
        stage.enableMouseOver(10);
        var currentPage = null;
        var assetsPath = gameData.assetsPath || "";

        assetsPath += "images/"

        var assets = [

            { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
            { id: "RedXXX", src: assetsPath + "X.png" },
            { id: "Buzzer", src: assetsPath + "WrongBuzzer.mp3" },
            { id: "Correct", src: assetsPath + "Correct.mp3" },
            { id: "backgroundImage", src: assetsPath + "background.jpg" },
            { id: "button", src: assetsPath + "button.png" },
            { id: "selectedButton", src: assetsPath + "SelectedButton.png" },
            { id: "dirPanel", src: assetsPath + "PanelBG.png" },
            { id: "ButtonSprite", src: assetsPath + "spritesheetnomargin.png" },
            { id: "facebookShare", src: assetsPath + "FBShareIcon.png" },
            { id: "TitleImage", src: assetsPath + "measurementMadnessTitle.png" }
        ];

        var queue = new createjs.LoadQueue(false);
        function LoadAssets() {

            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                var introPage = createIntroductionPage();

                showPage(introPage);
                createTitle();
            });
            queue.loadManifest(assets);
        }


        createjs.Ticker.setFPS(40);
        createjs.Ticker.addEventListener("tick", handleTick);
        function handleTick() {
            stage.update();
        }

        //for (var d = 0; d < gameData.Questions.length; d++) {
        //    gameData.Questions[d].OrderId = d;
        //}
        var questionsArray = [];
        var usedQuestions = [];
        var score = 0;
        var questionIndex = 0;
        var strikes = 0;
        var level = 1;
        var timer = 10;
        var quartersSelected = false;
        var eightsSelected = false;
        var sixteenthsSelected = false;
        var thirtySecondsSelected = false;
        var highScoreGameType = false;


        questionsArray = gameData.questions;
        shuffle(questionsArray);
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




        var settings = {
            ruler: {
                pixelsPerDivision: 5,
                divisionsPerInch: 32,
                divisionsPerCentimenter: 10
            }
        }


        function showPage(page) {

            if (currentPage != null) {
                var pageToRemove = currentPage;
                createjs.Tween.get(currentPage).to({ alpha: 0 }, 250).call(function () {
                    stage.removeChild(pageToRemove);
                });
            }

            currentPage = page;

            if (currentPage != null) {
                currentPage.alpha = 0;

                stage.addChild(currentPage);

                createjs.Tween.get(currentPage).to({ alpha: 1 }, 250);
            }
        }

        function createTitle() {


            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            stage.addChild(titleImage);
        }
        function DirectionsPanel() {
            var directionsPanel = new createjs.Bitmap(queue.getResult("dirPanel"));
            directionsPanel.scaleX = .26;
            directionsPanel.scaleY = .25;


            return directionsPanel;
        }
        function createIntroductionPage() {

            var page = new createjs.Container();

            //var Title = new createjs.Text("Measurement Madness", "24px Arial", "black");
            //Title.x = 5;
            //Title.y = 5
            //page.addChild(Title);
            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);

            var directionsPanel = DirectionsPanel();
            directionsPanel.x = -30;
            directionsPanel.y = 60;

            page.addChild(directionsPanel);

            var directionsPanelText = new createjs.Text("Welcome to Measurement Madness. \n\n This game will test you speed and finding measurements on a ruler.", "15px Arial bold", "White");
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 80;

            page.addChild(directionsPanelText);

            var buttonContainer = new createjs.Container();

            var ButtonX = 500;
            var ButtonY = 100;
            var data = {
                images: [queue.getResult("ButtonSprite")],
                frames: { width: 200, height: 90, count: 2 },
                animations: {
                    selected: 0,
                    original: 1
                }
            };

            var spriteSheet = new createjs.SpriteSheet(data);

            var selectQuarters = new createjs.Sprite(spriteSheet, "original");
            selectQuarters.x = ButtonX;
            selectQuarters.y = ButtonY;
            buttonContainer.addChild(selectQuarters);
            var selectQuartersText = new createjs.Text("Quarters", "26px Arial bold", "yellow");
            selectQuartersText.x = ButtonX + 50;
            selectQuartersText.y = selectQuarters.y + 20;
            buttonContainer.addChild(selectQuartersText);

            var selectEights = new createjs.Sprite(spriteSheet, "original");
            selectEights.x = ButtonX;
            selectEights.y = ButtonY + 70;
            buttonContainer.addChild(selectEights);
            var selectEightsText = new createjs.Text("Eights", "26px Arial bold", "yellow");
            selectEightsText.x = ButtonX + 65;
            selectEightsText.y = selectEights.y + 20;
            buttonContainer.addChild(selectEightsText);


            var selectSixteenths = new createjs.Sprite(spriteSheet, "original");
            selectSixteenths.x = ButtonX;
            selectSixteenths.y = ButtonY + 140;
            buttonContainer.addChild(selectSixteenths);
            var selectselectSixteenthsText = new createjs.Text("Sixteenths", "26px Arial bold", "yellow");
            selectselectSixteenthsText.x = ButtonX + 50;
            selectselectSixteenthsText.y = selectSixteenths.y + 20;
            buttonContainer.addChild(selectselectSixteenthsText);

            var selectThirtySeconds = new createjs.Sprite(spriteSheet, "original");
            selectThirtySeconds.x = ButtonX;
            selectThirtySeconds.y = ButtonY + 210;
            buttonContainer.addChild(selectThirtySeconds);
            var selectThirtySecondsText = new createjs.Text("Thirty Seconds", "26px Arial bold", "yellow");
            selectThirtySecondsText.x = ButtonX + 20;
            selectThirtySecondsText.y = selectThirtySeconds.y + 20;
            buttonContainer.addChild(selectThirtySecondsText);

            var highScore = new createjs.Sprite(spriteSheet, "original");
            highScore.x = ButtonX;
            highScore.y = ButtonY + 280;
            buttonContainer.addChild(highScore);
            var highScoreText = new createjs.Text("High Score", "26px Arial bold", "yellow");
            highScoreText.x = ButtonX + 40;
            highScoreText.y = highScore.y + 20;
            buttonContainer.addChild(highScoreText);


            var playbtn = new createjs.Sprite(spriteSheet, "original");
            playbtn.x = ButtonX + 100;
            playbtn.y = ButtonY + 400;
            buttonContainer.addChild(playbtn);
            var playbtnText = new createjs.Text("Start", "26px Arial bold", "yellow");
            playbtnText.x = playbtn.x + 80;
            playbtnText.y = playbtn.y + 30;
            buttonContainer.addChild(playbtnText);

            page.addChild(buttonContainer);

            selectQuarters.addEventListener("click", function () {

                if (selectQuarters.currentFrame == 0) {
                    selectQuarters.gotoAndStop("original")
                    quartersSelected = true;

                } else {
                    quartersSelected = false;
                    selectQuarters.gotoAndStop("selected")

                }

            });

            selectEights.addEventListener("click", function () {

                if (selectEights.currentFrame == 0) {
                    selectEights.gotoAndStop("original")
                    eightsSelected = true;
                } else {
                    eightsSelected = false;
                    selectEights.gotoAndStop("selected")
                }



            });
            selectSixteenths.addEventListener("click", function () {
                if (selectSixteenths.currentFrame == 0) {
                    selectSixteenths.gotoAndStop("original")
                    sixteenthsSelected = true;

                } else {
                    selectSixteenths.gotoAndStop("selected")
                    sixteenthsSelected = false;
                }

            });
            selectThirtySeconds.addEventListener("click", function () {
                if (selectThirtySeconds.currentFrame == 0) {
                    selectThirtySeconds.gotoAndStop("original")
                    thirtySecondsSelected = true;
                } else {
                    selectThirtySeconds.gotoAndStop("selected")
                    thirtySecondsSelected = false;
                }

            });
            highScore.addEventListener("click", function () {

                if (highScore.currentFrame == 0) {
                    highScore.gotoAndStop("original")
                    highScoreGameType = false;
                } else {
                    highScore.gotoAndStop("selected")
                    highScoreGameType = true;
                }

            });
            playbtn.addEventListener("click", function () {
                showPage(createGamePage());
            });
            return page;
        }
        var timerTween;
        function createGamePage() {


            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);


            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            page.addChild(titleImage);
            //var Title = new createjs.Text("Measurement Madness", "24px Arial", "black");
            //Title.x = 5;
            //Title.y = 5
            //page.addChild(Title);

            //Paint Text boxes

            var scoreTextDisplay = displayScoreText();
            page.addChild(scoreTextDisplay);

            var strikesDisplay = new createjs.Text("Strikes: " + strikes, "18px Arial", "White");
            strikesDisplay.x = 110;
            strikesDisplay.y = 150
            page.addChild(strikesDisplay);

            var levelDisplay = new createjs.Text("Level: " + level, "18px Arial", "White");
            levelDisplay.x = 210;
            levelDisplay.y = 150
            page.addChild(levelDisplay);
            if (highScoreGameType == true) {
                var timerDisplay = displayTimerText()
                page.addChild(timerDisplay);
            }


            var questionDisplay = displayQuestionText();
            page.addChild(questionDisplay);


            var rulerLength = 6.25;
            var ruler = createRuler(rulerLength);

            var rulerWidthPixels = rulerLength * settings.ruler.pixelsPerDivision * settings.ruler.divisionsPerInch;

            var targetRulerWidthOfCanvasPercent = 1.0;


            ruler.x = 0
            ruler.y = 0;
            // ruler.regX = ruler.width / 2;
            //  ruler.regY = ruler.height / 2;
            if (questionIndex >= 1) {
                ruler.x = 0
                ruler.y = 100;
            } else {
                createjs.Tween.get(ruler).to({ x: 0, y: 100 }, 3000)
            }

            ruler.scaleX = targetRulerWidthOfCanvasPercent * (stage.canvas.width / rulerWidthPixels)

            page.addChild(ruler);

            createjs.Ticker.on("tick", stage);

            if (highScoreGameType == true) {

                //Create a shape
                var bar = new createjs.Shape()
                    .set({ x: 380, y: 140 }); // Move away from the top left.
                page.addChild(bar);

                // Draw the outline
                bar.graphics.setStrokeStyle(2)
                    .beginStroke("black")
                    .drawRect(-1, -1, 302, 26)
                    .endStroke();

                // Draw the fill. Only set the style here
                var fill = new createjs.Shape().set({ x: 380, y: 140, scaleX: 0 });
                fill.graphics.beginFill("orange").drawRect(0, 0, 300, 24);
                page.addChild(fill);
            }

            if (questionIndex > 0) {
                if (highScoreGameType == true) {

                    timerTween.setPosition(0, 0);
                    timerTween = createjs.Tween.get(fill, { override: true })
                        .to({ scaleX: 1 }, timer * 1000, createjs.Ease.quadIn).wait(.01).call(function () {
                            strikes += 1;
                            timerTween.paused = true;
                            timerTween.setPaused(true);
                            displayXXX_YourWrong();
                        });
                }
            } else {
                if (highScoreGameType == true) {

                    timerTween = createjs.Tween.get(fill, { override: true })
                        .wait(3000)
                        .to({ scaleX: 1 }, timer * 1000, createjs.Ease.quadIn).wait(.01).call(function () {
                            strikes += 1;
                            timerTween.paused = true;
                            timerTween.setPaused(true);
                            displayXXX_YourWrong();
                        });
                }
            }

            return page;

        }
        function displayQuestionText() {
            var questionDisplay = new createjs.Text(questionsArray[questionIndex].text, "26px Arial bold", "yellow");
            questionDisplay.x = 10;
            questionDisplay.y = 250
            //  page.addChild(questionDisplay);
            return questionDisplay;
        }
        var scoreTextDisplay;
        function displayScoreText() {

            scoreTextDisplay = new createjs.Text("Score: " + score, "18px Arial", "White");
            scoreTextDisplay.x = 10;
            scoreTextDisplay.y = 150
            //page.addChild(scoreTextDisplay);
            return scoreTextDisplay;
        }
        var timerDisplay;
        function displayTimerText() {
            timerDisplay = new createjs.Text("Timer: ", "18px Arial", "White");
            timerDisplay.x = 310;
            timerDisplay.y = 150
            return timerDisplay

        }
        function CheckAnswer(answerValue) {
            // timerTween.setPaused(true);
            if (highScoreGameType == true) {
                timerTween.paused = true;
                timerTween.setPaused(true);
            }
            if (answerValue == questionsArray[questionIndex].value) {
                givePoints();
                createjs.Sound.play("Correct");
                incrementQuestion();
                showPage(createGamePage());

            } else {

                strikes += 1;
                displayXXX_YourWrong();
            }
            //Check if its correct



        }
        function displayXXX_YourWrong() {
            //deliver X image.
            var redXXX = new createjs.Bitmap(queue.getResult("RedXXX"));
            redXXX.x = (stage.canvas.width / 3)
            redXXX.y = (stage.canvas.height / 4)
            //redXXX.scaleX = 0.05;
            //redXXX.scaleY = 0.05;

            stage.addChild(redXXX);
            createjs.Sound.play("Buzzer");


            setTimeout(function () {
                stage.removeChild(redXXX)
                if (strikes >= 3) {
                    showPage(GameOverScreen());
                } else {
                    incrementQuestion();
                    showPage(createGamePage());
                }
            }, 1500);

        }
        function incrementQuestion() {
            questionIndex += 1;
        }

        function givePoints() {
            if (score > 0 && score < 20) {
                level = 1;
            } else if (score > 20 && score < 40) {
                level = 2;
            } else if (score > 40 && score < 60) {
                level = 3;
            } else if (score > 60 && score < 80) {
                level = 4;
            } else if (score > 300 && score < 400) {
                level = 5;
            } else if (score > 400 && score < 500) {
                level = 6;
            } else if (score > 500 && score < 600) {
                level = 7;
            } else if (score > 600 && score < 700) {
                level = 8;
            } else if (score > 700 && score < 800) {
                level = 9;
            } else if (score > 800 && score < 900) {
                level = 10;
            } else if (score > 900) {
                level = 10;
            }



            switch (level) {
                case 1:
                    score += 10;
                    break;
                case 2:
                    score += 20;
                    break;
                case 3:
                    score += 30;
                    break;
                case 4:
                    score += 40;
                    break;
                case 5:
                    score += 50;
                    break;
                case 6:
                    score += 60;
                    break;
                case 7:
                    score += 70;
                    break;
                case 8:
                    score += 80;
                    break;
                case 9:
                    score += 90;
                    break;
                case 10:
                    score += 100;
                    break;
            }

        }

        function createRuler(lengthInInches) {
            var ruler = new createjs.Container();

            var pixelsPerDivision = settings.ruler.pixelsPerDivision;

            var totalDivisions = settings.ruler.divisionsPerInch * (lengthInInches);

            var cmPerInch = 2.54;

            var rectangle = new createjs.Shape();
            var rulerHeight = 200;
            rectangle.graphics.beginStroke("black").beginFill("white").drawRect(0, 200, totalDivisions * pixelsPerDivision, rulerHeight);

            ruler.addChild(rectangle);

            var divisionContainer;
            var backgroundOfDivision;

            var division, divisionHeight, numberText;
            //Paint Standard Ruler
            for (var i = 0; i < totalDivisions; ++i) {

                divisionContainer = new createjs.Container();
                divisionContainer.value = i * (1 / settings.ruler.divisionsPerInch);

                backgroundOfDivision = new createjs.Shape();

                division = new createjs.Shape();
                division.x = i * pixelsPerDivision
                division.graphics.setStrokeStyle(0.5).beginStroke("black");

                if (i % 32 == 0) {
                    // make big line
                    divisionHeight = 70;

                    if (i > 0) {
                        var numberText = new createjs.Text((i / 32).toString(), "32px Arial", "black");

                        numberText.x = division.x;
                        numberText.y = divisionHeight + 200;
                        numberText.textAlign = "center";

                        divisionContainer.addChild(numberText);
                    }

                }
                else if (i % 8 == 0) {
                    // make 1/4 inch line
                    divisionHeight = 60;
                }
                else if (i % 4 == 0) {
                    // make 1/8 inch line
                    divisionHeight = 45;
                }
                else if (i % 2 == 0) {
                    // make 1/16 inch line
                    divisionHeight = 30;
                }
                else {
                    // make 1/32 inch line
                    divisionHeight = 15;

                }
                backgroundOfDivision.graphics.setStrokeStyle(0.5).beginStroke("Green").beginFill("Green");
                backgroundOfDivision.alpha = 0.0;
                backgroundOfDivision.graphics.drawRect(-pixelsPerDivision / 2, 200, pixelsPerDivision, divisionHeight).endStroke();
                backgroundOfDivision.x = i * pixelsPerDivision;

                division.graphics.drawRect(0, 200, 0, divisionHeight).endStroke();
                divisionContainer.divisionHeight = divisionHeight;
                divisionContainer.division = division;
                divisionContainer.backgroundOfDivision = backgroundOfDivision;

                divisionContainer.addChild(backgroundOfDivision);
                divisionContainer.addEventListener("rollover", function (e) {
                    createjs.Tween.get(e.currentTarget.backgroundOfDivision).to({ alpha: 1.0 }, 500);
                });
                divisionContainer.addEventListener("rollout", function (e) {
                    createjs.Tween.get(e.currentTarget.backgroundOfDivision, { override: true }).to({ alpha: 0.0 }, 250);
                });
                divisionContainer.addEventListener("mousedown", function (e) {

                    // alert("Clicked Value: " + e.currentTarget.value.toString());
                    var isAnswerCorrect = CheckAnswer(e.currentTarget.value.toString());


                });

                divisionContainer.addChild(division);
                ruler.addChild(divisionContainer);
            }



            //set up metric ruler
            var mmPixelsPerDivision = (pixelsPerDivision * settings.ruler.divisionsPerInch) / 25.4
            var mmLengthInches = 0;
            var mmInches = 0.0254;


            //Paint Metric Ruler

            for (var m = 0; m < 160; ++m) {
                // for (var m = 0; mmLengthInches <= lengthInInches; ++m) {
                mmDivision = new createjs.Shape();
                divisionContainer = new createjs.Container();
                divisionContainer.value = m * (10 / settings.ruler.divisionsPerCentimenter);

                divisionContainer.y = rulerHeight;
                divisionContainer.x = m * mmPixelsPerDivision;

                mmDivision.graphics.setStrokeStyle(0.5).beginStroke("Black");

                if (m % 10 == 0) {
                    //make big line
                    divisionHeight = 45;

                    if (m > 0) {
                        var mmNumberText = new createjs.Text((m).toString(), "32px Arial", "black");
                        mmNumberText.textAlign = "center";
                        mmNumberText.y = -divisionHeight + 170;

                        divisionContainer.addChild(mmNumberText);
                    }
                }
                else {
                    //make small line
                    divisionHeight = 25;
                }

                backgroundOfDivision = new createjs.Shape();
                backgroundOfDivision.graphics.setStrokeStyle(0.5).beginStroke("Green").beginFill("Green");
                backgroundOfDivision.alpha = 0.0;
                backgroundOfDivision.graphics.drawRect(-mmPixelsPerDivision / 2, 200, mmPixelsPerDivision, -divisionHeight).endStroke();

                //backgroundOfDivision.x = m * mmPixelsPerDivision;


                backgroundOfDivision.textAlign = "center";


                divisionContainer.backgroundOfDivision = backgroundOfDivision;

                divisionContainer.addChild(backgroundOfDivision);

                mmDivision.graphics.drawRect(0, 200, 0, -divisionHeight).endStroke();

                divisionContainer.x = m * mmPixelsPerDivision
                divisionContainer.y = 200;

                divisionContainer.divisionHeight = -divisionHeight;
                divisionContainer.mmDivision = mmDivision;

                divisionContainer.addChild(mmDivision);

                divisionContainer.addEventListener("rollover", function (e) {
                    createjs.Tween.get(e.currentTarget.backgroundOfDivision).to({ alpha: 1.0 }, 500);
                });
                divisionContainer.addEventListener("rollout", function (e) {

                    createjs.Tween.get(e.currentTarget.backgroundOfDivision, { override: true }).to({ alpha: 0.0 }, 250);
                });
                divisionContainer.addEventListener("mousedown", function (e) {

                    // alert("Clicked Value: " + e.currentTarget.value.toString());
                    CheckAnswer(e.currentTarget.value.toString())
                });

                ruler.addChild(divisionContainer);

                mmLengthInches += mmInches;
            }

            return ruler;
        }

        function resetGameVariables() {
            score = 0;
            questionIndex = 0;
            strikes = 0;
            level = 1;
            timer = 10;
            shuffle(questionsArray);
        }

        function GameOverScreen() {
            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);


            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            page.addChild(titleImage);

            var directionsPanel = DirectionsPanel();
            directionsPanel.x = -30;
            directionsPanel.y = 60;

            page.addChild(directionsPanel);
            var directionsPanelText = new createjs.Text("Way to go!", "15px Arial bold", "White");
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 80;

            page.addChild(directionsPanelText);

            var FbShareButton = new createjs.Bitmap(queue.getResult("facebookShare"));
            FbShareButton.scaleX = .10;
            FbShareButton.scaleY = .10;
            FbShareButton.x = 100;
            FbShareButton.y = 300;
            page.addChild(FbShareButton);

            FbShareButton.addEventListener("click", function () {
                FB.ui(
                    {
                        method: 'share',
                        href: 'https://www.wisc-online.com/learn/technical/core-skills/ccs13617/measurement-madness',
                        quote: 'I got a score of ' + score + ' on Measurement Madness. Can you beat my high score?'
                    }, function (response) { }
                );
            });




            return page;

        }


        self.start = function () {
            // var introPage = createIntroductionPage();
            LoadAssets();
            //showPage(introPage);
        }

    }


    return Game;
})(createjs);



