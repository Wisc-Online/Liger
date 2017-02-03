var Game = Game || (function (createjs, $) {

    function Game(canvasId, gameData) {

        //var assetsPath = gameData.assetsPath || "";
        gameData = gameData || {};
        var self = this;
        var mouseBp;
        var stage = new createjs.Stage(canvasId);

        stage.enableMouseOver(10);
        var fps = 60;
        var tickCount = 0;
        var currentArea = null;

        var xCord = 0;
        var yCord = 0;
        var colors = ["pink", "blue", "red", "orange"];
        
        for (x = 0; x < 10;x++)
        {
            for (y = 0; y < 10; y++)
            {
                var randomNum = Math.floor((Math.random() * 4) + 0);
                var circle = new createjs.Shape();
                circle.graphics.beginFill(colors[randomNum]).drawCircle(xCord,yCord, 10);
                circle.x =  xCord;
                circle.y =  yCord;
                stage.addChild(circle);
                yCord += 10;
            }
            yCord = 0;
            xCord += 10;
            stage.update();
        }
      
        
    }
    return Game;
})(createjs, $);