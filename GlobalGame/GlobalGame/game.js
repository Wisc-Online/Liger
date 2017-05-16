/// <reference path="C:\SoftwareDev\GIT\Liger\GlobalGame\GlobalGame\createjs.min.js" />
var Game = Game || (function (createjs, $) {
    function Game(canvasId, gameData) {

        var assetsPath = gameData.assetsPath || "";

        var timeLimit = 240;
        var assets = [
            { id: "next", src: assetsPath + "next.png" },
            { id: "quit", src: assetsPath + "quit.png" },
            { id: "start_over", src: assetsPath + "start_over.png" },
            { id: "aesh_header", src: assetsPath + "aeesh.png" },
            { id: "smashed_tomato", src: assetsPath + "smashed_tomato.png" },
            { id: "tomato", src: assetsPath + "tomato.png" },
            { id: "winner_header", src: assetsPath + "BoomChakalaka.png" },
            { id: "instructions_background", src: assetsPath + "instructions_background.png" },
            { id: "instructions_question", src: assetsPath + "instructions_question.png" },
            { id: "instructions", src: assetsPath + "instructions_question.png" },
            { id: "title_background", src: assetsPath + "title_background.jpg" },
            { id: "start_button", src: assetsPath + "start_button.png" },
            { id: "instructions", src: assetsPath + "ChakalakaInstructions.png" },
            { id: "chakalaka_bowl", src: assetsPath + "chakalaka_bowl.png" },
            { id: "chakalaka", src: assetsPath + "chakalaka.png" },
            { id: "chakalaka1", src: assetsPath + "chakalaka1.jpg" },
            { id: "buttonClick", src: assetsPath + "ButtonClickDry.mp3" },
            { id: "rf_POP", src: assetsPath + "rf_POP.png" },
            { id: "musicOn", src: assetsPath + "musicOn.png" },
            { id: "orange", src: assetsPath + "orange.png" },
            { id: "red", src: assetsPath + "red.png" },
            { id: "brown", src: assetsPath + "brown.png" },
            { id: "green", src: assetsPath + "green.png" },
            { id: "white", src: assetsPath + "white.png" },
            { id: "blue", src: assetsPath + "blue.png" },
            { id: "musicOff", src: assetsPath + "musicOff.png" },
            { id: "chakalaka1", src: assetsPath + "Game-chakalaka_01.mp3" },
            { id: "chakalaka2", src: assetsPath + "Game-chakalaka_02.mp3" },
            { id: "gameshort", src: assetsPath + "Game-short_01.mp3" },
            { id: "aaeesshh1", src: assetsPath + "Game_Aaeesshh_01.mp3" },
            { id: "aaeesshh2", src: assetsPath + "game_aaeesshh_02.mp3" },
            { id: "hint", src: assetsPath + "question_mark.png" }
        ];
        var queue = new createjs.LoadQueue(false);
        

        queue.installPlugin(createjs.Sound);

        queue.addEventListener("complete", function (event) {
            initialize();
        });
        queue.loadManifest(assets);

        var mainView = null;
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
        

        ////////////////////////////////////////
        var gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);

        
        
        var maxMoveNbr = 5;
        
        var boardStartX = 50;
        var boardStartY = 60;
        var boardWidth= 600;
        var boardHeight = 500;
        
        var containerAtX = boardStartX + boardWidth + 20;
        var hintContainerAtY = 150;
        var movesContainerAtY = 250;
        var scoreContainerAtY = 400;

        var maxI = 12; //number of element in a row
        var maxJ = 10; //number of element in a column

        var maxWidth = Math.round(boardWidth / maxI);
        var maxHeight = Math.round(boardHeight / maxJ);

        
        

        stage.enableMouseOver(10);
        // stage.mouseMoveOutside = true;

        var fps = 60;
        var tickCount = 0;
        

        var DragThreshold = 30;
        //set ticker 
        createjs.Ticker.setFPS(60);

        function handleTick() {
            stage.update();
        }

        createjs.Ticker.on("tick", handleTick);



        

        function initialize() {
            var tableCompactTimeout = null;
            var currentQuestion = 0;
            var currentBestMatch = null;
            var penalty = 5;
            var movesLeft = 0;
            var currentArea = null;

            var musicOn = true;
            var chakalaka2 = createjs.Sound.createInstance("chakalaka2", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
           // createjs.Sound.play("chakalaka2");
            var aaeesshh1 = createjs.Sound.createInstance("aaeesshh1", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });

            var gameshort = createjs.Sound.createInstance("gameshort", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
            var buttonClick = createjs.Sound.createInstance("ButtonClickDry", { interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0 });
            buttonClick.volume = buttonClick.volume * 0.75;


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
            var mainBox, questionContainer, userScoreContainer, layer, rectangle, movesLeftContainer, instructionsContainer, hintButtonContainer;
            var button1, button2;
            var soundContainer = createSoundContainer();
            var instructionsView = null;

            instructionsContainer = createInstructionContainer();
            // adding elements to stage
            stage.addChild(instructionsContainer);


            function displayMessage(message) {
                
                var text = new createjs.Text(message, "bold 50px Cooper Black", "#ffd5c0");
               
                text.set({
                    x: 380,
                    y: 25,
                  
                    textAlign: "center",
                    textBaseline: "middle",
                    alpha: 0
                });
                
                stage.addChild(text);

             
                createjs.Tween.get(text)    
                    .to({ alpha: 100 }, 900)
                    .wait(900)
                    .to({ alpha: 0 }, 400)
                    .call(function () {
                        stage.removeChild(text);
                    })

            }

            function wrongAnswer(message) {
     
                var text = new createjs.Text(message, "bold 30px Cooper Black", "brown");

                text.set({
                    x: 400,
                    y: 20,

                    textAlign: "center",
                    textBaseline: "middle",
                    alpha: 0
                });

                stage.addChild(text);


                createjs.Tween.get(text)
                    .to({ alpha: 100 }, 1000)
                    .wait(1000)
                    .to({ alpha: 0 }, 1000)
                    .call(function () {
                        stage.removeChild(text);
                    })

            }


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
                var image = new createjs.Bitmap(queue.getResult("instructions"));

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
                showQuestionContainer(gameData.Questions[currentQuestion]);


                
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

                instructionsContainer.on("mouseover", handleButtonHover);
                instructionsContainer.on("mouseout", handleButtonHover);
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

                soundContainer.on("mouseover", handleButtonHover);
                soundContainer.on("mouseout", handleButtonHover);
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

                    showView(createQuestionView());
                });

                startButton.on("mouseover", handleButtonHover);
                startButton.on("mouseout", handleButtonHover);

                
                return view;
            }


            function handleButtonHover(event) {
             
                var initScareX=1;
                var initScareY = 1;
                if (event.type == "mouseover") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: initScareX * 1.0625, scaleY: initScareY * 1.0625 }, 100)
                                                            .to({ scaleX: initScareX, scaleY: initScareY }, 100)
                                                            .to({ scaleX: initScareX * 1.0625, scaleY: initScareY * 1.0625 }, 100);
                }
                if (event.type == "mouseout") {
                    createjs.Tween.get(event.currentTarget).to({ scaleX: initScareX, scaleY: initScareY}, 100);
                }

            }
           
            function createMainContainer() {

                var container = new createjs.Container();

                var background = new createjs.Shape();
               // background.graphics.setStrokeStyle(1).beginStroke("white");
                background.graphics.drawRect(boardStartX, boardStartY, boardWidth, boardHeight);

                container.addChild(background);

                //add user score container
                userScoreContainer = createUserScoreContainer();
                userScoreContainer.x = containerAtX;
                userScoreContainer.y = scoreContainerAtY;
                userScoreContainer.visible = false;
                container.addChild(userScoreContainer);

                //
                movesLeftContainer = createMovesLeftContainer();
                movesLeftContainer.x = containerAtX;
                movesLeftContainer.y = movesContainerAtY;
                movesLeftContainer.visible = false;
                container.addChild(movesLeftContainer);
                

                hintButtonContainer = createHintButton();
                hintButtonContainer.x = containerAtX+20;
                hintButtonContainer.y = hintContainerAtY;
                
                container.addChild(hintButtonContainer);
                return container;
            }

            function createCircle(color)
            {
                //var circle = new createjs.Shape();
                
                var image = queue.getResult(color);

                var bitmap = new createjs.Bitmap(image);
                bitmap.scaleX = maxWidth / image.width;
                bitmap.scaleY = maxHeight / image.height;

                bitmap.name = "circle";
                return bitmap;
            }

            function createCircleDraggableContainer() {

           
                var container = new createjs.Container();

                container.setBounds(0, 0, maxWidth, maxHeight);

                container.on("pressmove", handleElementDrag);
                container.on("pressup", handleElementPressUp);

                var mouseDragPosition = null;

                
                var colors = ["orange", "red","brown", "green", "blue", "white"];
                var colorIndex = Math.floor(Math.random() * colors.length);

                container.color = colors[colorIndex];
                container.addChild(createCircle(container.color));
                

                container.isEmpty = false;

                var isDragging = false;

                //drag functionality
                
                function handleElementDrag(evt) {
                    
                    if (mouseDragPosition != null) {
                        var deltaX = evt.stageX - mouseDragPosition.x;
                        var deltaY = evt.stageY - mouseDragPosition.y;

                        var targetNeighbour=null;

                        var dragThreshold = DragThreshold;
      
                        //we don't want a circle to move diagonally, so we are eliminating one of the axis 
                        

                        if (isDragging && evt.currentTarget.targetNeighbour == null) {
                            
                            var iIndex = evt.currentTarget.i;
                            var jIndex = evt.currentTarget.j;
                            if (Math.abs(deltaX) > Math.abs(deltaY))
                                deltaY = 0;
                            else
                                deltaX = 0;
                            
                            if (deltaX > dragThreshold && iIndex < (maxI - 1)) {
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
                                createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: xx }, 50);

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
                            else if (deltaY > dragThreshold && jIndex < (maxJ -1)) {
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


                       if (evt.currentTarget.allowSwap===true) {/////////////////////////////////////////////////////////////////////

                           var curi = evt.currentTarget.i;
                           var curj = evt.currentTarget.j;

                           evt.currentTarget.i = targetCircle.i;
                           evt.currentTarget.j = targetCircle.j;

                           targetCircle.i = curi;
                           targetCircle.j = curj;

                           gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;

                           gameData[targetCircle.i][targetCircle.j] = targetCircle;

                           mainBox.setChildIndex(targetCircle, mainBox.getNumChildren() - 1);
                           createjs.Tween.get(targetCircle, { override: true }).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 100)
                                                                               .wait(150)
                                                                               .call(scanAndCompactTable);

                           var curx = evt.currentTarget.original_x; var cury = evt.currentTarget.original_y;
                           evt.currentTarget.original_x = targetCircle.original_x;
                           evt.currentTarget.original_y = targetCircle.original_y;

                           targetCircle.original_x = curx;
                           targetCircle.original_y = cury;
                            
                           movesLeft--;
                           movesLeftContainer.getChildByName('movesLeft').text = movesLeft;

                          
                          // tableCompactTimeout = setTimeout(scanAndCompactTable, 150);
                           
                       }
                       else {
                           mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                           createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 250);


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
           
                mainBox.addChild(element);
                return element;
            }

            function fillBoard() {
                var xCord = boardStartX;
                for (var i = 0; i < maxI; i++) {
                    var yCord = boardStartY;
                    gameData[i] = [];
                    for (var j = 0; j < maxJ; j++) {
                        gameData[i][j] = createElement(i, j, xCord, yCord);
                        
                        yCord += maxHeight;
                    }
                    xCord += maxWidth;
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

                        if (i == (maxI -1)) gameData[i][j].right = 0;
  
                        if (j == 0) gameData[i][j].top = 0;

                        if (j == (maxJ - 1)) gameData[i][j].bottom = 0;




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

                        //gameData[i][j].getChildByName('label').text = gameData[i][j].left + ", " + gameData[i][j].top + "\n" + gameData[i][j].right + ", " + gameData[i][j].bottom;
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
                            //  matches.horMatchArr[x].getChildByName("label").text = 'X';
                              matches.horMatchArr[x].isEmpty = true;

                          }
                          matchesfound = true;
                      }
                      if (matches.verMatchArr.length > 2) {
                          for (var x = 0; x < matches.verMatchArr.length; x++) {
                            //  matches.verMatchArr[x].getChildByName("label").text = 'X';
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
              else
              {

                  if (!gameState.initialize && movesLeft <= 0) {
                      moveToNextQuestion();
                  }

              }
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
                              
                              gameData[i][k].isEmpty = true;

                              mainBox.addChild(gameData[i][k]);
                              
                              mainBox.removeChild(gameData[i][j]);
                              gameData[i][j] = topCircle;

                              mainBox.addChild(gameData[i][j]);

                              
    
                              
                          }
                          //increment the score
                          if (!gameState.initialize)//don't increment before the first question was answered
                          {
                              gameState.score ++;

                              if (gameState.score == 100) {

                                  displayMessage("10 eXtra points");


                                  gameState.score += 10

                              } else if (gameState.score == 200) {
                                  displayMessage("15 eXtra points");


                                  gameState.score += 15
                              }

                              else if (gameState.score == 300) {
                                  displayMessage("25 eXtra points");


                                  gameState.score += 25
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
              hintButtonContainer.visible = false;
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
              var desc = container.getChildByName('description');
              if (desc) {
                  desc.removeAllEventListeners();
                  desc.removeAllChildren();
                  container.removeChild(desc);
              }

              

              var startY = container.getChildByName('question').getBounds().height + 30;
              
              var correctAnswerDescription = "";
              var descriptionContainerY = startY;
              for (var i = 0; i < question.Answers.length; i++)
              {
                  var ac = new createjs.Container();

                  var answerText = new createjs.Text("", "20px Arial", "");
                  answerText.color = "black";
                  answerText.text = question.Answers[i].Text;
                  answerText.x = 10;
                  answerText.y = 5;
                  answerText.lineWidth = boardWidth - 20;
                  answerText.name = "answerText";
                  ac.name = "answer";
                  ac.cursor = "pointer";
                  var answer = new createjs.Shape();
                  answer.graphics.setStrokeStyle(1).beginStroke("black").beginFill("white");
                  answer.graphics.drawRect(0, 0, boardWidth - 20, 40);
                  answer.name = "answerShapeHighlighted";
                  answer.alpha = 0;

                  var answer1 = new createjs.Shape();
                  answer1.graphics.setStrokeStyle(1).beginStroke("black").beginFill("#ffd5c0");
                  answer1.graphics.drawRect(0, 0, boardWidth - 20, 40);
                  answer1.name = "answerShape";


                  ac.x = 10;
                  ac.y = startY + i * 50;
                  descriptionContainerY = ac.y;
                  ac.addChild(answer);
                  ac.addChild(answer1);
                  ac.addChild(answerText);

                  ac.on("pressup", handleAnswerPressUp);
                  ac.on("mouseover", handleAnswerHover);
                  ac.on("mouseout", handleAnswerHover);
                  ac.text = question.Answers[i].Text;
                  ac.IsCorrect = question.Answers[i].IsCorrect;
                  
                  if (question.Answers[i].IsCorrect && question.Answers[i].Details)
                  {
                      correctAnswerDescription = question.Answers[i].Details;
      
                  }
                  
                  container.addChild(ac);
              }
  
              if (correctAnswerDescription != "")
              {

                  var description = new createjs.Container();
                    ///////////////////////
                  description.name = "description";
                  var descriptionText = new createjs.Text("", "18px Verdana", "");
                  descriptionText.color = "green";
                  descriptionText.text = correctAnswerDescription;
                  descriptionText.x = 5;
                  descriptionText.y = 90;
                  descriptionText.lineWidth = boardWidth - 25;
                  descriptionText.name = "detailsText";
                  

                  var descriptionShape = new createjs.Shape();
                  descriptionShape.graphics.setStrokeStyle(1).beginStroke("black").beginFill("#ffd5c0");
                  descriptionShape.graphics.drawRect(0, 80, boardWidth - 25, 150);
                  descriptionShape.name = "detailsShape";


                  description.addChild(descriptionShape);
                  description.addChild(descriptionText);

                  description.x = 10;
                  description.y = descriptionContainerY;
                  description.alpha = 0;
                  container.addChild(description);
               }
              
              

                /////////////////////

              container.getChildByName('nextButton').alpha = 0;
              container.getChildByName('nextButton').mouseEnabled = false;
              if (mainBox)
                stage.setChildIndex(container, mainBox.getNumChildren() - 1);
            }

            function handleAnswerHover(event) {


                if (event.type == "mouseover") {
                    event.currentTarget.getChildByName("answerText").color = "brown";
                    event.currentTarget.getChildByName("answerText").font = "bold 24px Arial";
                    event.currentTarget.getChildByName("answerShape").alpha = 0;
                    event.currentTarget.getChildByName("answerShapeHighlighted").alpha = 1;
                }
                else {
                    event.currentTarget.getChildByName("answerText").color = "black";
                 
                    event.currentTarget.getChildByName("answerText").font = "20px Arial";
                    event.currentTarget.getChildByName("answerShape").alpha = 1;
                    event.currentTarget.getChildByName("answerShapeHighlighted").alpha = 0;
                }

            }



            function handleAnswerPressUp(evt)
            {
              gameState.initialize = false;
              for (var k = 0; k < questionContainer.children.length; k++) {
                    //-------------------------->

                    if (questionContainer.children[k].name == "answer") {
                        if (questionContainer.children[k].IsCorrect) {
                            var correctButton = questionContainer.children[k];
                            // alert(correctButton.text);
                            correctButton.getChildByName("answerText").color = "green";
                            createjs.Tween.get(correctButton.getChildByName("answerShape"))
                                      .to({ scaleX: 0.5, scaleY: 0.7 }, 1000)
                                      .to({ scaleX: 1, scaleY: 1 }, 1000)
                                      .to({ scaleX: 0.5, scaleY: 0.7 }, 1000)
                                      .to({ scaleX: 1, scaleY: 1 }, 1000);
                        }
                        else {
                            questionContainer.children[k].alpha = 0.3;
                        }

                        questionContainer.children[k].mouseEnabled = false;
                    }

                    //--------------------------->
                }

              if (questionContainer.getChildByName("description")) 
              {
                 
                  questionContainer.getChildByName("description").alpha = 1;
                  
              }

              if (evt.currentTarget.IsCorrect) {
               
                  displayMessage("Good Job!");
                  createjs.Sound.play("gameshort");
                  questionContainer.getChildByName('nextButton').success = true;

                 
              }
              else
              {
                  var message;
                /*  var pointsPenalty = penalty;
                  if (gameState.score < pointsPenalty)
                  {
                      pointsPenalty = gameState.score;
                  }
                  gameState.score = gameState.score - pointsPenalty;

                  
                  if (pointsPenalty>0)
                  {
                      message = "Wrong Answer: -" + pointsPenalty + " Points (Score: " + gameState.score + ")";
                  }
                  else
                      message = "Wrong Answer!";*/
                  message = "Wrong Answer!";
                  wrongAnswer(message);
                  createjs.Sound.play("aaeesshh1");

                  questionContainer.getChildByName('nextButton').success = false;

                  
                  gameState.questionsMissed++;
              }
              questionContainer.getChildByName('nextButton').alpha = 1;
              questionContainer.getChildByName('nextButton').mouseEnabled = true;
            }
          
            function createQuestionContainer() {

                //library container
                var container = new createjs.Container();

                //library background   
        
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("yellow").beginFill("brown");
                background.graphics.drawRect(0, 0, boardWidth, boardHeight);
                background.alpha = 0.95;
                container.addChild(background);

                var questionText = new createjs.Text("", "bold 24px Arial", "");
                //change green color
                questionText.color = "yellow";
                questionText.text = "";
                questionText.x = 10;
                questionText.y = 20;
                questionText.lineWidth = boardWidth - 20;
                questionText.name = "question";
                container.addChild(questionText);
                
                //
                //add next button
                //
                var img = queue.getResult("next");
                var nextButton = new createjs.Bitmap(img);
              //  img.width = 50;
               // img.height = 50;

                nextButton.shadow = new createjs.Shadow("gray", 1, 1, 1);
                nextButton.regX = nextButton.getBounds().width / 2;

                nextButton.cursor = "pointer";
                nextButton.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#f00").drawCircle(50, 50, 50));

                nextButton.addEventListener("pressup",handleNextButtonPressUp);

                nextButton.on("mouseover", handleButtonHover);
                nextButton.on("mouseout", handleButtonHover);


                nextButton.name = "nextButton";
                nextButton.x=boardWidth-60;
                nextButton.y = boardHeight-60;

                container.addChild(nextButton);
                //




                return container;
            }

            function handleNextButtonPressUp()
            {
                createjs.Sound.play("buttonClick");
                

                if (questionContainer.getChildByName('nextButton').success)
                {
                        mainBox.mouseEnabled = true;
                        questionContainer.visible = false;
                        hintButtonContainer.visible = true;
                        userScoreContainer.visible = true;
                        movesLeftContainer.visible = true;

                        movesLeft += maxMoveNbr;
                        movesLeftContainer.getChildByName('movesLeft').text = movesLeft;

                }
                else
                {
                    moveToNextQuestion();
                }
            }

            function moveToNextQuestion()
            {
                currentQuestion++;
                if (currentQuestion >= gameData.Questions.length) {
                    currentArea = createWinnerView();
                    stage.addChild(currentArea);
                }
                else {
                    showQuestionContainer(gameData.Questions[currentQuestion]);
                }
            }

           
            function createUserScoreContainer() {
                //user score container
                var container = new createjs.Container();


                //user score title
                var scoreLabel = new createjs.Text("", "24px Verdana", "");
                scoreLabel.color = "yellow";
                scoreLabel.text = "Score:";
                scoreLabel.x = 5;
                scoreLabel.y = 2;
                container.addChild(scoreLabel);

                //user score score
                var scoreText = new createjs.Text("", "32px Verdana bold", "");
                scoreText.color = "white";
                scoreText.text = gameState.score; 
                scoreText.x = 30;
                scoreText.y = 40;
                scoreText.name="score";
                container.addChild(scoreText);
                return container;
          }

            function createHintButton() {
    
              var container = new createjs.Container();
              var image = queue.getResult("hint");

              var bitmap = new createjs.Bitmap(image);
              bitmap.scaleX = maxWidth / image.width;
              bitmap.scaleY = maxHeight / image.height;

              container.addChild(bitmap);
              container.cursor = 'pointer';
              

              container.on("pressup", handleButtonPressUp);
              container.on("mouseover", handleButtonHover);
              container.on("mouseout", handleButtonHover);

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


                //user score title
                var movesLeftLabel = new createjs.Text("", "24px Verdana", "");
                movesLeftLabel.color = "yellow";
                movesLeftLabel.text = "Moves\n Left:";
                movesLeftLabel.x = 5;
                movesLeftLabel.y = 2;
                container.addChild(movesLeftLabel);

                //user score score
                var movesLeftText = new createjs.Text("", "32px Verdana", "");
                movesLeftText.color = "white";
                movesLeftText.text = movesLeft; //this will need to change later to be a var to hold user score. 
                movesLeftText.x = 30;
                movesLeftText.y = 60;
                movesLeftText.name = "movesLeft";
                container.addChild(movesLeftText);
                return container;
            }
        
            function createWinnerView() {

                mainBox.removeAllEventListeners();
                mainBox.removeAllChildren();
                stage.removeChild(mainBox);
                questionContainer.removeAllEventListeners();
                questionContainer.removeAllChildren();
                stage.removeChild(questionContainer);

                var view = new createjs.Container();


                
                

           
                
                
                var image;
                var winner_header;
                var titleText
                if (gameState.score>0)
                {
                    image = queue.getResult("chakalaka_bowl");
                    winner_header = new createjs.Bitmap(queue.getResult("winner_header"));
                    titleText = new createjs.Text("You won " + gameState.score + " points!", "32pt Arial bold", "white");
                    createjs.Sound.play("chakalaka2");
                }
                else
                {
                    image = queue.getResult("smashed_tomato");
                    winner_header = new createjs.Bitmap(queue.getResult("aesh_header"));
                    titleText = new createjs.Text("Sorry, you didn't win any points!", "24pt Arial bold", "white");
                    createjs.Sound.play("aaeesshh1");
                }
                    

                winner_header.x = 120;
                winner_header.y = 10;
                view.addChild(winner_header);


                var bitmap = new createjs.Bitmap(image);
                bitmap.scaleX = (boardWidth - 200) / image.width;
                bitmap.scaleY = (boardHeight - 200) / image.height;

               // bitmap.regX = image.width / 2;
                bitmap.x = 200  ;
                bitmap.y = 250;
                view.addChild(bitmap);



                titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);

                titleText.regX = titleText.getBounds().width / 2;
                titleText.x = 400;
                titleText.y = 75;
                
                view.addChild(titleText);
                view.name = "WinnerView";

                if (gameState.score <= 0)
                {
                    createjs.Tween.get(winner_header)
                                  .to({ alpha: 0 }, 5000);
                    createjs.Tween.get(titleText)
                                  .to({ alpha: 0 }, 2000);
                }
                //createjs.Tween.get(bitmap)
                //                  .to({ alpha: 0 }, 3000);
                
               // createjs.Tween.get(winner_header)
               //                          .to({ alpha: 0 }, 5000);
              //  createjs.Tween.get(titleText)
              //                    .to({ alpha: 0 }, 2000);
                if (!isLmsConnected) {



                    var img = queue.getResult("start_over");
                    var startOverButton = new createjs.Bitmap(img);
                    img.width=100;
                    img.height=50;
                    
                    startOverButton.shadow = new createjs.Shadow("gray", 1, 1, 1);
                    startOverButton.regX = startOverButton.getBounds().width / 2;
                    
                    startOverButton.cursor = "pointer";


                    startOverButton.addEventListener("pressup", function (event) {
                        createjs.Sound.play("buttonClick");
                        reset();
                    });

                    startOverButton.on("mouseover", handleButtonHover);
                    startOverButton.on("mouseout", handleButtonHover);


                    startOverButton.x = boardWidth/2;
                    startOverButton.y = 140;
                    startOverButton.alpha = 0;
                    view.addChild(startOverButton);

                    
                    createjs.Tween.get(startOverButton)
                                  .to({ alpha: 1 }, 3000);
                }
                

                submitScore(gameState.score);



                if (isLmsConnected || navigator.userAgent.match(/Android/i)
                   || navigator.userAgent.match(/webOS/i)
                   || navigator.userAgent.match(/iPhone/i)
                   || navigator.userAgent.match(/iPad/i)
                   || navigator.userAgent.match(/iPod/i)
                   || navigator.userAgent.match(/BlackBerry/i)
                   || navigator.userAgent.match(/Windows Phone/i)
                   ) {

                    var img = queue.getResult("quit");
                    var quitButton = new createjs.Bitmap(img);


                    quitButton.shadow = new createjs.Shadow("gray", 1, 1, 1);
                    quitButton.regX = quitButton.getBounds().width / 2;

                    quitButton.cursor = "pointer";


                    quitButton.addEventListener("pressup", function (event) {
                        createjs.Sound.play("buttonClick");
                        quit();
                    });

                    quitButton.on("mouseover", handleButtonHover);
                    quitButton.on("mouseout", handleButtonHover);


                    quitButton.x = boardWidth / 2 +100;
                    quitButton.y = 220;

                    quitButton.alpha = 0;
                    view.addChild(quitButton);

                    createjs.Tween.get(quitButton)
                                  .to({ alpha: 1 }, 3000);
                    

                    if (isLmsConnected) {
                          ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
                          ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.completed);

                        isLmsConnected = false;
                    }
                }
                
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
            stage.removeAllEventListeners();



            initialize();
        }

    }
    return Game;
})(createjs, $);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
