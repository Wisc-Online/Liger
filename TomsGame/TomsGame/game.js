
/// <reference path="createjs-2015.11.26.min.js" />
// JavaScript Document
window.onload = function () {

    // assume Game Data was created by an external builder being passed into this script
    var theCanvas = document.getElementById("myCanvas");
    var stage = new createjs.Stage(theCanvas);

    //set ticker 
    createjs.Ticker.setFPS(60);

    function handleTick() {
        stage.update();
    }

    createjs.Ticker.on("tick", handleTick)

    //container for stage objects
    function initialize() {

        //create game objects
        var mainBox;

        // Main game box
        mainBox = new createjs.Shape();
        mainBox.x = 120;
        mainBox.y = 25;
        mainBox.graphics.setStrokeStyle(1).beginStroke("black").beginFill("darkgrey");
        mainBox.graphics.drawRect(25, 0, 500, 540);


        // adding elements to stage
        stage.addChild(mainBox);

    }

    //reset button functionality
    function reset() {

        stage.removeAllChildren();
        initialize();

    }

    initialize();
}