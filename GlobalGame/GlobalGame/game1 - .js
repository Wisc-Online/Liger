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
                yCord += 10;
                
                var dragger = new createjs.Container();
             //   dragger.x = dragger.y = 10;
                dragger.addChild(circle);
                stage.addChild(dragger);
                dragger.on("mousedown", function (evt) {
                    //a record on the offset between the mouse position and the container
                    // position. currentTarget will be the container that the event listener was added to:
                    evt.currentTarget.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
                });
                dragger.on("pressmove", function (evt) {
                    // Calculate the new X and Y based on the mouse new position plus the offset.
                    evt.currentTarget.x = evt.stageX + evt.currentTarget.offset.x;
                    evt.currentTarget.y = evt.stageY + evt.currentTarget.offset.y;

                });
            }
            //
            yCord = 0;
            xCord += 10;
            stage.update();
            createjs.Ticker.addEventListener("tick", stage);
        }
      
        
    }
    return Game;
})(createjs, $);