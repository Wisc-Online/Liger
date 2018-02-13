﻿/// <reference path="createjs.min.js" />
"use strict";

var Game = Game || (function (createjs) {

    function Game(canvas, gameData) {
        // this is our constructor to the game
        var self = this;
        //  self.Webview.mediaPlaybackRequiresUserAction = NO;

        var stage = new createjs.Stage(canvas);
        stage.enableMouseOver(10);

        createjs.Ticker.on("tick", stage);
        var currentPage = null;

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
            };
        } else {
            quit = function () {
                window.location = "http://www.wisc-online.com";
            };
        }

        var assetsPath = gameData.assetsPath || "";
        var audioPath = gameData.assetsPath || "";
        var audioExtension = ".mp3";

        assetsPath += "images/";
        audioPath += "Audio/";

        var assets = [{ id: "RedXXX", src: assetsPath + "X.png" }, { id: "Buzzer", src: audioPath + "WrongBuzzer" + audioExtension }, { id: "NiceWrong", src: audioPath + "nicewrong" + audioExtension }, { id: "Correct", src: audioPath + "Correct" + audioExtension }, { id: "btnClick", src: audioPath + "btnClick" + audioExtension }, { id: "backgroundImage", src: assetsPath + "background.jpg" }, { id: "button", src: assetsPath + "button.png" }, { id: "selectedButton", src: assetsPath + "SelectedButton.png" }, { id: "Fired", src: assetsPath + "Fired.png" }, { id: "buttonGreen", src: assetsPath + "buttonGreen.png" }, { id: "selectedButtonGreen", src: assetsPath + "SelectedButton_green.png" }, { id: "ButtonSpriteGreen", src: assetsPath + "spritesheetGreen.png" }, { id: "dirPanel", src: assetsPath + "PanelBG.png" }, { id: "smallpanel", src: assetsPath + "panelBG_400x300.png" }, { id: "ButtonSprite", src: assetsPath + "spritesheetnomargin.png" }, { id: "LevelsTextImage", src: assetsPath + "levelstext.png" }, { id: "facebookShare", src: assetsPath + "FBShareIconSmall.png" }, { id: "tweetscore", src: assetsPath + "Twitter.png" }, { id: "TitleImage", src: assetsPath + "measurementMadnessTitle.png" }];

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
        var gameover = false;

        var incorrectCount = 0;
        var correctCount = 0;
        var questionsCount = 0;

        var level = 1;
        var timer = 10;

        var quartersSelected = false;
        var eightsSelected = false;
        var sixteenthsSelected = false;
        var thirtySecondsSelected = false;
        var millemetersSelected = false;
        var highScoreGameType = false;

        var questions32 = [];
        var questions16 = [];
        var questions8 = [];
        var questions4 = [];
        var questionsMM = [];
        var selectedQuestionsArray = [];

        questionsArray = gameData.questions;

        sortQuestionTypes(questionsArray);
        function sortQuestionTypes(array) {
            var currentIndex = array.length,
                temporaryValue,
                randomIndex;
            while (0 !== currentIndex) {
                currentIndex -= 1;
                temporaryValue = array[currentIndex];

                if (array[currentIndex].type == "32") {
                    questions32.push(temporaryValue);
                } else if (array[currentIndex].type == "16") {
                    questions16.push(temporaryValue);
                } else if (array[currentIndex].type == "8") {
                    questions8.push(temporaryValue);
                } else if (array[currentIndex].type == "4") {
                    questions4.push(temporaryValue);
                } else if (array[currentIndex].type == "mm") {
                    questionsMM.push(temporaryValue);
                }
            }
        }

        selectRandomQuestions(questions4, questions8, questions16, questions32, questionsMM);

        function selectRandomQuestions(quarters, eights, sixteenths, thirtyseconds, millemeters) {
            quarters = shuffle(quarters);
            eights = shuffle(eights);
            sixteenths = shuffle(sixteenths);
            thirtyseconds = shuffle(thirtyseconds);
            millemeters = shuffle(millemeters);
            var count = 1;
            for (var i = 0; i < 4; ++i) {
                selectedQuestionsArray.push(quarters[i]);
            }

            for (var i = 0; i < 8; ++i) {
                selectedQuestionsArray.push(eights[i]);
            }
            for (var i = 0; i < 16; ++i) {
                selectedQuestionsArray.push(sixteenths[i]);
            }
            for (var i = 0; i < 40; ++i) {
                selectedQuestionsArray.push(thirtyseconds[i]);
            }
            for (var i = 0; i < 32; ++i) {
                selectedQuestionsArray.push(millemeters[i]);
            }
            selectedQuestionsArray = shuffle(selectedQuestionsArray);
            questionsArray = selectedQuestionsArray;
        }

        //shuffle(questionsArray);
        function shuffle(array) {
            var currentIndex = array.length,
                temporaryValue,
                randomIndex;

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
        };

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
            titleImage.x = 13;
            titleImage.y = 5;

            stage.addChild(titleImage);
        }
        function DirectionsPanel(size) {
            var directionsPanel;
            if (size == "large") {
                directionsPanel = new createjs.Bitmap(queue.getResult("dirPanel"));
                directionsPanel.scaleX = .22;
                directionsPanel.scaleY = .25;
            } else {
                directionsPanel = new createjs.Bitmap(queue.getResult("smallpanel"));
                directionsPanel.scaleX = .95;
                directionsPanel.scaleY = .80;
            }
            return directionsPanel;
        }
        function createLevelsDisplay() {

            var levelsDisplayPanel = new createjs.Container();

            var directionsPanel = DirectionsPanel("large");
            directionsPanel.x = -30;
            directionsPanel.y = 60;
            levelsDisplayPanel.addChild(directionsPanel);

            var levelsTextImagedisplay = new createjs.Bitmap(queue.getResult("LevelsTextImage"));
            levelsTextImagedisplay.scaleX = levelsTextImagedisplay.scaleY = .20;
            //levelsTextImagedisplay.scaleY = .25;
            levelsTextImagedisplay.x = -5;
            levelsTextImagedisplay.y = 80;
            levelsDisplayPanel.addChild(levelsTextImagedisplay);

            var spriteSheet = createSpriteSheet();

            var closeBtn = new createjs.Sprite(spriteSheet, "original");
            closeBtn.x = 150;
            closeBtn.y = 460;
            levelsDisplayPanel.addChild(closeBtn);

            var closeText = new createjs.Text("Close", "18px Arial bold", "yellow");
            closeText.x = closeBtn.x + 100;
            closeText.y = closeBtn.y + 35;
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

            var directionsPanel = DirectionsPanel("large");
            directionsPanel.x = -30;
            directionsPanel.y = 60;

            page.addChild(directionsPanel);
            var topText = new createjs.Text("Welcome to Measurement Madness.", "18px Arial bold", "white");
            // var directionsPanelText = new createjs.Text("\n\nThis game tests how quickly you can find measurements on a ruler. \n\nBegin by selecting your unit(s).Then, get ready to race through the questions. \n\nSelecting the High Score button keeps your score and your time.The amount of time per round decreases every round.So keep your wits about you and don’t let time run out! \n\nChallenge your friends, family, and classmates on Twitter and Facebook to beat your score. \n\nSelect your units to begin.", "15px Arial bold", "White");

            var directionsPanelText = new createjs.Text("\n\nThis is a graded assessment. To pass this assessment you will need to have fewer then 4 incorrect. There are 100 questions ahead. 4 quarters, 8 eights, 16 sixteenths, 40 thirtyseconds, and 32 mm and cm questions. If you don't succeed you can try again. ", "24px Arial bold", "White");
            topText.x = directionsPanel.x + 80;
            topText.y = directionsPanel.y + 80;
            topText.lineWidth = 300;
            page.addChild(topText);
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 100;
            directionsPanelText.lineWidth = 300;

            page.addChild(directionsPanelText);

            //var btnContainer = new createjs.Container();
            //var spriteSheet = createSpriteSheet();
            //var levelsbtn = new createjs.Sprite(spriteSheet, "original");
            //levelsbtn.x = 150;
            //levelsbtn.y = 460
            //btnContainer.addChild(levelsbtn);
            //var levelsText = new createjs.Text("Level \nInformation", "18px Arial bold", "yellow");
            //levelsText.x = levelsbtn.x + 105;
            //levelsText.y = levelsbtn.y + 25;
            //levelsText.textAlign = "center";
            //btnContainer.addChild(levelsText);
            //page.addChild(btnContainer);

            //levelsbtn.addEventListener("click", function () {
            //    //Display Level
            //    btnClick();
            //    createLevelsDisplay()
            //});

            var buttonContainer = createAllButtons();
            page.addChild(buttonContainer);

            return page;
        }
        var timerTween;
        function createGamePage() {
            if (questionsCount == 0) {
                //do something
                showPage(GameOverScreen());
            }
            clickedAnswerNowWait = false;

            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);

            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 13;
            titleImage.y = 5;

            page.addChild(titleImage);

            var nubmerOfQuestions = new createjs.Text("Question Count: " + questionsCount, "18px Arial", "White");
            nubmerOfQuestions.x = 10;
            nubmerOfQuestions.y = 75;
            page.addChild(nubmerOfQuestions);

            var wrongDisplay = new createjs.Text("Incorrect: " + incorrectCount, "18px Arial", "White");
            wrongDisplay.x = 10;
            wrongDisplay.y = 105;
            page.addChild(wrongDisplay);

            var correctDisplay = new createjs.Text("Correct: " + correctCount, "18px Arial", "White");
            correctDisplay.x = 10;
            correctDisplay.y = 135;
            page.addChild(correctDisplay);

            if (highScoreGameType == true) {
                var timerDisplay = displayTimerText();
                page.addChild(timerDisplay);
            }

            var questionDisplay = displayQuestionText();
            if (questionDisplay != null) {
                page.addChild(questionDisplay);
            }
            var end = 0;
            var start = 0;
            var rulerLength = 4.25;
            start = GetStartlength(); //number of 32s returns

            end = start + 4 * 32;
            if (end > 6 * 32) {
                end = 6;
                start = 2;
            } else {
                start = start / 32;
            }

            var ruler = createRuler(rulerLength, start);

            var rulerWidthPixels = rulerLength * settings.ruler.pixelsPerDivision * settings.ruler.divisionsPerInch;

            var targetRulerWidthOfCanvasPercent = 1.0;

            ruler.x = 0;
            ruler.y = 0;

            if (questionIndex >= 1) {
                ruler.x = 0;
                ruler.y = 100;
            } else {
                createjs.Tween.get(ruler).to({ x: 0, y: 100 }, 3000);
            }

            ruler.scaleX = targetRulerWidthOfCanvasPercent * (stage.canvas.width / rulerWidthPixels);

            page.addChild(ruler);

            if (highScoreGameType == true) {

                //Create a shape
                var bar = new createjs.Shape().set({ x: 70, y: 160 }); // Move away from the top left.
                page.addChild(bar);

                // Draw the outline
                bar.graphics.setStrokeStyle(2).beginStroke("Green").drawRect(-1, -1, 302, 22).endStroke();

                // Draw the fill. Only set the style here
                var fill = new createjs.Shape().set({ x: 70, y: 160, scaleX: 0 });
                fill.graphics.beginFill("orange").drawRect(0, 0, 300, 20);
                page.addChild(fill);
            }

            if (questionIndex > 0) {
                if (highScoreGameType == true) {

                    //  timerTween.setPosition(0, 0);
                    timerTween = createjs.Tween.get(fill, { override: true }).to({ scaleX: 1 }, timer * 1000, createjs.Ease.quadIn).wait(.01).call(function () {
                        clickedAnswerNowWait = true;
                        strikes += 1;
                        timerTween.paused = true;
                        timerTween.setPaused(true);
                        displayXXX_YourWrong();
                    });
                }
            } else {
                if (highScoreGameType == true) {

                    timerTween = createjs.Tween.get(fill, { override: true }).wait(3000).to({ scaleX: 1 }, timer * 1000, createjs.Ease.quadIn).wait(.01).call(function () {
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
                timerTween.setPaused(true);
                return page;
            } else {
                return page;
            }
        }

        function GetStartlength() {
            var Question32Value = 32 * questionsArray[questionIndex].value;

            var start,
                end = 0;
            var measuremment = questionsArray[questionIndex].value;
            var questionType = questionsArray[questionIndex].unit;

            if (questionType == "mm") {
                var cmPerInch = 2.54;
                var mmPerInch = cmPerInch * 10;
                //Convert this to the nearest 32 measurement's floor value'
                //make this value the measurement variable
                measuremment = Math.round(measuremment / 25.4);
            }
            start = 6 * 32 * Math.random();
            start = Math.round(start);

            var m32s = measuremment * 32;

            if (m32s <= 65) {
                start = 0;
            }

            if (start > m32s) {
                start = m32s - 9;
            }

            var numberof32s = start + 4 * 32;

            if (numberof32s < m32s) {
                //Our start and 4 inches is less then our measurement so
                //we need to set our start to something else
                start = m32s - 4 * 32;
            }

            return start;
        }

        function GetTotalQuestionCount() {

            //var validSelection;
            //for (var i = 0; questionsArray.length > i; i++) {
            //    validSelection = false;
            //    // console.log(questionsArray[i].text)
            //    if (((questionsArray[i].value * 4) % 1 === 0) && questionsArray[i].unit != "mm") {
            //        if (quartersSelected == true) {
            //            validSelection = true;
            //            //console.log("..................Quarters True")
            //        }
            //    }
            //    if ((questionsArray[i].value * 4) % 1 === 0 || (questionsArray[i].value * 8) % 1 === 0) {
            //        if (eightsSelected == true && questionsArray[i].unit != "mm") {
            //            validSelection = true;
            //            // console.log(".................Eighths True")
            //        }
            //    }
            //    if (((questionsArray[i].value * 16) % 1 === 0 || (questionsArray[i].value * 4) % 1 === 0 || (questionsArray[i].value * 8) % 1 === 0)) {

            //        if (sixteenthsSelected == true && questionsArray[i].unit != "mm") {
            //            validSelection = true;
            //            // console.log(".................Sixteenths True")
            //        }
            //    }
            //    if ((questionsArray[i].value * 16) % 1 === 0 || (questionsArray[i].value * 4) % 1 === 0 || (questionsArray[i].value * 8) % 1 === 0 || (questionsArray[i].value * 32) % 1 === 0) {
            //        if (thirtySecondsSelected == true && questionsArray[i].unit != "mm") {
            //            validSelection = true;
            //            /// console.log(".................ThirtySeconds True")
            //        }
            //    }
            //    if (questionsArray[i].unit == "mm") {
            //        // console.log("..................unity == mm")
            //        if (millemetersSelected == true) {
            //            validSelection = true;
            //            // console.log("..................MM True")
            //        }
            //    }
            //    if (validSelection == true) {
            //        questionsCount++
            //    }
            //}
            return questionsCount = 100;
        }
        var whatKindOfQuestionIsThis = new Array();
        var iGotAValidQuestion = false;
        function displayQuestionText() {

            var questionDisplay = new createjs.Text(questionsArray[questionIndex].text, "26px Arial bold", "Yellow");
            questionDisplay.x = 10;
            questionDisplay.y = 250;
            questionDisplay.value = questionsArray[questionIndex].value;

            return questionDisplay;
        }
        var scoreTextDisplay;
        function displayScoreText() {

            scoreTextDisplay = new createjs.Text("Score: " + score, "18px Arial", "White");
            scoreTextDisplay.x = 10;
            scoreTextDisplay.y = 70;
            //page.addChild(scoreTextDisplay);
            return scoreTextDisplay;
        }
        var timerDisplay;
        function displayTimerText() {
            timerDisplay = new createjs.Text("Timer: ", "18px Arial", "White");
            timerDisplay.x = 10;
            timerDisplay.y = 160;
            return timerDisplay;
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

                // if (questionsCount >= 1) {
                if (questionIndex >= 1) {
                    clickedAnswerNowWait = false;
                    showPage(createGamePage());
                } else {
                    showPage(GameOverScreen());
                }
            } else {
                strikes += 1;
                displayXXX_YourWrong();
            }
        }
        function displayXXX_YourWrong(answerValue) {
            //deliver X image.
            incorrectCount += 1;

            if (strikes < 4) {
                var redXXX = new createjs.Bitmap(queue.getResult("RedXXX"));
                redXXX.x = 200;
                redXXX.y = 30;
                redXXX.scaleX = 0.15;
                redXXX.scaleY = 0.15;
                stage.addChild(redXXX);
            } else {
                var FiredImage = new createjs.Bitmap(queue.getResult("Fired"));
                FiredImage.x = 120;
                FiredImage.y = 300;
                FiredImage.rotation = -35;
                //  FiredImage.scaleX = 0.3;
                // FiredImage.scaleY = 0.3;
                stage.addChild(FiredImage);
            }

            createjs.Sound.play("Buzzer");

            setTimeout(function () {
                stage.removeChild(redXXX);
                if (strikes >= 4) {
                    highLightTheCorrectAnswer(answerValue, strikes);
                    setTimeout(function () {
                        stage.removeChild(FiredImage);
                        gameover = true;
                        showPage(GameOverScreen());
                    }, 3000);
                } else {
                    if (questionIndex <= questionsArray.length) {
                        //got the question wrong display correct answer and message and continue button.
                        highLightTheCorrectAnswer(answerValue, strikes);
                    } else {

                        showPage(GameOverScreen());
                    }
                }
            }, 1500);
            //highLightTheCorrectAnswer(answerValue, strikes);
            //createjs.Sound.play("NiceWrong");
        }

        function highLightTheCorrectAnswer(answerValue, strikes) {
            allTheDivisions.forEach(function (element) {
                if (element.value == questionsArray[questionIndex].value) {
                    // console.log(element.value);
                    createjs.Tween.get(element.backgroundOfDivision).to({ alpha: 1.0 }, 500);
                }
            });
            ShowContinueButton(strikes);
            incrementQuestion();
        }

        function ShowContinueButton(strikes) {
            var feedbackContainer = new createjs.Container();
            var directionsPanel = DirectionsPanel();
            directionsPanel.x = 190;
            directionsPanel.y = 50;
            feedbackContainer.addChild(directionsPanel);
            if (strikes > 3) {
                // var DirectionsPanelText = new createjs.Text("Sorry thats incorrect. The correct answer is highlighted for you. \n\nYou recieved your fourth strike your fired.", "18px Arial bold", "yellow");
                //var DirectionsPanelText = new createjs.Text("", "18px Arial bold", "yellow");
                //DirectionsPanelText.x = directionsPanel.x + 35;
                //DirectionsPanelText.y = directionsPanel.y + 30;
                //// DirectionsPanelText.textAlign = "center";
                //DirectionsPanelText.lineWidth = 320;
                //feedbackContainer.addChild(DirectionsPanelText);

            } else {
                    var DirectionsPanelText = new createjs.Text("Sorry thats incorrect. The correct answer is highlighted for you. \n\nSelect close to read the next measurement.", "18px Arial bold", "yellow");
                    DirectionsPanelText.x = directionsPanel.x + 35;
                    DirectionsPanelText.y = directionsPanel.y + 30;
                    // DirectionsPanelText.textAlign = "center";
                    DirectionsPanelText.lineWidth = 320;
                    feedbackContainer.addChild(DirectionsPanelText);
                    stage.addChild(feedbackContainer);
                }

            if (strikes < 4) {
                var spriteSheet = createSpriteSheet();
                var closeBtn = new createjs.Sprite(spriteSheet, "original");
                closeBtn.x = directionsPanel.x + 85;
                closeBtn.y = directionsPanel.y + 130;
                feedbackContainer.addChild(closeBtn);

                var closebtnText = new createjs.Text("Close", "24px Arial bold", "yellow");
                closebtnText.x = closeBtn.x + 100;
                closebtnText.y = closeBtn.y + 30;
                closebtnText.textAlign = "center";
                feedbackContainer.addChild(closebtnText);
            }

            feedbackContainer.addEventListener("click", function () {
                stage.removeChild(feedbackContainer);
                // if (questionsCount >= 1) {
                if (questionIndex >= 1) {
                    showPage(createGamePage());
                } else {
                    showPage(GameOverScreen());
                }
            });
        }
        function incrementQuestion() {
            questionIndex += 1;
            questionsCount--;
        }

        function givePoints() {
            correctCount += 1;
            if (score > 0 && score < 100) {
                level = 1;
                timer = 14;
            } else if (score > 100 && score < 200) {
                level = 2;
                timer = 13;
            } else if (score > 200 && score < 400) {
                level = 3;
                timer = 12;
            } else if (score > 400 && score < 600) {
                level = 4;
                timer = 11;
            } else if (score > 600 && score < 800) {
                level = 5;
                timer = 10;
            } else if (score > 800 && score < 1000) {
                level = 6;
                timer = 9;
            } else if (score > 1000 && score < 2000) {
                level = 7;
                timer = 8;
            } else if (score > 2000 && score < 4000) {
                level = 8;
                timer = 7;
            } else if (score > 4000) {
                level = 9;
                timer = 6;
            }

            switch (level) {
                case 1:
                    score += 20;
                    break;
                case 2:
                    score += 30;
                    break;
                case 3:
                    score += 40;
                    break;
                case 4:
                    score += 50;
                    break;
                case 5:
                    score += 60;
                    break;
                case 6:
                    score += 70;
                    break;
                case 7:
                    score += 80;
                    break;
                case 8:
                    score += 90;
                    break;
                case 9:
                    score += 100;
                    break;

            }
        }
        var clickedAnswerNowWait = false;
        var allTheDivisions = [];
        function createRuler(lengthInInches, start) {
            if (!start) {
                start = 0;
            }
            var ruler = new createjs.Container();

            var pixelsPerDivision = settings.ruler.pixelsPerDivision;

            var totalDivisions = settings.ruler.divisionsPerInch * lengthInInches;

            var cmPerInch = 2.54;
            var mmPerInch = cmPerInch * 10;

            var rectangle = new createjs.Shape();
            var rulerHeight = 200;
            rectangle.graphics.beginStroke("black").beginFill("white").drawRect(0, 200, totalDivisions * pixelsPerDivision, rulerHeight);

            ruler.addChild(rectangle);

            var divisionContainer;
            var backgroundOfDivision;

            var division, divisionHeight, numberText;

            var end = start + totalDivisions;

            var startDivision = start * settings.ruler.divisionsPerInch;

            //Paint Standard Ruler
            for (var i = 0; i <= totalDivisions; ++i) {

                divisionContainer = new createjs.Container();
                divisionContainer.value = i * (1 / settings.ruler.divisionsPerInch) + start;
                divisionContainer.unit = "in";
                backgroundOfDivision = new createjs.Shape();

                division = new createjs.Shape();
                division.x = i * pixelsPerDivision;
                division.graphics.setStrokeStyle(0.5).beginStroke("black");

                if ((i + startDivision) % 32 == 0) {
                    // make big line
                    divisionHeight = 70;

                    if (i + startDivision > 0) {
                        var numberText = new createjs.Text(((i + startDivision) / 32).toString(), "32px Arial", "black");

                        numberText.x = division.x;
                        numberText.y = divisionHeight + 200;
                        numberText.textAlign = "center";

                        divisionContainer.addChild(numberText);
                    }
                } else if ((i + startDivision) % 8 == 0) {
                    // make 1/4 inch line
                    divisionHeight = 60;
                } else if ((i + startDivision) % 4 == 0) {
                    // make 1/8 inch line
                    divisionHeight = 45;
                } else if ((i + startDivision) % 2 == 0) {
                    // make 1/16 inch line
                    divisionHeight = 30;
                } else {
                    // make 1/32 inch line
                    divisionHeight = 15;
                }
                backgroundOfDivision.graphics.setStrokeStyle(0.5).beginStroke("Green").beginFill("Green");
                backgroundOfDivision.alpha = 0.0;
                backgroundOfDivision.graphics.drawRect(-pixelsPerDivision / 2, 200, pixelsPerDivision, divisionHeight).endStroke();
                backgroundOfDivision.x = i * pixelsPerDivision;

                division.graphics.drawRect(-0.5, 200, 1, divisionHeight).endStroke();
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
                        CheckAnswer(e.currentTarget);
                    }
                });

                divisionContainer.addChild(division);
                ruler.addChild(divisionContainer);
                allTheDivisions.push(divisionContainer);
            }

            //set up metric ruler
            var mmPixelsPerDivision = pixelsPerDivision * settings.ruler.divisionsPerInch / mmPerInch;
            var mmLengthInches = 0;
            var mmInches = 0.0254;
            var mmStartDivision = startDivision * mmPerInch;
            var mmStart = start * mmPerInch;
            var howManyMillimeters = lengthInInches * mmPerInch;

            //Paint Metric Ruler

            var firstMmDrawn = Math.ceil(start * mmPerInch);
            var mmOffset = firstMmDrawn - start * mmPerInch;

            for (var m = 0; m <= howManyMillimeters; ++m) {
                // for (var m = 0; mmLengthInches <= lengthInInches; ++m) {
                mmDivision = new createjs.Shape();
                divisionContainer = new createjs.Container();
                divisionContainer.value = m * (10 / settings.ruler.divisionsPerCentimenter) + firstMmDrawn;
                divisionContainer.unit = "mm";
                divisionContainer.y = rulerHeight;
                divisionContainer.x = (m + mmOffset) * mmPixelsPerDivision;

                mmDivision.graphics.setStrokeStyle(0.5).beginStroke("Black");

                if ((m + firstMmDrawn) % 10 == 0) {
                    //make big line
                    divisionHeight = 45;

                    if (m > 0) {
                        var mmNumberText = new createjs.Text(((m + firstMmDrawn) / 10).toString(), "32px Arial", "black");
                        mmNumberText.textAlign = "center";
                        mmNumberText.y = -divisionHeight + 170;

                        divisionContainer.addChild(mmNumberText);
                    }
                } else {
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

                mmDivision.graphics.drawRect(-0.5, 200, 1, -divisionHeight).endStroke();

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
            correctCount = 0;
            incorrectCount = 0;
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

        function createAllButtons(isEnding) {

            var buttonContainer = new createjs.Container();

            var ButtonX = 500;
            var ButtonY = 100;

            var Greendata = {
                images: [queue.getResult("ButtonSpriteGreen")],
                frames: { width: 200, height: 90, count: 2 },
                animations: {
                    original: 1,
                    selected: 0
                }
            };
            var spriteSheetGreen = new createjs.SpriteSheet(Greendata);

            var data = {
                images: [queue.getResult("ButtonSprite")],
                frames: { width: 200, height: 90, count: 2 },
                animations: {
                    original: 0,
                    selected: 1
                }
            };
            var spriteSheet = new createjs.SpriteSheet(data);

            var playbtn = new createjs.Sprite(spriteSheetGreen, "original");
            playbtn.x = ButtonX + 100;
            playbtn.y = ButtonY + 420;
            buttonContainer.addChild(playbtn);
            if (gameover == true) {
                var playbtnText = new createjs.Text("Restart", "22px Arial bold", "yellow");
                playbtnText.x = playbtn.x + 70;
                playbtnText.y = playbtn.y + 30;
                buttonContainer.addChild(playbtnText);
            } else {
                var playbtnText = new createjs.Text("Start", "22px Arial bold", "yellow");
                playbtnText.x = playbtn.x + 80;
                playbtnText.y = playbtn.y + 30;
                buttonContainer.addChild(playbtnText);
            }

            playbtn.addEventListener("click", function () {

                GetTotalQuestionCount();

                btnClick();
                questionIndex = 0;
                strikes = 0;
                level = 1;
                timer = 10;
                score = 0;
                incorrectCount = 0;
                correctCount = 0;

                showPage(createGamePage());
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
            questionsCount = 0;
        }

        function GameOverScreen() {

            if (isLmsConnected) {
                if (incorrectCount < 4) {
                    ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
                    ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.completed);
                } else {
                    ScormHelper.cmi.successStatus(ScormHelper.successStatus.failed);
                    ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.incomplete);
                }
            }

            //submitScore(score);

            var page = new createjs.Container();

            var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
            backgroundImage.x = 0;
            backgroundImage.y = 0;
            page.addChild(backgroundImage);

            var titleImage = new createjs.Bitmap(queue.getResult("TitleImage"));
            titleImage.x = 5;
            titleImage.y = 5;

            page.addChild(titleImage);

            var directionsPanel = DirectionsPanel("large");
            directionsPanel.x = -30;
            directionsPanel.y = 60;
            page.addChild(directionsPanel);

            var directionsPanelText;
            if (incorrectCount < 4) {

                directionsPanelText = new createjs.Text("Way to go! \n\nYou ansered " + correctCount + " of 92 measurements. \n\nYou passed this assessement. Your score was added to your gradebook. ", "18px Arial bold", "White");
            } else {
                directionsPanelText = new createjs.Text("Sorry to hear you were fired. Missing measurements can cost businesses billions of dollars each year. Maybe you should try flipping burgers as a career. \n\nYou answered  \n\nCorrect: " + correctCount + " \n\nIncorrect: " + incorrectCount, "18px Arial bold", "White");
            }
            directionsPanelText.x = directionsPanel.x + 80;
            directionsPanelText.y = directionsPanel.y + 80;
            directionsPanelText.lineWidth = 300;
            page.addChild(directionsPanelText);

            // resetSelections();

            var buttonContainer = createAllButtons();

            page.addChild(buttonContainer);
            resetSelections();
            return page;
        }

        self.start = function () {
            // var introPage = createIntroductionPage();
            LoadAssets();
            //showPage(introPage);
        };
    }

    return Game;
})(createjs);

