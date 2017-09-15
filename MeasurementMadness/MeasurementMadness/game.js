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

            { id: "start_button", src: assetsPath + "SequencePlayButton.png" }
            
        ];

        var queue = new createjs.LoadQueue(false);
        queue.installPlugin(createjs.Sound);
        queue.addEventListener("complete", function (event) {
            //Paint board
            addBackground();
        });
        queue.loadManifest(assets);


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



        function createIntroductionPage() {

            var page = new createjs.Container();

            var Title = new createjs.Text("Measurement Madness", "24px Arial", "black");
            Title.x = 5;
            Title.y = 5
            page.addChild(Title);

            var circle = new createjs.Shape();
            circle.graphics.beginFill("red").drawCircle(0, 0, 50);
            circle.x = 100;
            circle.y = 100;
            page.addChild(circle);
            // do the stuff on the page, setup click handlers, etc...
            var startButton = new createjs.Bitmap(queue.getResult("start_button"));

            startButton.regX = 93;
            startButton.regY = 95;
            startButton.x = 650;
            startButton.y = 350;
            startButton.scaleX = startButton.scaleY = 0.20;
            page.addChild(startButton);

            circle.addEventListener("click", function () {
                showPage(createGamePage());
            });

            return page;
        }

        function createGamePage() {

            var page = new createjs.Container();

            var background = new createjs.Shape();
            background.graphics.beginStroke("Green").beginFill("Green").drawRect(0, 0, 800, 600);
            page.addChild(background);

            var Title = new createjs.Text("Measurement Madness", "24px Arial", "black");
            Title.x = 5;
            Title.y = 5
            page.addChild(Title);

            //Paint Text boxes

            var scoreTextDisplay = displayScoreText();
            page.addChild(scoreTextDisplay);


            var strikesDisplay = new createjs.Text("Strikes: " + strikes, "18px Arial", "black");
            strikesDisplay.x = 110;
            strikesDisplay.y = 50
            page.addChild(strikesDisplay);

            var levelDisplay = new createjs.Text("Level: " + level, "18px Arial", "black");
            levelDisplay.x = 210;
            levelDisplay.y = 50
            page.addChild(levelDisplay);

            var timerDisplay = new createjs.Text("Timer: " + timer, "18px Arial", "black");
            timerDisplay.x = 310;
            timerDisplay.y = 50
            page.addChild(timerDisplay);

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
            // do the stuff on the page, setup click handlers, etc...

            return page;
        }
        function displayQuestionText() {
            var questionDisplay = new createjs.Text(questionsArray[questionIndex].text, "26px Arial bold", "yellow");
            questionDisplay.x = 10;
            questionDisplay.y = 150
            //  page.addChild(questionDisplay);
            return questionDisplay;
        }
        var scoreTextDisplay;
        function displayScoreText() {

            scoreTextDisplay = new createjs.Text("Score: " + score, "18px Arial", "black");
            scoreTextDisplay.x = 10;
            scoreTextDisplay.y = 50
            //page.addChild(scoreTextDisplay);
            return scoreTextDisplay;
        }

        function CheckAnswer(answerValue) {
            if (answerValue == questionsArray[questionIndex].value) {
                givePoints();

            } else {
                displayXXX_YourWrong();
                strikes += 1;
            }
            //Check if its correct

            incrementQuestion();
            showPage(createGamePage());
        }
        function displayXXX_YourWrong() {
            //deliver X image.
        }
        function incrementQuestion() {
            questionIndex += 1;
        }

        function givePoints() {
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
                    //Check if its correct
                    if (isAnswerCorrect) {
                        givePoints();
                        incrementQuestion()
                        //playCorrectAudioClip();
                    }
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
                    CheckAnswer(e.currentTarget.value.toString());

                });

                ruler.addChild(divisionContainer);

                mmLengthInches += mmInches;
            }

            return ruler;
        }



        self.start = function () {
            var introPage = createIntroductionPage();

            showPage(introPage);
        }

    }


    return Game;
})(createjs);



