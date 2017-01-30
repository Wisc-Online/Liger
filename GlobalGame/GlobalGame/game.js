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

        var circle = new createjs.Shape();
        circle.graphics.beginFill("red").drawCircle(0, 0, 50);
        circle.x = 50;
        circle.y = 50;
        stage.addChild(circle);
        var circleBlue = new createjs.Shape();
        circleBlue.graphics.beginFill("blue").drawCircle(0, 0, 50);
        circleBlue.x = 50;
        circleBlue.y = 150;
        stage.addChild(circleBlue);
        stage.update();
        var circle = new createjs.Shape();
        circle.graphics.beginFill("green").drawCircle(0, 0, 50);
        circle.x = 50;
        circle.y = 250;
        stage.addChild(circle);
        var circleBlue = new createjs.Shape();
        circleBlue.graphics.beginFill("yellow").drawCircle(0, 0, 50);
        circleBlue.x = 50;
        circleBlue.y = 150;
        stage.addChild(circleBlue);
        stage.update();
        
    }
    return Game;
})(createjs, $);