
/// <reference path="//code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs) {
    //alert("Game starting");

    function Game(canvas, gameData) {
        StartitALL()
        function StartitALL() {

            var self = this;
            self.stage = new createjs.Stage(canvas);
            var stageBG = new createjs.Shape();
            stageBG.name = "stageBG";
            stageBG.graphics.setStrokeStyle(3).beginStroke("black").beginFill("silver").drawRect(0, 0, 800, 600).endStroke().endFill();
            self.stage.addChild(stageBG);
            createjs.Touch.enable(self.stage, false, true);
            self.stage.enableMouseOver(25);
            self.stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

            // ***********     Declare all assests and preload them. (declare the path) ************************
            var assetsPath = gameData.assetsPath || "";

            assetsPath += "Assets/"


            var QuestionsRandomized = [];

            for (var d = 0; d < gameData.Questions.length; d++) {
                gameData.Questions[d].OrderId = d;
            }

            function shuffle(array) {
                var currentIndex = array.length, temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);

                    usedQuestions.splice(0, 0, randomIndex);

                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                //alert("ran it")
                return array;
            }
            var resourceLoader = new createjs.LoadQueue(true);
            //declare each individual asset
            var assets = [

                { id: "background", src: assetsPath + "background2.jpg" },
                { id: "redgreen", src: assetsPath + "inksplat.png" }

            ];
            resourceLoader.loadManifest(assets);

            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                addBackground();
            });
            queue.loadManifest(assets);

            //declare vars for start of game

            var spriteSheet;
            //var redgreenXPos = 200;
            //var redgreenYPos = 200;
            var animation;

            //loads background image
            function addBackground() {
                var gameBackground = new createjs.Container();
                gameBackground.x = 0;
                gameBackground.y = 0;
                var bgimage = new createjs.Bitmap(queue.getResult("background"))
                gameBackground.addChild(bgimage)
                self.stage.addChild(gameBackground);
                StartInteraction();
            }


            function StartInteraction() {

                //var redGreen = new createjs.Container();
                //redGreen.x = 0;
                //redGreen.y = 0;
                //var redgreenimage = new createjs.Bitmap(queue.getResult("redgreen"))
                //redGreen.addChild(redgreenimage)
                //self.stage.addChild(redGreen);

                var spriteSun = new createjs.Container();

                var speed = .02;


                var data = {
                    images: [resourceLoader.getResult("redgreen")],
                    frames: {
                        width: 50,
                        height: 50,
                        frames: 2,
                    }
                    ,
                    animations: {
                        sunRotation: [0, 1, "sunRotation", speed],
                    },
                };

                var spriteSheet = new createjs.SpriteSheet(data);
                var sprite = new createjs.Sprite(spriteSheet, "sunRotation");
                spriteSun.addChild(sprite);
                self.stage.addChild(spriteSun);



                ////load redgreen
                //var spriteSheet = new createjs.SpriteSheet({
                //    "images": [queue.getResult('redgreen')],
                //    "frames": { "width": 100, "height": 100 },
                //    "animations": { "go": [0, 1] }
                //});
                //createRedGreen();
            }

            function createRedGreen() {
                //animation = new createjs.Sprite(spriteSheet, "go");
                //animation.regX = 100;
                //animation.regY = 100;
                //animation.x = redgreenXPos;
                //animation.y = redgreenYPos;
                //animation.gotoAndPlay("go");
                //self.stage.addChild(animation, 1);
            }
        }
    }
    function DisplayEndingNotes(EndedHow) {
        replayContainer.addEventListener("click", handleClick);
        function handleClick(event) {
            StartitALL()
        }
    }


    var fps = 45;

    //this updates the stage every tick not sure if we need it but
    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.on("tick", handleTick);
    createjs.Ticker.setFPS(fps);

    function handleTick(event) {

        self.stage.update();

    }
    return Game;
})(createjs);

