/// <reference path="C:\SoftwareDev\GIT\Liger\GlobalGame\GlobalGame\createjs.min.js" />
var Game = Game || (function (createjs, $) {
    function Game(canvasId, gameData) {



        //var assetsPath = gameData.assetsPath || "";
        var gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);
        var gameCounter = 0;
        var maxWidth = 40;


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
            var button1, button2;
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


            //add user score container
            button1 = createFindMatchButton();
            button1.x = 580;
            button1.y = 320;

            button2 = createCompactTableButton();
            button2.x = 580;
            button2.y = 420;
            // adding elements to stage
            stage.addChild(mainBox, userScoreContainer, questionContainer, layer, rectangle, button1, button2);


            function createMainContainer() {

                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("aqua");
                background.graphics.drawRect(20, 20, 400, 400);


                container.addChild(background);
                return container;
            }


            function createCircle(color)
            {

                
                var circle = new createjs.Shape();


                var c = color;
                if(!color)
                {
                    var colors = ["pink", "blue", "red", "orange"];
                    var randomNum = Math.floor((Math.random() * 4) + 0);
                    color = colors[randomNum];
                }
                circle.graphics.beginFill(color).drawCircle(maxWidth / 2, maxWidth / 2, maxWidth / 2);
  

                circle.name = "circle";
                circle.color = color;

                
                return circle;
            }


            function createCircleDraggableContainer(xCord, yCord) {

                
                //library of terms
                var container = new createjs.Container();

                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("white");
                background.graphics.drawRect(0, 0, maxWidth, 40);
                container.setBounds(0, 0, maxWidth, 40);


                container.on("pressmove", handleTermDrag);
                container.on("pressup", handleTermPressUp);

                var mouseDragPosition = null;

                container.addChild(background);
                container.addChild(createCircle());

                
                var label = new createjs.Text("", "30px Verdana", "");
                label.color = "white";
                label.text = "";
                label.x = 8;
                label.y = 2;
                label.name = "label";

                container.addChild(label);


                container.isEmpty = false;

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
                var xCord = 20;
                for (var i = 0; i < 10; i++) {
                    var yCord = 20;
                    gameData[i] = [];
                    for (var j = 0; j < 10; j++) {
                        
                        
                        gameData[i][j] = createElement(i, j, xCord, yCord);
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
          function checkVerticalColors() {

              for (var x = 0; x < 10; x++) {
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
              var bottomBoundary = element.j+2;

              while ((newI > -1) && (newI >= leftBoundary))
              {
                  var leftElement = gameData[newI][element.j];
                  if (element.getChildByName("circle").color == leftElement.getChildByName("circle").color)
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
              while ((newI < 10) && (newI <= rightBoundary)) {
                  var rightElement = gameData[newI][element.j];
                  if (element.getChildByName("circle").color == rightElement.getChildByName("circle").color) {
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
                  if (element.getChildByName("circle").color == topElement.getChildByName("circle").color) {
                      verMatchArr.splice(0, 0, topElement);

                  }
                  else {
                      break;
                  }
                  newJ--;
              }

              newJ = element.j + 1;
              while ((newJ < 10) && (newJ <= bottomBoundary)) {
                  var bottomElement = gameData[element.i][newJ];
                  if (element.getChildByName("circle").color == bottomElement.getChildByName("circle").color) {
                      verMatchArr.push(bottomElement);

                  }
                  else {
                      break;
                  }
                  newJ++;
              }
              
              if (horMatchArr.length>2)
              for (var i = 0; i < horMatchArr.length; i++)
              {
                  horMatchArr[i].getChildByName("label").text = 'X';
                  horMatchArr[i].isEmpty = true;
                //  horMatchArr[i].colorCircle.style= "white";
              }
              if (verMatchArr.length > 2)
              for (var i = 0; i < verMatchArr.length; i++) {
                  verMatchArr[i].getChildByName("label").text = 'X';
                  verMatchArr[i].isEmpty = true;
                //  verMatchArr[i].colorCircle.style = "white";
              }

             return { horMatchArr: horMatchArr, verMatchArr: verMatchArr };
          

          }
          //this function searches for matches
          function scanTableForMatches() {

              //vertical 
              for (var i = 0; i < 10; i++) {
                  for (var j = 0; j < 10; j++) {
                      var matches = findElementMatches(gameData[i][j]);

                 }
              }
          }

         //this function removes matches and generates new circles
          function compactTable() {
              for (var i = 0; i < 10; i++) {
                  for (var j = 9; j >= 0; j--) {
                      
                      if(gameData[i][j].isEmpty)
                      {
                

                          var k = j - 1;
                          gameData[i][j].removeChild(gameData[i][j].getChildByName('circle'));
                          gameData[i][j].isEmpty = false;

                          while (k >- 1 && gameData[i][k].isEmpty)
                            {
                                k--;
                            }

                          if (k < 0) {

                              gameData[i][j].addChild(createCircle());
                              
                          }
                          else
                          {
                              gameData[i][j].addChild(createCircle(gameData[i][k].getChildByName('circle').color))
                              gameData[i][k].isEmpty = true;
                          }
                          var label = gameData[i][j].getChildByName('label');
                          label.text = "";
                          gameData[i][j].removeChild(label);
                          gameData[i][j].addChild(label);
                          gameCounter++;
                          userScoreContainer.getChildByName('score').text = gameCounter;
                      }
                  }
              }

          }
            

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

               
                return container;
            }

            function createFindMatchButton() {

                //library container
                var container = new createjs.Container();

                //library background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("grey");
                background.graphics.drawRect(0, 0, 80, 80);
                container.addChild(background);

                var buttonText = new createjs.Text("", "20px Verdana", "");
                buttonText.color = "orange";
                buttonText.text = "Matches";
                buttonText.x = 0;
                buttonText.y = 0;
                container.addChild(buttonText);

                container.addEventListener("click", function (evt) {
                    scanTableForMatches();
                })


                return container;
            }
            function createCompactTableButton() {

                //library container
                var container = new createjs.Container();

                //library background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("grey");
                background.graphics.drawRect(0, 0, 80, 80);
                container.addChild(background);

                var buttonText = new createjs.Text("", "20px Verdana", "");
                buttonText.color = "orange";
                buttonText.text = "Compact";
                buttonText.x = 0;
                buttonText.y = 0;
                container.addChild(buttonText);
                container.addEventListener("click", function (evt) {
                    compactTable();
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
                scoreText.name="score";
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


