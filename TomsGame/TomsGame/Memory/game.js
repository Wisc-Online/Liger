/// <reference path="htp://code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
(function (createjs) {

    function miniGame(gameData) {
        ////++++++++++++   Create a stage by getting a reference to the canvas   +++++++++++++++
        // Game variables

        this.Container_constructor();
        var self = this;
        self.gameData = gameData;

        self.start = function () {

            //self.stage = new createjs.Stage(canvas);
            var stageBG = new createjs.Shape();
            stageBG.name = "stageBG";
            //stageBG.graphics.setStrokeStyle(3).beginStroke("black").beginFill("silver").drawRect(0, 0, 800, 600).endStroke().endFill();
            self.addChild(stageBG);
            createjs.Touch.enable(self, false, true);
            //self.enableMouseOver(25);
            self.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas
            // ***********     Declair all assests and preload them. ************************
            var assetsPath = self.gameData.assetsPath || "";

            assetsPath += "Assets/"

            var assets = [
                { id: "BackGround", src: assetsPath + "starrySkyBackground.png" },
                { id: "gamescreen", src: assetsPath + "matchgameBackground8x6.png" },
                { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
                { id: "restart_button", src: assetsPath + "greenButtonOutline.png" },
                { id: "card", src: assetsPath + "_cardBack.png" },
                { id: "cardFace", src: assetsPath + "_cardFace.png" },
                { id: "broc", src: assetsPath + "broc.png" },
                { id: "brocSeed", src: assetsPath + "brocSeed.png" },
                { id: "carrot", src: assetsPath + "carrot.png" },
                { id: "carrotSeed", src: assetsPath + "carrotSeed.png" },
                { id: "corn", src: assetsPath + "corn.png" },
                { id: "cornSeed", src: assetsPath + "cornSeed.png" },
                { id: "let", src: assetsPath + "let.png" },
                { id: "letSeed", src: assetsPath + "letSeed.png" },
                { id: "onion", src: assetsPath + "onion.png" },
                { id: "onionSeed", src: assetsPath + "onionSeed.png" },
                { id: "pota", src: assetsPath + "pota.png" },
                { id: "potaSeed", src: assetsPath + "potaSeed.png" },
                { id: "pump", src: assetsPath + "pump.png" },
                { id: "pumpSeed", src: assetsPath + "pumpSeed.png" },
                { id: "rad", src: assetsPath + "rad.png" },
                { id: "radSeed", src: assetsPath + "radSeed.png" },
                { id: "rice", src: assetsPath + "rice.png" },
                { id: "riceSeed", src: assetsPath + "riceSeed.png" },
                { id: "stra", src: assetsPath + "stra.png" },
                { id: "straSeed", src: assetsPath + "straSeed.png" },
                { id: "tom", src: assetsPath + "tom.png" },
                { id: "tomSeed", src: assetsPath + "tomSeed.png" },
                { id: "turn", src: assetsPath + "turn.png" },
                { id: "turnSeed", src: assetsPath + "turnSeed.png" },
                { id: "Zucc", src: assetsPath + "Zucc.png" },
                { id: "ZuccSeed", src: assetsPath + "ZuccSeed.png" },
                { id: "clockBack", src: assetsPath + "clockBack.png" },
                { id: "clockHand", src: assetsPath + "clockHand.png" },
                { id: "buttonClick", src: assetsPath + "click.mp3" },
                { id: "gameOver", src: assetsPath + "GameOver.mp3" },
                { id: "panel", src: assetsPath + "openingInstructionsPanel.png" },
                { id: "closePanel", src: assetsPath + "matchingGameFeedbackBox.png" },
                { id: "startbutton", src: assetsPath + "roundStartButton.png" },
                { id: "levelup", src: assetsPath + "level-up.mp3" }
            ];








            //set up arrays of elements
            var originalOrdedList = [];
            var correctlySortedSubset = [];
            var randomTermsForUserSorting = [];

            //for (var d = 0; d < self.gameData.Terms.length; d++) {
            //    self.gameData.Terms[d].OrderId = d;
               
            //}

            //NEW Loop to include definitions
            for (var d = 0; d < self.gameData.Terms.length; d++) {
                self.gameData.Terms[d].OrderId = d;
                

            }


            trim(self.gameData.Terms)
            function trim(array) {
                var arrayLength = array.length;
                var tempArray = array;
                while (arrayLength > 12) {
                    var randomNumber = Math.floor((Math.random() * 26) + 1);

                    if (randomNumber % 2 == 0) {//generated number is even
                        // console.log(randomNumber)
                        array.splice(randomNumber, 2);
                        arrayLength = array.length;
                    }

                }

                var currentIndex = array.length, temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }


            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                // addBackground();
                introductionScreen();
            });
            queue.loadManifest(assets);


            function introductionScreen() {

                var instructionScreen = new createjs.Container();

                var dirlabel = new createjs.Text("Directions  \n \n You have 30 seconds to match the terms to their definitions. Good luck!", "bold 20px Arial", "#000000");
                dirlabel.textAlign = "center";
                dirlabel.lineWidth = 300;
                dirlabel.y = 270;
                dirlabel.x = 275;
                var dirBackgroundImage = new createjs.Bitmap(queue.getResult("panel"));
                dirBackgroundImage.x = 50;
                dirBackgroundImage.y = 250;

                var startButton = new createjs.Bitmap(queue.getResult("startbutton"));

                startButton.regX = 93;
                startButton.regY = 95;
                startButton.x = 600;
                startButton.y = 320;
                startButton.scaleX = startButton.scaleY = 0.0;
                instructionScreen.addChild(dirBackgroundImage, startButton, dirlabel, instructionScreen);
                createjs.Tween.get(startButton, { loop: false }).to({ rotation: 360, scaleX: 1.0, scaleY: 1.0 }, 2000);

                startButton.addEventListener("click", function () {

                    createjs.Sound.play("click");

                    createjs.Tween.get(startButton).to({ alpha: 0 }, 250)
                            .call(function () {
                                self.removeChild(instructionScreen);
                                StartInteraction();
                            });
                });

                self.addChild(instructionScreen);
            }

            function DisplayDirections() {
                var directionsScreen = new createjs.Container();

                var directionsbox = new createjs.Container();
                displaybox = new createjs.Shape();
                displaybox.graphics.beginFill("#ffba3e").drawRoundRect(0, 0, 380, 200, 8);
                displaybox.name = "DirectionsBox";
                displaybox.x = 225;
                displaybox.y = 380;

                var label = new createjs.Text("Directions  \n \n You have 20 seconds to match the seeds to their vegetables. Good luck!", "bold 20px Arial", "#000000");
                label.textAlign = "center";
                label.lineWidth = 370;
                label.y = displaybox.y + 5;
                label.x = displaybox.x + 190

                directionsbox.addChild(displaybox, label);
                directionsScreen.addChild(directionsbox);

                var helper = new createjs.ButtonHelper(displaybox, "out", "over", "down", false, null, "hit");
                helper.y = displaybox.y;
                helper.x = displaybox.x + 275
                displaybox.addEventListener("click", handleClick);

                function handleClick(event) {
                    self.removeChild(directionsScreen);
                    createjs.Sound.play("click");
                    StartInteraction();
                }

                self.addChild(directionsScreen);
            }

            var allCardContainers = [];
            var previousCardClicked = null;
            var gameIsRunning = false;
            var gamescreenContainer = new createjs.Container();
            var gamescreen;
            var cardContainer;
            
            var frontImage;
            var backImage;
            function StartInteraction() {
                gamescreen = new createjs.Bitmap(queue.getResult("gamescreen"));
                gamescreenContainer.addChild(gamescreen);
                self.addChild(gamescreenContainer);
                gameIsRunning = true;
                Clock();
                xoffset = 0;
                xoffset2 = 0;
                numberOfmatches = 0; //start with no matches

                function showFrontImageOfCard(cardContainer, callback) {
                    createjs.Tween.get(cardContainer.BackImage).wait(1000).to({ alpha: 0 }, 125).call(function () {
                        cardContainer.IsTurnedOver = false
                    });

                    createjs.Tween.get(cardContainer.FrontImage).wait(1200).to({ alpha: 1 }, 125).call(function () {
                        if (callback != null) {
                            callback();
                        }
                    });
                }

                //CHECK for MATCH
                function checkIfCardsMatch(card1, card2) {
                    if (card1 == null || card2 == null) {
                        return;
                    }
                    if (card1.ID == card2.ID) {
                        numberOfmatches++
                        // console.log("match");
                        if (numberOfmatches == 6) {
                            allMatchsAreMade();
                            DisplayEndingNotes(true)
                        }
                        clickedTimes = 0;
                    }
                    else {
                        showFrontImageOfCard(card1);
                        showFrontImageOfCard(card2, function () {
                            clickedTimes = 0;
                        });
                    }
                }
                function allMatchsAreMade() {
                    gameIsRunning = false;
                    // console.log("all Matches are made");

                }

                function handleCardContainerClick(evt) {
                    if (gameIsRunning == true) {
                        var clickedCardContainer = evt.currentTarget;

                        if (!clickedCardContainer.IsTurnedOver && clickedTimes < 2) {
                            clickedCardContainer.IsTurnedOver = true;

                            clickedTimes = clickedTimes + 1;
                            if (clickedTimes == 1) {
                                previousCardClicked = clickedCardContainer;
                            }

                            createjs.Tween.get(clickedCardContainer.FrontImage).to({ alpha: 0 }, 250);
                            createjs.Tween.get(clickedCardContainer.BackImage)
                                          .wait(250)
                                          .to({ alpha: 1 }, 250)
                                          .call(function () {
                                              if (previousCardClicked != null && previousCardClicked != clickedCardContainer) {
                                                  checkIfCardsMatch(previousCardClicked, clickedCardContainer)
                                                  previousCardClicked = null;
                                              }
                                          });
                        }
                    }
                }

                for (var t = 0; t < 12; t++) {
                    cardContainer = new createjs.Container();
                    cardContainer.ID = self.gameData.Terms[t].Id;
                    //  cardContainer.Image = self.gameData.Terms[t].Item;
         //           cardContainer.Definition = self.gameData.Terms[t].Definition;  // getting definition
                    cardContainer.ImageIdentifier = self.gameData.Terms[t].Name; // gets name of item from data

                    // create definitions 
                    defContainer = new createjs.Container();
                    defContainer.ID = self.gameData.Terms[t].Id;
                    //  cardContainer.Image = self.gameData.Terms[t].Item;
                    defContainer.Definition = self.gameData.Terms[t].Definition;  // getting definition
                  
                    ////////////////////////////
                    
                    
                    // add text over cardFace image
                    var term = new createjs.Text(self.gameData.Terms[t].Name, "24pt arial bold", "black");
                    term.textAlign = "center";
                    term.lineWidth = 300;
                    term.y = 50;
                    term.x = 108;

                    //   var dirBackgroundImage = new createjs.Bitmap(queue.getResult("panel"));  IF have to add cardface as background
                    //   dirBackgroundImage.x = 50;
                    //   dirBackgroundImage.y = 250;     

                    var definition = new createjs.Text(self.gameData.Terms[t].Definition, "24pt arial bold", "black");
                    term.textAlign = "center";
                    term.lineWidth = 300;
                    term.y = 50;
                    term.x = 108;
                    ///////////////////////////



                    frontImage = new createjs.Bitmap(queue.getResult("card"));
                    backImage = new createjs.Bitmap(queue.getResult("cardFace"));

                    frontImage.scaleX = 1.25;
                    frontImage.scaleY = 1.25;
                    backImage.scaleX = 1.25;
                    backImage.scaleY = 1.25;

                    backImage.alpha = 0;
                    

                    cardContainer.addChild(backImage, term, frontImage); // add term between bottom / backImage and frontImage                    
                    cardContainer.FrontImage = frontImage;
                    cardContainer.BackImage = backImage; //reveals term
                    //BackImage.addChild(term);


                    //defContainer.addChild(backImage, definition, frontImage); // add term between bottom / backImage and frontImage                    
                    //defContainer.FrontImage = frontImage;
                    //defContainer.BackImage = backImage;



                    if (t < 6) {
                        cardContainer.x = 50 + xoffset;
                        cardContainer.y = 55;
                        xoffset = xoffset + 120
                    } else {
                        cardContainer.x = 50 + xoffset2;
                        cardContainer.y = 250;

                        xoffset2 = xoffset2 + 120
                    }

                    cardContainer.scaleX = .50;
                    cardContainer.scaleY = .50;

                    cardContainer.IsTurnedOver = false;

                    allCardContainers.push(cardContainer);

                    self.addChild(cardContainer);
                    var clickedTimes = 0


                    //cardContainer.addEventListener("mouseover", function (evt) {
                    //    createjs.Tween.get(evt.currentTarget).to({ scaleX: 0.6, scaleY: 0.6 }, 125);
                    //});

                    //cardContainer.addEventListener("mouseout", function (evt) {
                    //    createjs.Tween.get(evt.currentTarget).to({ scaleX: 0.5, scaleY: 0.5 }, 125);
                    //});

                    cardContainer.addEventListener("click", handleCardContainerClick);

                }
            }
            function turnOverAllCards() {

                for (var j = 0; j < allCardContainers.length; j++) {
                    test = allCardContainers[j].BackImage.alpha = 1;
                }
                DisplayEndingNotes(false);
            }
            function DisplayEndingNotes(isCompleted) {
                var EndScreen = new createjs.Container();

                var replayContainer = new createjs.Container();
                var exploreContainer = new createjs.Container();

                var replayButton = new createjs.Bitmap(queue.getResult("restart_button"));
                var exploreMore = new createjs.Bitmap(queue.getResult("restart_button"));

                replayButton.x = 600;
                replayButton.y = 500;
                exploreMore.x = 600;
                exploreMore.y = 440;

                var exploreText = new createjs.Text("Explore More >>", "bold 16px Arial", "#fff");
                exploreText.textAlign = "center";
                exploreText.lineWidth = 140;
                exploreText.y = exploreMore.y + 15;
                exploreText.x = exploreMore.x + 85

                var replayText = new createjs.Text("Replay", "bold 16px Arial", "#fff");
                replayText.textAlign = "center";
                replayText.lineWidth = 140;
                replayText.y = replayButton.y + 15;
                replayText.x = replayButton.x + 85

                replayContainer.addChild(replayButton, replayText);
                exploreContainer.addChild(exploreMore, exploreText);

                var directionsbox = new createjs.Container();
                var closePanel = new createjs.Bitmap(queue.getResult("closePanel"));


                closePanel.x = 200;
                closePanel.y = 450;
                if (isCompleted == true) {
                    var endingText = new createjs.Text("Congratulations! You’re a matching whiz! ", "bold 16px Arial", "#FFF");

                } else {
                    var endingText = new createjs.Text("Sorry, you didn’t complete all of the matches. Click \"Replay\" to try again.", "bold 16px Arial", "#FFF");
                }
                endingText.textAlign = "center";
                endingText.lineWidth = 300;
                endingText.y = closePanel.y + 15;
                endingText.x = closePanel.x + 180

                directionsbox.addChild(closePanel, endingText, replayContainer, exploreContainer);
                EndScreen.addChild(directionsbox);

                replayContainer.addEventListener("click", handleClick);
                function handleClick(event) {
                    allCardContainers.splice(0, allCardContainers.length)
                    self.removeChild(clockContainer);
                    self.removeChild(EndScreen);
                    gamescreenContainer.removeChild(gamescreen);
                    self.removeChild(gamescreenContainer)
                    self.removeChild(cardContainer);
                    // StartInteraction();
                    self.removeAllChildren();
                    self.start();

                }
                exploreContainer.addEventListener("click", handleClickexploreContainer);
                function handleClickexploreContainer(event) {
                    if (self.onGameComplete != null) {
                        self.onGameComplete();
                    }

                    //self.removeChild(displaybox);
                    self.removeChild(endingText);
                }
                self.addChild(EndScreen);

            }


            TimerLength = 30000;
            var startTime;
            var time;
            function Clock() {

                clockContainer = new createjs.Container();
                contain = new createjs.Container();
                var clockBack = new createjs.Bitmap(queue.getResult("clockBack"));
                clockHand = new createjs.Bitmap(queue.getResult("clockHand"));
                clockBack.x = 41;//40
                clockBack.y = 440;//480
                clockHand.x = 95;//95
                clockHand.y = 495;//535
                clockHand.regX = 17//16
                clockHand.regY = 130;//130
                clockHand.scaleX = clockHand.scaleY = 0.35;
                clockBack.scaleX = clockBack.scaleY = 0.40;
                contain.addChild(clockHand);
                clockContainer.addChild(clockBack, contain);

                self.addChild(clockContainer)

                //Start Timer so we can base score off time.
                startTime = (new Date()).getTime();
                //TimerLength
                mytweentodisable = createjs.Tween.get(clockHand, { loop: false }).to({ rotation: 360 }, TimerLength).call(function () {
                    //this will trigger the timer is up
                    if (gameIsRunning == true) {
                        createjs.Sound.stop();
                        gameIsRunning = false;
                        createjs.Sound.play("gameOver");
                        turnOverAllCards();
                    }
                });
            }//clock end


            $(window).bind('beforeunload', function () {
                //for wisc to report scores
            })
        }
    }

    // THIS IS BOTTOM OF MINIGAME SCRIPT
    var p = createjs.extend(miniGame, createjs.Container);
    window.MemoryGame = createjs.promote(miniGame, "Container");
})(createjs); // END OF function miniGame(gameData)
