var Game = Game || (function (createjs, $) {
    function Game(canvasId, gameData) {
        


        //var assetsPath = gameData.assetsPath || "";
        gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);

        stage.enableMouseOver(10);
        // stage.mouseMoveOutside = true;

        var fps = 60;
        var tickCount = 0;
        var currentArea = null;

        var board = prepareBoard(createjs);
        drawBoard(createjs, stage, board);
        createjs.Ticker.addEventListener("tick", stage);
        //code swapping elements in array
        //drawBoard(createjs, stage, board);


        
    }
    return Game;
})(createjs, $);

function prepareBoard(createjs) {
    var xCord = 20;
    var yCord = 20;
    var colors = ["pink", "blue", "red", "orange"];
    var board = [];

    for (x = 0; x < 10; x++) {
        board[x] = [];
        for (y = 0; y < 10; y++) {
            
            var randomNum = Math.floor((Math.random() * 4) + 0);
            //var circle = { xCord: xCord, yCord: yCord, color: colors[randomNum] };
            var circle = new createjs.Shape();
            circle.graphics.beginFill(colors[randomNum]).drawCircle(xCord, yCord, 20);


            circle.allowedOffset = { xLeft: xCord - 40, xRight: xCord + 40, yUp: yCord - 40, yDown: yCord + 40 }


            circle.on("mousedown", function (evt) {
                this.parent.addChild(this);
                this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
            });


            circle.on("pressmove", function (evt) {

                if ((evt.stageX + this.offset.x) >= this.allowedOffset.xLeft && (evt.stageX + this.offset.x) <= this.allowedOffset.xRight
                    && (evt.stageY + this.offset.y) >= this.allowedOffset.yUp && (evt.stageY + this.offset.y) <= this.allowedOffset.yDown)
                {
                    this.x = evt.stageX + this.offset.x;
                    this.y = evt.stageY + this.offset.y;
                }

            });
            board[x][y] = circle;
            yCord += 40;
        }

        yCord = 20;
        xCord += 40;

    }
    return board;
}

function drawBoard(createjs,stage,board)
{

    for (x = 0; x < 10; x++) {
        for (y = 0; y < 10; y++) {

            stage.addChild(board[x][y]);

        }
    }
    stage.update();
}

function handleInteraction(event) {
    event.target.alpha = (event.type == "mouseover") ? 0.5 : 1;
}