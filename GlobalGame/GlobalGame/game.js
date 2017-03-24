/// <reference path="C:\SoftwareDev\GIT\Liger\GlobalGame\GlobalGame\createjs.min.js" />
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
            initialize();
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

        ////////////////////////////////////////
        var gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);
        var gameCounter = 0;
        var maxWidth = 40;
        var tableCompactTimeout = null;
        var maxMoveNbr = 5;
        var movesLeft = 0;
        var currentQuestion = 0;
        var boardStartX = 100;
        var boardStartY = 100;
        var currentBestMatch = null;
        var containerAtX = 580;
        var maxI = 10;
        var maxJ = 10;


        stage.enableMouseOver(10);
        // stage.mouseMoveOutside = true;

        var fps = 60;
        var tickCount = 0;
        var currentArea = null;

        //set ticker 
        createjs.Ticker.setFPS(60);

        function handleTick() {
            stage.update();
        }

        createjs.Ticker.on("tick", handleTick);

        function initialize() {
            self.gameData = gameData;
            var gameState = {
                score: 0,
                name: gameData.UserName || "",
                color: "#008080",
                questionsMissed: 0,
                timerOn: false,
                initialize:true
            }

            var currentstate = {
                movesLeft: 0
            }

            //create game objects
            var mainBox, questionContainer, userScoreContainer, layer, rectangle, movesLeftContainer, instructionsContainer;
            var button1, button2;
            var soundContainer = createSoundContainer();
            var instructionsView = null;

            instructionsContainer = createInstructionContainer();
            // adding elements to stage
            stage.addChild(instructionsContainer);

            //checks for matches and eliminates all matches when the game loads
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


            };

            var getMainView = function () {
                if (mainBox == null) {
                    mainBox = createMainContainer();
                    fillBoard();
                    scanAndCompactTable();
                }

                return mainBox;
            }
            showView(getMainView());

            var getInstructionsView = function () {
                if (instructionsView == null) {
                    instructionsView = createInstructionsView();
                }

                return instructionsView;
            }

            self.previousView = null;
            self.currentView = null;
            showView(createTitleView());


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

            function createQuestionView() {
                //add question container
                questionContainer = createQuestionContainer();
                questionContainer.x = boardStartX;
                questionContainer.y = boardStartY;
                showQuestionContainer(gameData.Questions[0]);
                return questionContainer;
            }

            function createInstructionContainer()
            {
                var instructionsContainer = new createjs.Container();
                instructionsContainer.x = 0;
                instructionsContainer.y = 550;
                instructionsContainer.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#F00").drawCircle(0, 50, 50));
                instructionsContainer.cursor = 'pointer';

                instructionsContainer.addChild(new createjs.Bitmap(queue.getResult("instructions_background")));
                instructionsContainer.addChild(new createjs.Bitmap(queue.getResult("instructions_question")));

                

                instructionsContainer.addEventListener("click", function () {
                    showView(getInstructionsView());
                });

                return instructionsContainer;
            }


            function createSoundContainer()
            {
                var scaleX = .75;
                var scaleY = .75;

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
                sound.scaleX = scaleX;
                sound.scaleY = scaleY;
                soundContainer.addChild(sound);
                soundContainer.addEventListener("click", function (evt) {
                    if (musicOn == true) {

                        musicOn = false;
                        var sound = new createjs.Bitmap(queue.getResult("musicOff"));
                        sound.scaleX = scaleX;
                        sound.scaleY = scaleY;
                        sound.name = "musicOffImage"
                        var destroy = evt.currentTarget.getChildByName("musicOnImage");
                        evt.currentTarget.removeChild(destroy);
                        evt.currentTarget.addChild(sound);
                        createjs.Sound.setMute(true);

                    } else {
                        musicOn = true;
                        var sound = new createjs.Bitmap(queue.getResult("musicOn"));
                        sound.scaleX = scaleX;
                        sound.scaleY = scaleY;
                        sound.name = "musicOnImage"
                        var destroy = evt.currentTarget.getChildByName("musicOffImage");
                        evt.currentTarget.removeChild(destroy);
                        evt.currentTarget.addChild(sound);
                        createjs.Sound.setMute(false);

                    }
                });
                return soundContainer;
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
                    gameState.score = 0;
                    gameState.questionsMissed = 0;
                    gameState.initialize = true;
                    maxMoveNbr=5;
                    showView(createQuestionView());
                });

                startButton.on("mouseover", handleStartButtonHover);
                startButton.on("mouseout", handleStartButtonHover);

                
                return view;
            }





            function handleStartButtonHover(event) {
                if (event.type == "mouseover") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: 1.0625, scaleY: 1.0625 }, 100).to({ scaleX: 1.0, scaleY: 1.0 }, 100).to({ scaleX: 1.0625, scaleY: 1.0625 }, 200);
                }
                else {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: 1.0, scaleY: 1.0 }, 100);
                }
            }


            function createMainContainer() {

                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("aqua");
                background.graphics.drawRect(boardStartX, boardStartY, 400, 400);

                container.addChild(background);

                //add user score container
                userScoreContainer = createUserScoreContainer();
                userScoreContainer.x = containerAtX;
                userScoreContainer.y = 350;
                container.addChild(userScoreContainer);

                //
                movesLeftContainer = createMovesLeftContainer();
                movesLeftContainer.x = containerAtX;
                movesLeftContainer.y = 250;
                container.addChild(movesLeftContainer);
                

                var hintButtonContainer = createHintButton();
                hintButtonContainer.x = containerAtX;
                hintButtonContainer.y = 150;
                container.addChild(hintButtonContainer);
                return container;
            }





            function createCircle(color)
            {
                var circle = new createjs.Shape();

                var c = color;
                if(!color)
                {
                    var colors = ["pink", "blue", "red", "orange", "green", "purple"];
                    var randomNum = Math.floor((Math.random() * 6) + 0);
                    color = colors[randomNum];
                }
                circle.graphics.beginFill(color).drawCircle(maxWidth / 2, maxWidth / 2, maxWidth / 2);

                circle.name = "circle";
                circle.color = color;
                return circle;
            }


            function createCircleDraggableContainer() {

                //library of terms
                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("white");
                background.graphics.drawRect(0, 0, maxWidth, 40);
                container.setBounds(0, 0, maxWidth, 40);

                container.on("pressmove", handleElementDrag);
                container.on("pressup", handleElementPressUp);

                var mouseDragPosition = null;

                container.addChild(background);
                container.addChild(createCircle());
                container.color = container.getChildByName("circle").color;



                var label = new createjs.Text("", "10px Verdana", "");
                label.color = "white";
                label.text = "";
                label.x = 8;
                label.y = 2;
                label.name = "label";

                container.addChild(label);

                container.isEmpty = false;

                var isDragging = false;

                //drag functionality
                
                function handleElementDrag(evt) {
                    
                    if (mouseDragPosition != null) {
                        var deltaX = evt.stageX - mouseDragPosition.x;
                        var deltaY = evt.stageY - mouseDragPosition.y;

                        var targetNeighbour=null;

                        var dragThreshold = 30;
      
                        //we don't want a circle to move diagonally, so we are eliminating one of the axis 
                        

                        if (isDragging && evt.currentTarget.targetNeighbour == null) {
                            
                            var iIndex = evt.currentTarget.i;
                            var jIndex = evt.currentTarget.j;
                            if (Math.abs(deltaX) > Math.abs(deltaY))
                                deltaY = 0;
                            else
                                deltaX = 0;
                            
                            if (deltaX > dragThreshold && iIndex < 9) {
                                // move right


                                var xx = evt.currentTarget.original_x + deltaX;
                                targetNeighbour = gameData[iIndex + 1][jIndex];

                                if (xx > targetNeighbour.original_x + dragThreshold)
                                    xx = targetNeighbour.original_x;

                                mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                                createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: xx }, 50);

                                //identify right neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;

                                evt.currentTarget.allowSwap = (evt.currentTarget.right > 0);
                                mouseDragPosition = null;
                                isDragging = false;

                            }
                            else if (deltaX < -dragThreshold && iIndex > 0) {
                                // move left

                                var xx = evt.currentTarget.original_x + deltaX;
                                targetNeighbour = gameData[iIndex - 1][jIndex];
                                
                                if (xx < targetNeighbour.original_x - dragThreshold)
                                xx = targetNeighbour.original_x;
                                mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                                createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: xx }, 100);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;
                                evt.currentTarget.allowSwap = (evt.currentTarget.left > 0);
                                mouseDragPosition = null;
                                isDragging = false;

                            }
                            else if (deltaY < -dragThreshold && jIndex > 0) {
                                // move up
     
                                var yy = evt.currentTarget.original_y + deltaY;

                                targetNeighbour = gameData[iIndex][jIndex-1];
                                
                                if (yy < targetNeighbour.original_y - dragThreshold)
                                    yy = targetNeighbour.original_y;
                                mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                                createjs.Tween.get(evt.currentTarget, { override: true }).to({ y: yy }, 50);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;
                                evt.currentTarget.allowSwap = (evt.currentTarget.top > 0);


                                mouseDragPosition = null;
                                isDragging = false;
                                

                            }
                            else if (deltaY > dragThreshold && jIndex < 9) {
                                // move down

                                var yy = evt.currentTarget.original_y + deltaY;

                                targetNeighbour = gameData[iIndex][jIndex + 1];

                                if (yy > targetNeighbour.original_y + dragThreshold)
                                    yy = targetNeighbour.original_y;
                                mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                                createjs.Tween.get(evt.currentTarget, { override: true }).to({ y: yy }, 50);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;
                                evt.currentTarget.allowSwap = (evt.currentTarget.bottom > 0);

                              
                                mouseDragPosition = null;
                                isDragging = false;
                                

                            }
                        }
                        else {
                            isDragging = true;
                        }
                    }
                    else {
                        mouseDragPosition = {
                            x: evt.stageX,
                            y: evt.stageY
                        };
                    }
                }

                //determine if term is outside mainbox and return to terms library container
                function handleElementPressUp(evt) {
                   if (evt.currentTarget.targetNeighbour != null) {
                       var targetCircle = evt.currentTarget.targetNeighbour;

                       createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: targetCircle.original_x, y: targetCircle.original_y }, 100);
                     /*  var curi = evt.currentTarget.i;
                       var curj = evt.currentTarget.j;

                       evt.currentTarget.i = targetCircle.i;
                       evt.currentTarget.j = targetCircle.j;

                       targetCircle.i = curi;
                       targetCircle.j = curj;

                       gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;
                       gameData[targetCircle.i][targetCircle.j] = targetCircle;*/

                       if (evt.currentTarget.allowSwap===true) {

                           var curi = evt.currentTarget.i;
                           var curj = evt.currentTarget.j;

                           evt.currentTarget.i = targetCircle.i;
                           evt.currentTarget.j = targetCircle.j;

                           targetCircle.i = curi;
                           targetCircle.j = curj;

                           gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;

                           gameData[targetCircle.i][targetCircle.j] = targetCircle;

                           mainBox.setChildIndex(targetCircle, mainBox.getNumChildren() - 1);
                           createjs.Tween.get(targetCircle, { override: true }).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 100);

                           var curx = evt.currentTarget.original_x; var cury = evt.currentTarget.original_y;
                           evt.currentTarget.original_x = targetCircle.original_x;
                           evt.currentTarget.original_y = targetCircle.original_y;

                           targetCircle.original_x = curx;
                           targetCircle.original_y = cury;
                            
                           ///////////////////////////

                           gameState.initialize= false;
                           tableCompactTimeout = setTimeout(scanAndCompactTable, 102);

                           ///////////////////////////
                           movesLeft--;
                           if(movesLeft<=0)
                           {
                               currentQuestion++;
                               if (currentQuestion >= gameData.Questions.length)
                               {
                                   currentArea = createWinnerView();
                                   stage.addChild(currentArea);
                               }
                               else
                               {
                                   showQuestionContainer(gameData.Questions[currentQuestion]);
                               }
                        }

                           movesLeftContainer.getChildByName('movesLeft').text = movesLeft;
                       }
                       else {
                           mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                           createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 250);
                           /*curi = evt.currentTarget.i; var curj = evt.currentTarget.j;
                           evt.currentTarget.i = targetCircle.i; evt.currentTarget.j = targetCircle.j;
                           targetCircle.i = curi; targetCircle.j = curj;
                           gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;
                           gameData[targetCircle.i][targetCircle.j] = targetCircle;*/

                       }
                       targetCircle.targetNeighbour = null;
                   }
                    mouseDragPosition = null;
                    isDragging = false;
                    evt.currentTarget.targetNeighbour = null;

                }

                return container;
            }

            function createElement(i, j, xCord, yCord)
            {
                var element = createCircleDraggableContainer();

                element.original_x = element.x = xCord;
                element.original_y = element.y = yCord;

                element.i = i;
                element.j = j;
                element.getChildByName('label').text = element.x + ",\n" + element.y;
                mainBox.addChild(element);
                return element;
            }

            function fillBoard() {
                var xCord = boardStartX;
                for (var i = 0; i < maxI; i++) {
                    var yCord = boardStartY;
                    gameData[i] = [];
                    for (var j = 0; j < 10; j++) {
                        gameData[i][j] = createElement(i, j, xCord, yCord);
                        
                        yCord += 40;
                    }
                    xCord += 40;
                }

            }

            function findPotentialElementMatchesReturnBest() {
                var bestMatch = null;

                for (var i = 0; i < maxI; i++) {
                
                    for (var j = 0; j < maxJ; j++) {
                        gameData[i][j].left = gameData[i][j].right = gameData[i][j].top = gameData[i][j].bottom = null;
                    }
                }
                for (var i = 0; i < maxI; i++) {
                
                    for (var j = 0; j < maxJ; j++) {

                        if (i == 0) gameData[i][j].left = 0;

                        if (i == 9) gameData[i][j].right = 0;
  
                        if (j == 0) gameData[i][j].top = 0;

                        if (j == 9) gameData[i][j].bottom = 0;




                        var weight = 0;
                        //we need to check for matches only in one direction, because we've already checked neigbouring matches for i-1 and j-1
                        if (gameData[i][j].right == null)
                        {
                            swapColors(gameData[i][j], gameData[i + 1][j]);
                            
                            if ((weight = matchWeight(gameData[i][j], gameData[i + 1][j])) > 0)
                            {
                                
                                gameData[i][j].right = gameData[i + 1][j].left = weight;

                                if (bestMatch==null)
                                {
                                    bestMatch = { source: gameData[i][j], target: gameData[i + 1][j] }
                                }
                                else
                                {
                                    if (Math.max(bestMatch.source.left,bestMatch.source.right,bestMatch.source.top,bestMatch.source.bottom,
                                                bestMatch.target.left, bestMatch.target.right, bestMatch.target.top, bestMatch.target.bottom) < weight)
                                    {
                                        bestMatch = { source: gameData[i][j], target: gameData[i + 1][j] }
                                    }
                                }
                            }
                            else
                            {
                                gameData[i][j].right = gameData[i + 1][j].left = 0;
                            }
                            swapColors(gameData[i + 1][j],gameData[i][j]);   
                        }
                        if (gameData[i][j].bottom == null)
                        {
                            swapColors(gameData[i][j], gameData[i][j+1]);


                            if ((weight = matchWeight(gameData[i][j], gameData[i][j+1])) > 0)
                            {
                                gameData[i][j].bottom = gameData[i][j + 1].top = weight;
                                if (bestMatch == null) {
                                    bestMatch = { source: gameData[i][j], target: gameData[i][j+1] }
                                }
                                else {
                                    if (Math.max(bestMatch.source.left, bestMatch.source.right, bestMatch.source.top, bestMatch.source.bottom,
                                                bestMatch.target.left, bestMatch.target.right, bestMatch.target.top, bestMatch.target.bottom) < weight) {
                                        bestMatch = { source: gameData[i][j], target: gameData[i][j+1] }
                                    }
                                }

                            }
                            else
                            {
                                gameData[i][j].bottom = gameData[i][j+1].top = 0;
                            }
                            swapColors(gameData[i][j+1],gameData[i][j]);   
                        }

                        gameData[i][j].getChildByName('label').text = gameData[i][j].left + ", " + gameData[i][j].top + "\n" + gameData[i][j].right + ", " + gameData[i][j].bottom;
                    }

                }
                return bestMatch;
            }

            function swapColors(source, target) {
                var tmpcolor = source.color;
                source.color = target.color;
                target.color = tmpcolor;
            }
            function matchWeight(source, target) {
                var weight = 0;
                var matchesS = findElementMatches(source);
                var matchesT = findElementMatches(target);

                if (matchesS.horMatchArr.length > 2 || matchesS.verMatchArr.length > 2 || matchesT.horMatchArr.length > 2 || matchesT.verMatchArr.length > 2) {
                    weight = matchesS.horMatchArr.length + matchesS.verMatchArr.length + matchesT.horMatchArr.length + matchesT.verMatchArr.length;
                }
                return weight;
            }


            function findElementMatches(element) {
              //horizontal 
              var horMatchArr = [element];
              var verMatchArr = [element];
              var newI = element.i - 1;
              var newJ = element.j - 1;
              
              var leftBoundary=element.i-2;
              var rightBoundary=element.i+2;
              var topBoundary=element.j-2;
              var bottomBoundary = element.j + 2;

              var color = element.color;


              while ((newI > -1) && (newI >= leftBoundary))
              {
                  var leftElement = gameData[newI][element.j];
                  if (color == leftElement.color)
                  {
                      //insert match into array
                      horMatchArr.splice(0, 0, leftElement);
                  }
                  else
                  {
                      break;
                  }
                  newI--;
              }

              newI = element.i + 1;
              while ((newI < maxI) && (newI <= rightBoundary)) {
                  var rightElement = gameData[newI][element.j];
                  if (color == rightElement.color) {
                      horMatchArr.push(rightElement);

                  }
                  else
                  {
                      break;
                  }
                  newI++;
              }


              while ((newJ > -1) && (newJ >= topBoundary)) {
                  var topElement = gameData[element.i][newJ];
                  if (color == topElement.color) {
                      verMatchArr.splice(0, 0, topElement);

                  }
                  else {
                      break;
                  }
                  newJ--;
              }

              newJ = element.j + 1;
              while ((newJ < maxJ) && (newJ <= bottomBoundary)) {
                  var bottomElement = gameData[element.i][newJ];
                  if (color == bottomElement.color) {
                      verMatchArr.push(bottomElement);

                  }
                  else {
                      break;
                  }
                  newJ++;
              }
              
             return { horMatchArr: horMatchArr, verMatchArr: verMatchArr };
          
          }
            //this function searches for matches
            function swapMatchesFound() {
              var matchesfound = false;
              //vertical 
              for (var i = 0; i < maxI; i++) {
                  for (var j = 0; j < maxJ; j++) {
                      var matches = findElementMatches(gameData[i][j]);

                      if (matches.horMatchArr.length > 2) {
                          for (var x = 0; x < matches.horMatchArr.length; x++) {
                              matches.horMatchArr[x].getChildByName("label").text = 'X';
                              matches.horMatchArr[x].isEmpty = true;

                          }
                          matchesfound = true;
                      }
                      if (matches.verMatchArr.length > 2) {
                          for (var x = 0; x < matches.verMatchArr.length; x++) {
                              matches.verMatchArr[x].getChildByName("label").text = 'X';
                              matches.verMatchArr[x].isEmpty = true;

                          }
                          matchesfound = true;
                      }


                 
                  }
              }
              return matchesfound;
          }
          
            function scanAndCompactTable() {
              currentBestMatch = findPotentialElementMatchesReturnBest();
              if (swapMatchesFound())
                    compactTable();
            }
         //this function removes matches and generates new circles
            function compactTable() {
              mainBox.mouseEnabled = false;
              var changed = false;
              
              for (var i = 0; i < maxI; i++) {
                  for (var j = maxJ - 1; j >= 0; j--) {

                      if (gameData[i][j].isEmpty) {
                          changed = true;
                          var xx = gameData[i][j].original_x;
                          var yy = gameData[i][j].original_y;
                          

                          var k = j - 1;
                          while (k > -1 && gameData[i][k].isEmpty) {
                              k--;
                          }
                          if (k < 0) {
                              mainBox.removeChild(gameData[i][j]);
                              gameData[i][j] = createElement(i, j, xx, boardStartY);
                              gameData[i][j].original_y = yy;

                              mainBox.addChild(gameData[i][j]);
                              var el = gameData[i][j];
                              createjs.Tween.get(el, { override: true }).to({ y: yy }, 100);//, createjs.Ease.bounceOut).call);
                          }
                          else {
                              var topCircle = gameData[i][k];
                              var yy1 = topCircle.y;

                              createjs.Tween.get(topCircle, { override: true }).to({ y: yy }, 100);

                              topCircle.j = j;
 
                              topCircle.original_y = yy;


                              gameData[i][k] = createElement(i, k, xx, yy1);
                              gameData[i][k].getChildByName('label').text = 'F';
                              gameData[i][k].isEmpty = true;

                              mainBox.addChild(gameData[i][k]);
                              
                              mainBox.removeChild(gameData[i][j]);
                              gameData[i][j] = topCircle;

                              mainBox.addChild(gameData[i][j]);

                              if (!gameState.initialize)
                              {
                                  gameState.score++;
                              }
                              
                              userScoreContainer.getChildByName('score').text = gameState.score;
                              
                          }

                      }
                     
                  }
                 
              }
              mainBox.mouseEnabled = true;
              if (changed)
              {
                  
                  tableCompactTimeout = setTimeout(scanAndCompactTable, 1000);
              }
                  
             
          }
         
            function showGameOver() {

              mainBox.mouseEnabled = false;

              var container = gameOverContainer;
              container.visible = true;
              
              stage.setChildIndex(container, mainBox.getNumChildren() - 1);
            }

            function showQuestionContainer(question) {

              if (mainBox)
                mainBox.mouseEnabled = false;
              
              var container = questionContainer;
              container.visible = true;
              container.getChildByName('question').text = question.Text;
              
              var answer=container.getChildByName('answer');
              while (answer)
              {
                  answer.removeAllEventListeners();
                  answer.removeAllChildren();
                  container.removeChild(answer);
                  answer=container.getChildByName('answer');
              }
              var startY = container.getChildByName('question').getBounds().height+30;
              for (var i = 0; i < question.Answers.length; i++)
              {
                  var ac = new createjs.Container();

                  var answerText = new createjs.Text("", "16px Verdana", "");
                  answerText.color = "black";
                  answerText.text = question.Answers[i].Text;
                  answerText.x = 10;
                  answerText.y = 10;
                  answerText.lineWidth = 380;
                  //answerText.maxWidth = 380;
                  ac.name = "answer";


                  var answer = new createjs.Shape();
                  answer.graphics.setStrokeStyle(1).beginStroke("black").beginFill("white");
                  answer.graphics.drawRect(0, 0, 370, 40);
                


                  ac.x = 10;
                  ac.y = startY + i * 50;

                  ac.addChild(answer);
                  ac.addChild(answerText);

                  ac.on("pressup", handleAnswerPressUp);

                  ac.IsCorrect = question.Answers[i].IsCorrect;


                  container.addChild(ac);
              }
              if (mainBox)
                stage.setChildIndex(container, mainBox.getNumChildren() - 1);
          }

            function handleAnswerPressUp(evt)
          {
              if (evt.currentTarget.IsCorrect) {
                  alert('You answer is correct');
                  mainBox.mouseEnabled = true;
                  questionContainer.visible = false;
                  movesLeft += maxMoveNbr;
                  movesLeftContainer.getChildByName('movesLeft').text = movesLeft;
                  
              }
              else
              {
                  alert('Your answer is WRONG');
         
                  maxMoveNbr;
                  currentQuestion++;
                  if (currentQuestion >= gameData.Questions.length) {
                      currentArea = createWinnerView();
                      stage.addChild(currentArea);
                  }
                  else {
                      showQuestionContainer(gameData.Questions[currentQuestion]);
                  }

              }
          }

            function createQuestionContainer() {

                //library container
                var container = new createjs.Container();

                //library background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("yellow").beginFill("purple");
                background.graphics.drawRect(0, 0, 400, 400);
                background.alpha = 0.95;
                container.addChild(background);

                var questionText = new createjs.Text("", "20px Verdana", "");
                questionText.color = "yellow";
                questionText.text = "";
                questionText.x = 10;
                questionText.y = 20;
                questionText.lineWidth = 380;
                questionText.name = "question";
                container.addChild(questionText);
                

                return container;
            }

            function createGameOverContainer() {

              //library container
              var container = new createjs.Container();

              //library background
              var background = new createjs.Shape();
              background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("aqua");
              background.graphics.drawRect(0, 0, 400, 400);
              background.alpha = 0.95;
              container.addChild(background);

              var text = new createjs.Text("", "20px Verdana", "");
              text.color = "black";
              text.text = "GAME OVER!!!!!!!!!!!!!!!";
              text.x = 10;
              text.y = 20;
              text.lineWidth = 380;
              container.addChild(text);

              container.visible = false;
              return container;
            }
            function createUserScoreContainer() {
                //user score container
                var container = new createjs.Container();

                //user score background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("purple");
                background.graphics.drawRect(0, 0, 100, 50);
                container.addChild(background);

                //user score title
                var scoreLabel = new createjs.Text("", "15px Verdana", "");
                scoreLabel.color = "yellow";
                scoreLabel.text = "Score:";
                scoreLabel.x = 25;
                scoreLabel.y = 2;
                container.addChild(scoreLabel);

                //user score score
                var scoreText = new createjs.Text("", "20px Verdana", "");
                scoreText.color = "white";
                scoreText.text = 900; //this will need to change later to be a var to hold user score. 
                scoreText.x = 30;
                scoreText.y = 20;
                scoreText.name="score";
                container.addChild(scoreText);
                return container;
          }




            function createHintButton() {
    
              var container = new createjs.Container();


              var background = new createjs.Shape();
              background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("purple");
              background.graphics.drawRect(0, 0, 100, 50);
              container.addChild(background);


              var buttonLabel = new createjs.Text("", "15px Verdana", "");
              buttonLabel.color = "yellow";
              buttonLabel.text = "HINT";
              buttonLabel.x = 25;
              buttonLabel.y = 2;
              container.addChild(buttonLabel);
              container.on("pressup", handleButtonPressUp);

              function handleButtonPressUp(evt) {
                  
                  if (currentBestMatch)
                  {
                      createjs.Tween.get(currentBestMatch.source)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha:0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha: 0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha:0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000)
                      createjs.Tween.get(currentBestMatch.target)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha:0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha: 0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000)
                                  .to({ scaleX: 1.1, scaleY: 1.1, alpha:0.2 }, 1000)
                                  .to({ scaleX: 1.0, scaleY: 1.0, alpha: 1 }, 1000);
                  }
                  
                 
                  
                 


              }




              return container;
          }
            function createMovesLeftContainer() {
                //user score container
                var container = new createjs.Container();

                //user score background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("white").beginFill("purple");
                background.graphics.drawRect(0, 0, 100, 50);
                container.addChild(background);

                //user score title
                var movesLeftLabel = new createjs.Text("", "15px Verdana", "");
                movesLeftLabel.color = "yellow";
                movesLeftLabel.text = "Moves Left:";
                movesLeftLabel.x = 5;
                movesLeftLabel.y = 2;
                container.addChild(movesLeftLabel);

                //user score score
                var movesLeftText = new createjs.Text("", "20px Verdana", "");
                movesLeftText.color = "white";
                movesLeftText.text = movesLeft; //this will need to change later to be a var to hold user score. 
                movesLeftText.x = 30;
                movesLeftText.y = 20;
                movesLeftText.name = "movesLeft";
                container.addChild(movesLeftText);
                return container;
            }



            function createWinnerView() {

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

        }

        function reset() {

            stage.removeAllChildren();
            initialize();
        }



    }
    return Game;
})(createjs, $);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
