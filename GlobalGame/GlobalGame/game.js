/// <reference path="C:\SoftwareDev\GIT\Liger\GlobalGame\GlobalGame\createjs.min.js" />
var Game = Game || (function (createjs, $) {
    function Game(canvasId, gameData) {



        //var assetsPath = gameData.assetsPath || "";
        var gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);

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

            //create game objects
            var mainBox, questionContainer, userScoreContainer, layer, rectangle;

            // Main game box

            mainBox = createMainContainer();
            fillBoard();


            //add terms library container
            questionContainer = createquestionContainer();
            questionContainer.x = 580;
            questionContainer.y = 40;

            //add user score container
            userScoreContainer = createUserScoreContainer();
            userScoreContainer.x = 580;
            userScoreContainer.y = 265;

            // adding elements to stage
            stage.addChild(mainBox, userScoreContainer, questionContainer, layer, rectangle);


            function createMainContainer() {

                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("aqua");
                background.graphics.drawRect(20, 20, 400, 400);


                container.addChild(background);
                return container;
            }

            function createCircleDraggableContainer(xCord, yCord) {

                var maxWidth = 40;

                //library of terms
                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("white");
                background.graphics.drawRect(0, 0, maxWidth, 40);
                container.setBounds(0, 0, maxWidth, 40);

                var colors = ["pink", "blue", "red", "orange"];
                var randomNum = Math.floor((Math.random() * 4) + 0);
                //colors.property = randomNum;

                var circle = new createjs.Shape();
                circle.graphics.beginFill(colors[randomNum]).drawCircle(maxWidth / 2, maxWidth / 2, maxWidth / 2);
                container.color = colors[randomNum];//randomNum;

                container.on("pressmove", handleTermDrag);
                container.on("pressup", handleTermPressUp);

                var mouseDragPosition = null;

                container.addChild(background);
                container.addChild(circle);

                var isDragging = false;

                //drag functionality
                function handleTermDrag(evt) {

                    if (mouseDragPosition != null) {
                        var deltaX = evt.stageX - mouseDragPosition.x;
                        var deltaY = evt.stageY - mouseDragPosition.y;

                        var dragThreshold = 30;
                        var iIndex = evt.currentTarget.i;
                        var jIndex = evt.currentTarget.j;
                        if (isDragging) {


                            if (deltaX > dragThreshold && iIndex < 9) {
                                // move right
                                var rightCircle = gameData[iIndex + 1][jIndex];
                                var xx = evt.currentTarget.x;
                                createjs.Tween.get(evt.currentTarget).to({ x: rightCircle.x }, 200);
                                createjs.Tween.get(rightCircle).to({ x: xx }, 200);

                                evt.currentTarget.i = iIndex + 1;
                                rightCircle.i = iIndex;
                                gameData[iIndex + 1][jIndex] = evt.currentTarget;
                                gameData[iIndex][jIndex] = rightCircle;

                                mouseDragPosition = null;
                                isDragging = false;
                            }
                            else if (deltaX < -dragThreshold && iIndex > 0) {
                                // move left
                                var leftCircle = gameData[iIndex - 1][jIndex];
                                var xx = evt.currentTarget.x;
                                createjs.Tween.get(evt.currentTarget).to({ x: leftCircle.x }, 200);
                                createjs.Tween.get(leftCircle).to({ x: xx }, 200);

                                evt.currentTarget.i = iIndex - 1;
                                leftCircle.i = iIndex;


                                gameData[iIndex - 1][jIndex] = evt.currentTarget;

                                gameData[iIndex][jIndex] = leftCircle;

                                mouseDragPosition = null;
                                isDragging = false;
                            }
                            else if (deltaY < -dragThreshold && jIndex > 0) {
                                // move up
                                var topCircle = gameData[iIndex][jIndex - 1];
                                var yy = evt.currentTarget.y;
                                createjs.Tween.get(evt.currentTarget).to({ y: topCircle.y }, 200);
                                createjs.Tween.get(topCircle).to({ y: yy }, 200);

                                evt.currentTarget.j = jIndex - 1;
                                topCircle.j = jIndex;
                                gameData[iIndex][jIndex - 1] = evt.currentTarget;

                                gameData[iIndex][jIndex] = topCircle;

                                mouseDragPosition = null;
                                isDragging = false;
                            }
                            else if (deltaY > dragThreshold && jIndex < 9) {
                                // move down
                                var bottomCircle = gameData[iIndex][jIndex + 1];
                                var yy = evt.currentTarget.y;
                                createjs.Tween.get(evt.currentTarget).to({ y: bottomCircle.y }, 200);
                                createjs.Tween.get(bottomCircle).to({ y: yy }, 200);

                                evt.currentTarget.j = jIndex + 1;
                                bottomCircle.j = jIndex;

                                gameData[iIndex][jIndex + 1] = evt.currentTarget;

                                gameData[iIndex][jIndex] = bottomCircle;
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
                function handleTermPressUp(evt) {
                    mouseDragPosition = null;
                }

                return container;
            }

            function fillBoard() {
                var xCord = 20;
                for (var i = 0; i < 10; i++) {
                    var yCord = 20;
                    gameData[i] = [];
                    for (var j = 0; j < 10; j++) {
                        var circle = createCircleDraggableContainer();

                        circle.x = xCord;
                        circle.y = yCord;
                        circle.original_x = circle.x;
                        circle.original_y = circle.y;
                        mainBox.addChild(circle);
                        circle.i = i;
                        circle.j = j;
                        gameData[i][j] = circle;
                        yCord += 40;
                    }

                    xCord += 40;
                }

            }

            //horizontal
            function checkHorizontalColors() {
                for (var x = 0; x < 10; x++) {
                    var counter = 1;
                    var t = 0;
                    for (var y = 0; y < 9; y++) {
                     t++; 
                        var circle = gameData[x][y];
                        if (circle.color == gameData[x][t].color) {

                            counter++; //alert(counter);
                        }
                        else {
                            if (counter >= 3) {
                                alert(circle.color + " Match found in column#" + x);
                                y++;
                                 t++;
                            }
                            counter = 1;
                        }
                    }
                }
            }
          function checkverticalColors() {

                //vertical 
                for (var y = 0; y < 10; y++) {
                    var counter = 1;
                    var t = 0;
                    for (var x = 0; x < 9; x++) {
                        t++; 
                        var circle = gameData[x][y];
                        if (circle.color == gameData[t][y].color) {
                            counter++; //alert(counter);
                        }
                        else {
                            if (counter >= 3) {
                                alert(circle.color + " Match found in row#" + y);
                                x++;
                                t++;
                            }
                            counter = 1;
                        }
                    }
                }
            }

            

            // terms library container
            function createquestionContainer() {

                //library container
                var container = new createjs.Container();

                //library background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("yellow");
                background.graphics.drawRect(0, 0, 100, 210);
                container.addChild(background);

                var offset_x, offset_y;
                var numberOfItemsPerColumn = 5;
                var padding = 5;

                container.addEventListener("click", function (evt) {
                    // alert("Works");
                    //checkColors();
                    checkHorizontalColors();
                    checkverticalColors();
                  


                })


                return container;
            }

            function createUserScoreContainer() {
                //user score container
                var container = new createjs.Container();

                //user score background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("blue");
                background.graphics.drawRect(0, 0, 100, 50);
                container.addChild(background);

                //user score title
                var scoreLabel = new createjs.Text("", "15px Verdana", "");
                scoreLabel.color = "white";
                scoreLabel.text = "Score:";
                scoreLabel.x = 25;
                scoreLabel.y = 2;
                container.addChild(scoreLabel);

                //user score score
                var scoreText = new createjs.Text("", "20px Verdana", "");
                scoreText.color = "orange";
                scoreText.text = 900; //this will need to change later to be a var to hold user score. 
                scoreText.x = 30;
                scoreText.y = 20;
                container.addChild(scoreText);
                return container;
            }
        }

        function reset() {

            stage.removeAllChildren();
            initialize();
        }

        initialize();

    }
    return Game;
})(createjs, $);


