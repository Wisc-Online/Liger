﻿/// <reference path="createjs.min.js" />
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


            { id: "RedXXX", src: assetsPath + "X.png" },
            { id: "Buzzer", src: assetsPath + "WrongBuzzer.mp3" },
            { id: "NiceWrong", src: assetsPath + "nicewrong.wav" },
            { id: "Correct", src: assetsPath + "Correct.mp3" },
            { id: "btnClick", src: assetsPath + "btnClick.mp3" },
            { id: "backgroundImage", src: assetsPath + "background.jpg" },
            { id: "button", src: assetsPath + "button.png" },
            { id: "selectedButton", src: assetsPath + "SelectedButton.png" },
            { id: "dirPanel", src: assetsPath + "PanelBG.png" },
            { id: "smallpanel", src: assetsPath + "panelBG_400x300.png" },
            { id: "ButtonSprite", src: assetsPath + "spritesheetnomargin.png" },
            { id: "LevelsTextImage", src: assetsPath + "levelstext.png" },
            { id: "facebookShare", src: assetsPath + "FBShareIcon.png" },
            { id: "tweetscore", src: assetsPath + "Twitter.png" },
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
        var millemetersSelected = false;
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
        function btnClick() {
            createjs.Sound.play("btnClick");
        }
        function createTitle() {
            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            stage.addChild(titleImage);
        }
        function DirectionsPanel() {
            var directionsPanel = new createjs.Bitmap(queue.getResult("dirPanel"));
            directionsPanel.scaleX = .22;
            directionsPanel.scaleY = .25;

            return directionsPanel;
        }
        function createLevelsDisplay() {

            var levelsDisplayPanel = new createjs.Container();

            var directionsPanel = DirectionsPanel();
            directionsPanel.x = -30;
            directionsPanel.y = 60;
            levelsDisplayPanel.addChild(directionsPanel)

            var levelsTextImagedisplay = new createjs.Bitmap(queue.getResult("LevelsTextImage"));
            levelsTextImagedisplay.scaleX = levelsTextImagedisplay.scaleY = .20;
            //levelsTextImagedisplay.scaleY = .25;
            levelsTextImagedisplay.x = 50
            levelsTextImagedisplay.y = 150
            levelsDisplayPanel.addChild(levelsTextImagedisplay);

            var spriteSheet = createSpriteSheet();

            var closeBtn = new createjs.Sprite(spriteSheet, "original");
            closeBtn.x = 150;
            closeBtn.y = 460
            levelsDisplayPanel.addChild(closeBtn);

            var closeText = new createjs.Text("Close", "18px Arial bold", "yellow");
            closeText.x = closeBtn.x + 100;
            closeText.y = closeBtn.y + 25;
            closeText.textAlign = "center";
            levelsDisplayPanel.addChild(closeText);

            stage.addChild(levelsDisplayPanel);

            closeBtn.addEventListener("click", function () {
                btnClick();
                stage.removeChild(levelsDisplayPanel);
            });
        }
        function createIntroductionPage() {
            clickedAnswerNowWait = false;
            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);

            var directionsPanel = DirectionsPanel();
            directionsPanel.x = -30;
            directionsPanel.y = 60;

            page.addChild(directionsPanel);

            var directionsPanelText = new createjs.Text("Welcome to Measurement Madness. \n\nThis game will test your speed on finding measurements on a ruler. \n\nSelect the unit(s) that you want to test your knowledge with. \n\nHigh Score: \nSelecting this will keep your score and be timed. Each level the amount of time given will decrease. Challange friends on Twitter and Facebook to beat your score.", "15px Arial bold", "White");
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 80;
            directionsPanelText.lineWidth = 300;
            page.addChild(directionsPanelText);

            var btnContainer = new createjs.Container();
            var spriteSheet = createSpriteSheet();
            var levelsbtn = new createjs.Sprite(spriteSheet, "original");
            levelsbtn.x = 150;
            levelsbtn.y = 460
            btnContainer.addChild(levelsbtn);
            var levelsText = new createjs.Text("Level \nInformation", "18px Arial bold", "yellow");
            levelsText.x = levelsbtn.x + 100;
            levelsText.y = levelsbtn.y + 25;
            levelsText.textAlign = "center";
            btnContainer.addChild(levelsText);
            page.addChild(btnContainer);

            levelsbtn.addEventListener("click", function () {
                //Display Level
                btnClick();
                createLevelsDisplay()
            });

            var buttonContainer = createAllButtons();
            page.addChild(buttonContainer);

            return page;
        }
        var timerTween;
        function createGamePage() {
            clickedAnswerNowWait = false;

            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);


            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            page.addChild(titleImage);
            if (highScoreGameType == true) {
                var scoreTextDisplay = displayScoreText();
                page.addChild(scoreTextDisplay);


                var strikesDisplay = new createjs.Text("Strikes: " + strikes, "18px Arial", "White");
                strikesDisplay.x = 10;
                strikesDisplay.y = 100
                page.addChild(strikesDisplay);

                var levelDisplay = new createjs.Text("Level: " + level, "18px Arial", "White");
                levelDisplay.x = 10;
                levelDisplay.y = 130
                page.addChild(levelDisplay);
            }
            //}
            if (highScoreGameType == true) {
                var timerDisplay = displayTimerText()
                page.addChild(timerDisplay);
            }

            var questionDisplay = displayQuestionText();
            if (questionDisplay != null) {
                page.addChild(questionDisplay);
            }

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
                    .set({ x: 70, y: 160 }); // Move away from the top left.
                page.addChild(bar);

                // Draw the outline
                bar.graphics.setStrokeStyle(2)
                    .beginStroke("Green")
                    .drawRect(-1, -1, 302, 22)
                    .endStroke();

                // Draw the fill. Only set the style here
                var fill = new createjs.Shape().set({ x: 70, y: 160, scaleX: 0 });
                fill.graphics.beginFill("orange").drawRect(0, 0, 300, 20);
                page.addChild(fill);
            }

            if (questionIndex > 0) {
                if (highScoreGameType == true) {

                    timerTween.setPosition(0, 0);
                    timerTween = createjs.Tween.get(fill, { override: true })
                        .to({ scaleX: 1 }, timer * 1000, createjs.Ease.quadIn).wait(.01).call(function () {
                            clickedAnswerNowWait = true;
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
                            clickedAnswerNowWait = true;
                            strikes += 1;
                            timerTween.paused = true;
                            timerTween.setPaused(true);
                            displayXXX_YourWrong();
                        });
                }
            }
            if (questionDisplay == null || questionDisplay == undefined) {
                page = GameOverScreen();
                return page;
            } else {
                return page;
            }


        }
        var whatKindOfQuestionIsThis = new Array();
        var iGotAValidQuestion = false;
        function displayQuestionText() {
            iGotAValidQuestion = false;

            while (iGotAValidQuestion == false) {
                whatKindOfQuestionIsThis = [];
                if (questionIndex >= questionsArray.length) {
                    iGotAValidQuestion = false;

                    break;
                }
                if (((questionsArray[questionIndex].value * 4) % 1 === 0) && questionsArray[questionIndex].unit != "mm") {
                    //was quarters

                    if (quartersSelected == true) {
                        iGotAValidQuestion = true;
                        whatKindOfQuestionIsThis.push("Quarters");
                    }
                }
                if (((questionsArray[questionIndex].value * 8) % 1 === 0) && questionsArray[questionIndex].unit != "mm") {

                    if (eightsSelected == true) {
                        iGotAValidQuestion = true;
                        whatKindOfQuestionIsThis.push("Eights");
                    }
                }
                if (((questionsArray[questionIndex].value * 16) % 1 === 0) && questionsArray[questionIndex].unit != "mm") {

                    if (sixteenthsSelected == true) {
                        iGotAValidQuestion = true;
                        whatKindOfQuestionIsThis.push("Sixteenths")
                    }
                }
                if (((questionsArray[questionIndex].value * 32) % 1 === 0) && questionsArray[questionIndex].unit != "mm") {

                    if (thirtySecondsSelected == true) {
                        iGotAValidQuestion = true;
                        whatKindOfQuestionIsThis.push("ThirtySeconds");
                    }
                }
                if (questionsArray[questionIndex].unit == "mm") {

                    if (millemetersSelected == true) {
                        iGotAValidQuestion = true;
                        whatKindOfQuestionIsThis.push("MM");
                    }
                }
                if (iGotAValidQuestion != true) {
                    questionIndex++;
                }
            }
            if (iGotAValidQuestion == true) {
                if (questionIndex <= questionsArray.length) {

                    var questionDisplay = new createjs.Text(questionsArray[questionIndex].text, "22px Arial bold", "yellow");
                    questionDisplay.x = 10;
                    questionDisplay.y = 250
                }
            }

            //  page.addChild(questionDisplay);
            return questionDisplay;
        }
        var scoreTextDisplay;
        function displayScoreText() {

            scoreTextDisplay = new createjs.Text("Score: " + score, "18px Arial", "White");
            scoreTextDisplay.x = 10;
            scoreTextDisplay.y = 70
            //page.addChild(scoreTextDisplay);
            return scoreTextDisplay;
        }
        var timerDisplay;
        function displayTimerText() {
            timerDisplay = new createjs.Text("Timer: ", "18px Arial", "White");
            timerDisplay.x = 10;
            timerDisplay.y = 160
            return timerDisplay

        }
        function CheckAnswer(answerValue) {
            if (highScoreGameType == true) {
                timerTween.paused = true;
                timerTween.setPaused(true);
            }
            if (answerValue.value == questionsArray[questionIndex].value && answerValue.unit.toString() == questionsArray[questionIndex].unit) {
                givePoints();
                createjs.Sound.play("Correct");
                incrementQuestion();
                if (questionIndex <= questionsArray.length) {
                    clickedAnswerNowWait = false;
                    showPage(createGamePage());
                } else {
                    showPage(GameOverScreen())
                }
            } else {
                strikes += 1;
                displayXXX_YourWrong();

            }
        }
        function displayXXX_YourWrong(answerValue) {
            //deliver X image.
            if (highScoreGameType == true) {
                var redXXX = new createjs.Bitmap(queue.getResult("RedXXX"));
                redXXX.x = 150
                redXXX.y = 10
                redXXX.scaleX = 0.3;
                redXXX.scaleY = 0.3;

                stage.addChild(redXXX);
                createjs.Sound.play("Buzzer");

                setTimeout(function () {
                    stage.removeChild(redXXX)
                    if (strikes >= 3) {
                        showPage(GameOverScreen());
                    } else {
                        // incrementQuestion();
                        if (questionIndex <= questionsArray.length) {
                            //got the question wrong display correct answer and message and continue button.
                            highLightTheCorrectAnswer(answerValue);
                            showPage(createGamePage());
                        } else {
                            showPage(GameOverScreen())
                        }
                    }
                }, 1500);
            } else {
                highLightTheCorrectAnswer(answerValue);
                createjs.Sound.play("NiceWrong");
            }
        }
        function highLightTheCorrectAnswer(answerValue) {
            allTheDivisions.forEach(function (element) {
                if (element.value == questionsArray[questionIndex].value) {
                    console.log(element.value);
                    createjs.Tween.get(element.backgroundOfDivision).to({ alpha: 1.0 }, 500);
                }
            });
            ShowContinueButton()
            incrementQuestion();
        }
        function ShowContinueButton() {
            var feedbackContainer = new createjs.Container();
            var directionsPanel = DirectionsPanel();
            directionsPanel.x = 180;
            directionsPanel.y = 20;
            feedbackContainer.addChild(directionsPanel);


            var spriteSheet = createSpriteSheet();
            var closeBtn = new createjs.Sprite(spriteSheet, "original");
            closeBtn.x = 150;
            closeBtn.y = 460
            feedbackContainer.addChild(closeBtn);

            var DirectionsPanelText = new createjs.Text("Close", "18px Arial bold", "yellow");
            levelsText.x = levelsbtn.x + 100;
            levelsText.y = levelsbtn.y + 25;
            levelsText.textAlign = "center";
            btnContainer.addChild(levelsText);
            page.addChild(btnContainer);
            stage.addChild(feedbackContainer);

            feedbackContainer.addEventListener("click", function () {
                stage.removeChild(feedbackContainer);
            });
        }
        function incrementQuestion() {
            questionIndex += 1;
        }

        function givePoints() {
            if (score > 0 && score < 100) {
                level = 1;
                timer = 10;
            } else if (score > 100 && score < 200) {
                level = 2;
                timer = 9.5;
            } else if (score > 200 && score < 400) {
                level = 3;
                timer = 9;
            } else if (score > 400 && score < 600) {
                level = 4;
                timer = 8.5;
            } else if (score > 600 && score < 900) {
                level = 5;
                timer = 8.0;
            } else if (score > 900 && score < 1500) {
                level = 6;
                timer = 7.5;
            } else if (score > 1500 && score < 3000) {
                level = 7;
                timer = 7.0;
            } else if (score > 3000 && score < 4500) {
                level = 8;
                timer = 6.5;
            } else if (score > 4500 && score < 6000) {
                level = 9;
                timer = 6.0;
            } else if (score > 6000 && score < 9000) {
                level = 10;
                timer = 5.5;
            } else if (score > 9001) {
                level = 10;
                timer = 5.0;
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
        var clickedAnswerNowWait = false;
        var allTheDivisions = [];
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
                divisionContainer.unit = "in";
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
                    if (clickedAnswerNowWait == false) {
                        btnClick();
                        clickedAnswerNowWait = true;
                        CheckAnswer(e.currentTarget.value.toString())
                    }
                });

                divisionContainer.addChild(division);
                ruler.addChild(divisionContainer);
                allTheDivisions.push(divisionContainer);
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
                divisionContainer.unit = "mm";
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
                    if (clickedAnswerNowWait == false) {
                        // alert("Clicked Value: " + e.currentTarget.value.toString());
                        clickedAnswerNowWait = true;
                        CheckAnswer(e.currentTarget);
                        // CheckAnswer(e.currentTarget.value.toString());
                    }
                });
                ruler.addChild(divisionContainer);
                mmLengthInches += mmInches;
                allTheDivisions.push(divisionContainer);
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

        function createSpriteSheet() {
            var data = {
                images: [queue.getResult("ButtonSprite")],
                frames: { width: 200, height: 90, count: 2 },
                animations: {
                    original: 0,
                    selected: 1
                }
            };

            var spriteSheet = new createjs.SpriteSheet(data);
            return spriteSheet;
        }

        function createAllButtons() {
            var buttonContainer = new createjs.Container();

            var ButtonX = 500;
            var ButtonY = 100;

            var data = {
                images: [queue.getResult("ButtonSprite")],
                frames: { width: 200, height: 90, count: 2 },
                animations: {
                    original: 0,
                    selected: 1
                }
            };

            var spriteSheet = new createjs.SpriteSheet(data);

            var selectQuarters = new createjs.Sprite(spriteSheet, "original");
            selectQuarters.x = ButtonX;
            selectQuarters.y = ButtonY;
            buttonContainer.addChild(selectQuarters);
            var selectQuartersText = new createjs.Text("Quarters", "22px Arial bold", "yellow");
            selectQuartersText.x = ButtonX + 50;
            selectQuartersText.y = selectQuarters.y + 20;

            buttonContainer.addChild(selectQuartersText);

            var selectEights = new createjs.Sprite(spriteSheet, "original");
            selectEights.x = ButtonX;
            selectEights.y = ButtonY + 70;
            buttonContainer.addChild(selectEights);
            var selectEightsText = new createjs.Text("Eighths", "22px Arial bold", "yellow");
            selectEightsText.x = ButtonX + 65;
            selectEightsText.y = selectEights.y + 20;
            buttonContainer.addChild(selectEightsText);


            var selectSixteenths = new createjs.Sprite(spriteSheet, "original");
            selectSixteenths.x = ButtonX;
            selectSixteenths.y = ButtonY + 140;
            buttonContainer.addChild(selectSixteenths);
            var selectSixteenthsText = new createjs.Text("Sixteenths", "22px Arial bold", "yellow");
            selectSixteenthsText.x = ButtonX + 50;
            selectSixteenthsText.y = selectSixteenths.y + 20;
            buttonContainer.addChild(selectSixteenthsText);

            var selectThirtySeconds = new createjs.Sprite(spriteSheet, "original");
            selectThirtySeconds.x = ButtonX;
            selectThirtySeconds.y = ButtonY + 210;
            buttonContainer.addChild(selectThirtySeconds);
            var selectThirtySecondsText = new createjs.Text("Thirty Seconds", "22px Arial bold", "yellow");
            selectThirtySecondsText.x = ButtonX + 20;
            selectThirtySecondsText.y = selectThirtySeconds.y + 20;
            buttonContainer.addChild(selectThirtySecondsText);

            var selectMillemeters = new createjs.Sprite(spriteSheet, "original");
            selectMillemeters.x = ButtonX;
            selectMillemeters.y = ButtonY + 280;
            buttonContainer.addChild(selectMillemeters);
            var milleMetersText = new createjs.Text("mm/cm", "22px Arial bold", "yellow");
            milleMetersText.x = ButtonX + 40;
            milleMetersText.y = selectMillemeters.y + 20;
            buttonContainer.addChild(milleMetersText);

            var highScore = new createjs.Sprite(spriteSheet, "original");
            highScore.x = ButtonX;
            highScore.y = ButtonY + 350;
            buttonContainer.addChild(highScore);
            var highScoreText = new createjs.Text("High Score", "22px Arial bold", "yellow");
            highScoreText.x = ButtonX + 40;
            highScoreText.y = highScore.y + 20;
            buttonContainer.addChild(highScoreText);

            var playbtn = new createjs.Sprite(spriteSheet, "original");
            playbtn.x = ButtonX + 100;
            playbtn.y = ButtonY + 420;
            buttonContainer.addChild(playbtn);
            var playbtnText = new createjs.Text("Start", "22px Arial bold", "yellow");
            playbtnText.x = playbtn.x + 80;
            playbtnText.y = playbtn.y + 30;
            buttonContainer.addChild(playbtnText);

            selectQuarters.addEventListener("click", function () {
                if (selectQuarters.currentFrame == 0) {

                    quartersSelected = true;
                    selectQuarters.gotoAndStop("selected")
                } else {

                    selectQuarters.gotoAndStop("original")
                    quartersSelected = false;
                }
                btnClick();
            });

            selectEights.addEventListener("click", function () {
                if (selectEights.currentFrame == 0) {
                    eightsSelected = true;
                    selectEights.gotoAndStop("selected")
                } else {
                    selectEights.gotoAndStop("original")
                    eightsSelected = false;
                }
                btnClick();
            });
            selectSixteenths.addEventListener("click", function () {
                if (selectSixteenths.currentFrame == 0) {
                    sixteenthsSelected = true;
                    selectSixteenths.gotoAndStop("selected")
                } else {
                    selectSixteenths.gotoAndStop("original")
                    sixteenthsSelected = false;
                }
                btnClick();
            });
            selectThirtySeconds.addEventListener("click", function () {
                if (selectThirtySeconds.currentFrame == 0) {
                    thirtySecondsSelected = true;
                    selectThirtySeconds.gotoAndStop("selected")
                } else {
                    selectThirtySeconds.gotoAndStop("original")
                    thirtySecondsSelected = false;
                }
                btnClick();
            });
            selectMillemeters.addEventListener("click", function () {
                if (selectMillemeters.currentFrame == 0) {
                    millemetersSelected = true;
                    selectMillemeters.gotoAndStop("selected")
                } else {
                    selectMillemeters.gotoAndStop("original")
                    millemetersSelected = false;
                }
                btnClick();
            });
            highScore.addEventListener("click", function () {

                if (highScore.currentFrame == 0) {
                    highScoreGameType = true;
                    highScore.gotoAndStop("selected")
                } else {
                    highScore.gotoAndStop("original")
                    highScoreGameType = false;
                }
                btnClick();
            });
            playbtn.addEventListener("click", function () {
                btnClick();
                questionIndex = 0;

                strikes = 0;
                level = 1;
                timer = 10;
                score = 0;

                if (quartersSelected == true || eightsSelected == true || sixteenthsSelected == true || thirtySecondsSelected == true || millemetersSelected == true) {
                    showPage(createGamePage());
                } else {
                    quartersSelected = true;
                    eightsSelected = true;
                    sixteenthsSelected = true;
                    thirtySecondsSelected = true;
                    millemetersSelected = true;
                    highScoreGameType = true;
                    showPage(createGamePage());
                }

            });
            return buttonContainer;
        }
        function resetSelections() {
            quartersSelected = false;
            eightsSelected = false;
            sixteenthsSelected = false;
            thirtySecondsSelected = false;
            millemetersSelected = false;
            highScoreGameType = false;
        }
        function GameOverScreen() {
            resetSelections()

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
            var directionsPanelText = new createjs.Text("Way to go! \n\nYour Score was: " + score + "\n\nTry again or Share you score \nand challange a friend.", "15px Arial bold", "White");
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 80;

            page.addChild(directionsPanelText);

            var FbShareButton = new createjs.Bitmap(queue.getResult("facebookShare"));
            FbShareButton.scaleX = .51;
            FbShareButton.scaleY = .51;
            //FbShareButton.width = 209;
            //FbShareButton.height = 209;
            FbShareButton.x = 200;
            FbShareButton.y = 400;
            page.addChild(FbShareButton);


            FbShareButton.addEventListener("click", function () {
                btnClick();
                FB.ui(
                    {
                        method: 'share',
                        href: 'https://www.wisc-online.com/learn/technical/core-skills/ccs13617/measurement-madness',
                        quote: 'I got a score of ' + score + ' on Measurement Madness. Can you beat my high score?'
                    }, function (response) { }
                );
            });

            var tweetscore = new createjs.Bitmap(queue.getResult("tweetscore"));
            tweetscore.scaleX = .51;
            tweetscore.scaleY = .51;
            //tweetscore.width = 209;
            //tweetscore.height = 209;
            tweetscore.x = 50;
            tweetscore.y = 400;
            page.addChild(tweetscore);

            tweetscore.addEventListener("click", function () {
                btnClick();
                //href: 'https://twitter.com/intent/tweet'
                // window.open("https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fdev.twitter.com%2Fweb%2Foverview&amp;ref_src=twsrc%5Etfw&amp;related=twitterapi%2Ctwitter&amp;text=Twitter%20for%20Websites%20%E2%80%94%20Twitter%20Developers&amp;tw_p=tweetbutton&amp;url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Foverview&amp;via=twitterdev");
                window.open("https://twitter.com/intent/tweet?text=Can you beat my high score of " + score + " in Measurement Madness. https://www.wisc-online.com/learn/technical/core-skills/ccs13617/measurement-madness");

            });



            var buttonContainer = createAllButtons();

            page.addChild(buttonContainer);

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



