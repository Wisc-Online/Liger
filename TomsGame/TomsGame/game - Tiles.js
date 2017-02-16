
window.onload = function ()
 {
    function getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    }

    var colors = ["DarkRed", "Red", "Green", "LightGreen", "DarkBlue", "Blue", "yellow", "Orange", "Purple" ,"Teal", "Gray", "Black", "Silver", "Violet"];

    function createTileArea() {
        var theCanvas = document.getElementById("myCanvas");
        var stage = new createjs.Stage(theCanvas);
        stage.name = "stage";
        var size = 200;

        for (row = 0; row < 10; row++) {
            for (col = 0; col < 10; col++) {
                var id = row + "_" + col;
                var color = colors[getRandomNumber(14)];

                var tile = new createjs.Shape();
                tile.graphics.beginStroke('#000');
                tile.graphics.beginFill(color);
                tile.graphics.drawRoundRect(0, 0, size, size, 10);
                // tile.graphics.drawRect(0, 0, size, size);
                tile.shadow = new createjs.Shadow("#111111", 1, 1, 10);
                                          
                tile.graphics.endFill();
                tile.x = col * size;
                tile.y = row * size;               
                tile.height = size;
                tile.width = size;
                tile.name = id;                          
                tile.snapToPixel = true;
             
                stage.addChild(tile);
            }
        }

        stage.update();
    }

    createTileArea();
};