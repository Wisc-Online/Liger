
window.onload = function ()
 {
    function getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    }

    var colors = ["DarkRed", "Red", "Green", "LightGreen", "DarkBlue", "Blue", "yellow", "Orange", "Purple" ,"Teal", "Gray", "Black", "Silver"];

    function createTileArea() {
        var theCanvas = document.getElementById("myCanvas");
        var stage = new createjs.Stage(theCanvas);
        stage.name = "stage";
        var size = 200;

        for (row = 0; row < 10; row++) {
            for (col = 0; col < 10; col++) {
                var id = row + "_" + col;
                var color = colors[getRandomNumber(13)];

                var tile = new createjs.Shape();
                tile.graphics.beginStroke('#000');
                tile.graphics.beginFill(color);
                tile.graphics.drawRoundRect(0, 0, size, size, 10);
                // tile.graphics.drawRect(0, 0, size, size);
                tile.shadow = new createjs.Shadow("#111111", 1, 1, 10);
                
            
               
              //  var color = "white";
              //  var alpha = 1;
              //  var blurX = 32;
              //  var blurY = 32;
              //  var strength = 1;
              //  var quality = 1;
              //  var inner = false;
              //  var knockout = false;
              //  _glowFilter = new createjs.GlowFilter(color, alpha, blurX, blurY, strength, quality, inner, knockout);
              //  tile.filters = [_glowFilter];
                


               
                tile.graphics.endFill();
                tile.x = col * size;
                tile.y = row * size;               

                tile.height = size;
                tile.width = size;
                tile.name = id;

            //    var stageWidth = 640;
            //    var stageHeight = 480;
                tile.snapToPixel = true;
             
             //   tile.x = stageWidth / 2 - 200 - 0.5;
            //    tile.y = stageHeight / 2 - 150 - 0.5;
             //   tile.x = tile.x / 2 - 200 - 0.5;
            //    tile.y = tile.y / 2 - 150 - 0.5;

                stage.addChild(tile);
            }
        }

        stage.update();
    }

    createTileArea();
};