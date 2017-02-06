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

        var board = prepareBoard();
        drawBoard(createjs, stage, board);

        //code swapping elements in array
        drawBoard(createjs, stage, board);
    }
    return Game;
})(createjs, $);

function prepareBoard() {
    var xCord = 10;
    var yCord = 10;
    var colors = ["pink", "blue", "red", "orange"];
    var board = [];

    for (x = 0; x < 10; x++) {
        board[x] = [];
        for (y = 0; y < 10; y++) {
            
            var randomNum = Math.floor((Math.random() * 4) + 0);
            var circle = { xCord: xCord, yCord: yCord, color: colors[randomNum] };
            board[x][y] = circle;
            yCord += 20;
        }

        yCord = 10;
        xCord += 20;

    }
    return board;
}

function drawBoard(createjs,stage,board)
{
   
    for (x = 0; x < 10; x++) {
        for (y = 0; y < 10; y++) {
            var circle = new createjs.Shape();
            circle.graphics.beginFill(board[x][y].color).drawCircle(board[x][y].xCord, board[x][y].yCord, 10);

            stage.addChild(circle);

        }
    }
    stage.update();
}

