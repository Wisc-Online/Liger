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
            self.mouseMoveOutside = true; // keep tracking the mouse even outside the canvas
            // ***********     Declare all assests and preload them. *************
            var assetsPath = self.gameData.assetsPath || "";

            assetsPath += "Assets/"

            var assets = [               
                { id: "gamescreen", src: assetsPath + "matchgameBackground8x6.png" },
                { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
                { id: "restart_button", src: assetsPath + "greenButtonOutline.png" },
                { id: "question", src: assetsPath + "question.png" },
                { id: "card", src: assetsPath + "_cardBack.png" },
                { id: "cardFace", src: assetsPath + "_cardFace.png" },                             
                { id: "clockBack", src: assetsPath + "clockBack.png" },
                { id: "clockHand", src: assetsPath + "clockHand.png" },
                { id: "intro", src: assetsPath + "mechanical-2_01.mp3" },
                { id: "buttonClick", src: assetsPath + "click.mp3" },
                { id: "gameOver", src: assetsPath + "GameOver.mp3" },
                { id: "success", src: assetsPath + "complete_success.wav" },
                { id: "matchFound", src: assetsPath + "goodTone.mp3" },
                { id: "panel", src: assetsPath + "openingInstructionsPanel.png" },
                { id: "closePanel", src: assetsPath + "matchingGameFeedbackBox.png" },
                { id: "startbutton", src: assetsPath + "roundStartButton.png" },
                { id: "levelup", src: assetsPath + "level-up.mp3" }
            ];

            
            //set up arrays of elements
            var originalOrdedList = [];
            var correctlySortedSubset = [];
            var randomTermsForUserSorting = [];
           
            
            //NEW Loop to include definitions
            for (var d = 0; d < self.gameData.Terms.length; d++) {
                self.gameData.Terms[d].OrderId = d;                

            }
            
            trim(self.gameData.Terms)
            function trim(array) {
                var arrayLength = array.length;
                var tempArray = array;
                while (arrayLength > 6) {   // was 12. had 12 terms changed to 6 terms each including a word and a definition ********
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
               
                // addBackground();
                introductionScreen();
            });
            queue.loadManifest(assets);


            function introductionScreen() {

                var instructionScreen = new createjs.Container();

                var dirlabel = new createjs.Text("Directions  \n \n You have 30 seconds to match the terms to their definitions. Good luck!", "bold 20px Arial", "#000000");
                dirlabel.textAlign = "center";
                dirlabel.lineWidth = 300;
                dirlabel.x = 275;
                dirlabel.y = 245;
                
                var dirBackgroundImage = new createjs.Bitmap(queue.getResult("panel"));
                dirBackgroundImage.x = 50;
                dirBackgroundImage.y = 225;

                var startButton = new createjs.Bitmap(queue.getResult("startbutton"));
                // wait(2000).createjs.Sound.play("intro"); //squeeky metalic intro
                startButton.regX = 93;
                startButton.regY = 95;
                startButton.x = 600;
                startButton.y = 295;
                startButton.scaleX = startButton.scaleY = 0.0;
                instructionScreen.addChild(dirBackgroundImage, startButton, dirlabel, instructionScreen);
                createjs.Tween.get(startButton, { loop: false }).to({ rotation: 360, scaleX: 1.0, scaleY: 1.0 }, 2000);

                startButton.addEventListener("click", function () {

                    createjs.Sound.play("buttonClick");
                   
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
                displaybox.y = 300;

                var label = new createjs.Text("Directions  \n \n You will have 20 seconds to match the seeds to their vegetables. Good luck!", "bold 20px Arial", "#000000");
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
            var timeRemaining;
            var score;
            var numberOfmatches;

            function StartInteraction() {
                gamescreen = new createjs.Bitmap(queue.getResult("gamescreen"));
                gamescreenContainer.addChild(gamescreen);
                self.addChild(gamescreenContainer);
                gameIsRunning = true;
                Clock();
                xoffset = -4;
                xoffset2 = -4;
                numberOfmatches = 0; //start with no matches

                function showFrontImageOfCard(cardContainer, callback) {
                    if (gameIsRunning == true) {
                        createjs.Tween.get(cardContainer.BackImage).wait(1000).to({ alpha: 0 }, 100).call(function () {
                            cardContainer.IsTurnedOver = false
                        });

                        if (gameIsRunning == true) {
                            createjs.Tween.get(cardContainer.FrontImage).wait(1000).to({ alpha: 1 }, 75).call(function () {
                                if (callback != null) {
                                    callback();
                                }
                            });
                        }
                    }}

                //CHECK for MATCH
                if (gameIsRunning == true) {
                function checkIfCardsMatch(card1, card2)
                  
                        {
                            if (card1 == null || card2 == null) {
                                return;
                            }
                            if (card1.ID == card2.ID) {
                               
                                // MATCH text
                                if (numberOfmatches != 6) {
                                    var itsaMatch = new createjs.Text("MATCH", "40px Arial Black", "lime");
                                    itsaMatch.shadow = new createjs.Shadow("gray", 1, 1, 3);
                                    itsaMatch.lineWidth = 780;
                                    itsaMatch.x = 300;
                                    itsaMatch.y = 200;

                                   

                                    //animate MATCH text
                                    createjs.Tween.get(itsaMatch)
                                    .to({ scaleX: 1.00, scaleY: 1.00, alpha: 0 }, 750)
                                    self.addChild(itsaMatch);
                                }


                                numberOfmatches++

                                if (numberOfmatches != 6) {
                                    createjs.Sound.play("matchFound");
                                }

                                // console.log("match");
                                if (numberOfmatches == 6) {
                                    allMatchsAreMade();
                                    DisplayEndingNotes(true)
                                }
                                clickedTimes = 0;
                            }
                            else {
                                if (gameIsRunning == true) {
                                    showFrontImageOfCard(card1);
                                    showFrontImageOfCard(card2, function () {
                                        clickedTimes = 0;
                                    });
                                }
                            }
                        }
                    }


                function toggleTween(tween) {
                    if (tween.paused) {
                        tween.paused = false;
                        tween.setPaused(false);
                    } else {
                        tween.paused = true;
                        tween.setPaused(true);
                    }
                }




                function allMatchsAreMade() {
                    gameIsRunning = false;

                    console.log('timeRemaining.toString()');
                    // stop timer!   
                    toggleTween(mytweentodisable);
                    
                    // find time when clock is stopped
                    clockStopTime = (new Date()).getTime();

                    // timeRemaining = total timer - elapsed
                    timeRemaining = ((TimerLength - (clockStopTime - startTime)) / 1000).toFixed(2);
  
                        var allMatches = new createjs.Text("ALL MATCHES MADE!", "40px Arial Black", "lime");
                        allMatches.shadow = new createjs.Shadow("gray", 1, 1, 3);
                        allMatches.lineWidth = 780;
                        allMatches.x = 175;
                        allMatches.y = 200;
                        allMatches.alpha = 0;

                        //animate MATCH text
                         createjs.Tween.get(allMatches)
                        .wait(1000)
                        .to({ scaleX: 1.00, scaleY: 1.00, alpha: 1 }, 1000)
                        .to({ scaleX: 1.00, scaleY: 1.00, alpha: 0 }, 1000)
                         self.addChild(allMatches);

                         createjs.Sound.play("success");
                        
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
                            createjs.Sound.play("buttonClick");
                            createjs.Tween.get(clickedCardContainer.FrontImage).to({ alpha: 0 }, 50);


                            createjs.Tween.get(clickedCardContainer.BackImage)
                                          .wait(225)
                                          .to({ alpha: 1 }, 10)
                                          .call(function () {
                                              if (previousCardClicked != null && previousCardClicked != clickedCardContainer) {
                                                  checkIfCardsMatch(previousCardClicked, clickedCardContainer)
                                                  previousCardClicked = null;
                                              }
                                          });
                        }
                    }
                }



                // Display Term and definition cards pt 1
                for (var t = 0; t < self.gameData.Terms.length ; t++) {  // loop through 6 TERMS each including a word and definition 

                    //// create term container ////////////
                    cardContainer = new createjs.Container();
                    cardContainer.ID = self.gameData.Terms[t].Id;
                                                      
                    //// add term text over cardFace image
                    var term = new createjs.Text(self.gameData.Terms[t].Name, "24pt arial bold", "black");
                    term.ID = self.gameData.Terms[t].Id;
                    term.textAlign = "center";
                    term.lineWidth = 200;
                    term.y = 45;
                    term.x = 112;
                               
                    ////////////////////////////////////////

                    frontImage = new createjs.Bitmap(queue.getResult("card"));
                    backImage = new createjs.Bitmap(queue.getResult("cardFace"));
                    frontImage.scaleX = 1.25;
                    frontImage.scaleY = 1.25;
                    backImage.scaleX = 1.25;
                    backImage.scaleY = 1.25;
                    backImage.alpha = 0;
                    

                    cardContainer.addChild(backImage, term, frontImage); // add term between backImage and frontImage                    
                    cardContainer.FrontImage = frontImage;
                    cardContainer.BackImage = backImage; //hides / reveals the term
                   
                    // start second row of cards after looping through first 3 term / definition pairs
                    if (t < self.gameData.Terms.length / 2) {
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
                    
                    cardContainer.addEventListener("click", handleCardContainerClick);

                }
         


                 // randomize second row       
                function shuffle(array) {
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

                self.gameData.Terms = shuffle(self.gameData.Terms);
                
                // Display Term and definition cards pt 2
                for (var t = 0; t < self.gameData.Terms.length; t++) {  // loops through the six terms each including a name (term) and definition 

                //// create definition container //////////// need to randomize these!
                cardContainer = new createjs.Container();
                cardContainer.ID = self.gameData.Terms[t].Id;
                 
                // add definition                                  
                var definition = new createjs.Text(self.gameData.Terms[t].Definition, "24pt arial bold", "black");
            
                definition.ID = self.gameData.Terms[t].Definition;
                definition.textAlign = "center";
                definition.lineWidth = 200;
                definition.y = 45;
                definition.x = 112;
                              
                ///////////// add card images to container//////
                frontImage = new createjs.Bitmap(queue.getResult("card"));
                backImage = new createjs.Bitmap(queue.getResult("cardFace"));
                frontImage.scaleX = 1.25;
                frontImage.scaleY = 1.25;
                backImage.scaleX = 1.25;
                backImage.scaleY = 1.25;
                backImage.alpha = 0;
                    
                // add definition between bottom backImage and frontImage  
                cardContainer.addChild(backImage, definition, frontImage);                   
                cardContainer.FrontImage = frontImage;
                cardContainer.BackImage = backImage; //reveals term
                   
                // add second row of cards after 3rd term
                if (t < 3) {
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
                    
                cardContainer.addEventListener("click", handleCardContainerClick);

            }
        }


            //// see all cards at the end of the round ///////////////////////////////
            function turnOverAllCards() {
              //  alert("test");
                for (var j = 0; j < allCardContainers.length; j++) {
                    allCardContainers[j].BackImage.alpha = 1;
                    allCardContainers[j].FrontImage.alpha = 0;
                }
                DisplayEndingNotes(false);
            }



            function DisplayEndingNotes(isCompleted) {
                var EndScreen = new createjs.Container();

                var replayContainer = new createjs.Container();
                var exploreContainer = new createjs.Container();

                var replayButton = new createjs.Bitmap(queue.getResult("restart_button"));
                var exploreMore = new createjs.Bitmap(queue.getResult("restart_button"));

                replayButton.x = 590;
                replayButton.y = 445; // was 500
                exploreMore.x = 590;
                exploreMore.y = 505;

                var exploreText = new createjs.Text("60 Second Practice Round", "bold 16px Arial", "#fff");
                exploreText.textAlign = "center";
                exploreText.lineWidth = 140;
                exploreText.y = exploreMore.y + 5;
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

                // total matches plus timeRemaining                
                if (timeRemaining != 0) {
                    score = parseInt((numberOfmatches * 100) + (Math.round(timeRemaining)));
                } else {
                    score = parseInt(numberOfmatches * 100);
                }

                closePanel.x = 190;
                closePanel.y = 450;
                if (isCompleted == true) {
                    var endingText = new createjs.Text("Congratulations! All matches made with " + timeRemaining.toString() + " Seconds remaining! SCORE: " + score.toString(), "bold 16px Arial", "#FFF");

                } else {
                   
                    // display number of matches in ending text
                    var endingText = new createjs.Text("You got " + numberOfmatches.toString() + " of the possible matches. Try a 60 second practice round or click \"Replay\" to try again. SCORE: " + score.toString(), "bold 16px Arial", "#FFF");
                 
                }

                endingText.textAlign = "center";
                endingText.lineWidth = 300;
                endingText.y = closePanel.y + 20;
                endingText.x = closePanel.x + 180;
                directionsbox.addChild(closePanel, endingText, replayContainer, exploreContainer); // replay button and more time option
                EndScreen.addChild(directionsbox);

                replayContainer.addEventListener("click", handleClick);

                function handleClick(event) {
                    createjs.Sound.play("buttonClick");
                    allCardContainers.splice(0, allCardContainers.length)
                    self.removeChild(clockContainer);
                    self.removeChild(EndScreen);
                    gamescreenContainer.removeChild(gamescreen);
                    self.removeChild(gamescreenContainer)
                    self.removeChild(cardContainer);
                    self.removeAllChildren();
                    self.start();
                }

                // explore more  / change speed button to 1 minute
                exploreContainer.addEventListener("click", handleClickexploreContainer);
                function handleClickexploreContainer(event) {
                    createjs.Sound.play("buttonClick");                    
                    allCardContainers.splice(0, allCardContainers.length)
                    self.removeChild(clockContainer);
                    self.removeChild(EndScreen);
                    gamescreenContainer.removeChild(gamescreen);
                    self.removeChild(gamescreenContainer)
                    self.removeChild(cardContainer);
                    self.removeAllChildren();
                    // 60 second practice round
                    TimerLength = 60000;

                    StartInteraction();
                    
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

                //TimerLength is a 360 rotation
                mytweentodisable = createjs.Tween.get(clockHand, { loop: false }).to({ rotation: 360 }, TimerLength).call(function () {
                    //this will trigger the timer is up
                    if (gameIsRunning == true) {
                       
                        // time is out
                        timeRemaining = 0;
                        gameIsRunning = false;
                        setTimeout(turnOverAllCards,1000); // wait for any flips to finish 
                        createjs.Sound.stop();                                                                    
                        createjs.Sound.play("gameOver");
                     
                      
                        
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
