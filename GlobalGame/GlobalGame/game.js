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
        var tableCompactTimeout = null;

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
            /*button1 = createFindMatchButton();
            button1.x = 580;
            button1.y = 320;

            button2 = createCompactTableButton();
            button2.x = 580;
            button2.y = 420;*/

            // adding elements to stage
            stage.addChild(mainBox, userScoreContainer, questionContainer, layer, rectangle, button1, button2);

            //checks for matches and eliminates all matches when the game loads
            scanAndCompactTable();

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
                    var colors = ["pink", "blue", "red", "orange", "green", "purple"];
                    var randomNum = Math.floor((Math.random() * 6) + 0);
                    color = colors[randomNum];
                }
                circle.graphics.beginFill(color).drawCircle(maxWidth / 2, maxWidth / 2, maxWidth / 2);

                circle.name = "circle";
                circle.color = color;
                return circle;
            }

            function getCoordinatesFromIndexes(i, j) {
                return {
                    x: i * maxWidth,
                    y: j * maxWidth
                }

            }
            function createCircleDraggableContainer() {

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
                
               function handleTermDrag(evt) {

                    if (mouseDragPosition != null) {
                        var deltaX = evt.stageX - mouseDragPosition.x;
                        var deltaY = evt.stageY - mouseDragPosition.y;

                        var targetNeighbour=null;

                        var dragThreshold = 30;
      
                        //we don't want a circle to move diagonally, so we are eliminating one of the axis 
                        

                        if (isDragging && evt.currentTarget.targetNeighbour==null) {
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
                                createjs.Tween.get(evt.currentTarget).to({ x: xx }, 50);

                                //identify right neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;


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
                                createjs.Tween.get(evt.currentTarget).to({ x: xx }, 100);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;

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
                                createjs.Tween.get(evt.currentTarget).to({ y: yy }, 50);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;



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
                                createjs.Tween.get(evt.currentTarget).to({ y: yy  }, 50);

                                //identify left neigbor and save it in the element property
                                evt.currentTarget.targetNeighbour = targetNeighbour;


                              
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
                   var targetCircle = evt.currentTarget.targetNeighbour;
                    
                       createjs.Tween.get(evt.currentTarget).to({ x: targetCircle.original_x, y: targetCircle.original_y }, 50);
                       var curi = evt.currentTarget.i;
                       var curj = evt.currentTarget.j;

                       evt.currentTarget.i = targetCircle.i;
                       evt.currentTarget.j = targetCircle.j;

                       targetCircle.i = curi;
                       targetCircle.j = curj;

                       gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;

                       gameData[targetCircle.i][targetCircle.j] = targetCircle;

                       if (scanTableForMatches()) {

                       mainBox.setChildIndex(targetCircle, mainBox.getNumChildren() - 1);
                       createjs.Tween.get(targetCircle).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 50);

                       var curx = evt.currentTarget.original_x; var cury = evt.currentTarget.original_y;
                       evt.currentTarget.original_x = targetCircle.original_x;
                       evt.currentTarget.original_y = targetCircle.original_y;

                       targetCircle.original_x = curx;
                       targetCircle.original_y = cury;

                       tableCompactTimeout = setTimeout(compactTable, 100);
                   }
                   else {
                           mainBox.setChildIndex(evt.currentTarget, mainBox.getNumChildren() - 1);
                           createjs.Tween.get(evt.currentTarget, { override: true }).to({ x: evt.currentTarget.original_x, y: evt.currentTarget.original_y }, 50);



                           curi = evt.currentTarget.i; var curj = evt.currentTarget.j;

                           evt.currentTarget.i = targetCircle.i; evt.currentTarget.j = targetCircle.j;
                           targetCircle.i = curi; targetCircle.j = curj;

                           gameData[evt.currentTarget.i][evt.currentTarget.j] = evt.currentTarget;

                           gameData[targetCircle.i][targetCircle.j] = targetCircle;

                   }
                    mouseDragPosition = null;
                    isDragging = false;
                    evt.currentTarget.targetNeighbour = null;
                    targetCircle.targetNeighbour = null;
                    
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

              var color = element.getChildByName("circle").color;


              while ((newI > -1) && (newI >= leftBoundary))
              {
                  var leftElement = gameData[newI][element.j];
                  if (color == leftElement.getChildByName("circle").color)
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
                  if (color == rightElement.getChildByName("circle").color) {
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
                  if (color == topElement.getChildByName("circle").color) {
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
                  if (color == bottomElement.getChildByName("circle").color) {
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
          function scanTableForMatches() {
              var matchesfound = false;
              //vertical 
              for (var i = 0; i < 10; i++) {
                  for (var j = 0; j < 10; j++) {
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


                     /* if (matches.verMatchArr.length > 3) {
                          for (var x = 0; x < matches.verMatchArr.length ; x++) {
                              alert("50 Extra ponits to you ");
                              gameCounter = gameCounter +  10;

                          }
                      } else {

                          if (matches.horMatchArr.length > 3) {
                              for (var x = 0; x < matches.horMatchArr.length; x++) {
                                  alert("50 Extra ponits to you ");
                                  gameCounter = gameCounter + 10;
                              }
                          }
                      }*/

                   
                  }
              }
              return matchesfound;
          }
          
          function scanAndCompactTable() {

              if (scanTableForMatches())
                    compactTable();
          }
         //this function removes matches and generates new circles
          function compactTable() {
              var changed = false;
              
              for (var i = 0; i < 10; i++) {
                  for (var j = 9; j >= 0; j--) {

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
                              gameData[i][j] = createElement(i, j, xx, 0);
                              gameData[i][j].original_y = yy;

                              mainBox.addChild(gameData[i][j]);
                              var el = gameData[i][j];
                              createjs.Tween.get(el, { override: true }).to({ y: yy }, 50);//, createjs.Ease.bounceOut).call);
                          }
                          else {
                              var topCircle = gameData[i][k];
                              var yy1 = topCircle.y;

                              createjs.Tween.get(topCircle, { override: true }).to({ y: yy }, 50);

                              topCircle.j = j;
 
                              topCircle.original_y = yy;


                              gameData[i][k] = createElement(i, k, xx, yy1);
                              gameData[i][k].getChildByName('label').text = 'F';
                              gameData[i][k].isEmpty = true;

                              mainBox.addChild(gameData[i][k]);
                              
                              mainBox.removeChild(gameData[i][j]);
                              gameData[i][j] = topCircle;

                              mainBox.addChild(gameData[i][j]);

                              gameCounter++;
                              userScoreContainer.getChildByName('score').text = gameCounter;
                              
                          }

                      }
                     
                  }
                 
              }
              if (changed)
                  tableCompactTimeout = setTimeout(scanAndCompactTable, 100);
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

               ///
                return container;
            }

           /* function createFindMatchButton() {

                //library container
                var container = new createjs.Container();

                //library background
                var background = new createjs.Shape();
                background.graphics.setStrokeStyle(1).beginStroke("black").beginFill("grey");
                background.graphics.drawRect(0, 0, 100, 80);
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
                background.graphics.drawRect(0, 0, 100, 80);
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
            */
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


