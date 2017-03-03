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

            //declare each individual asset
            var assets = [

                { id: "start_button", src: assetsPath + "SequencePlayButton.png" },
                 { id: "background", src: assetsPath + "background.jpg" },
                   { id: "panel", src: assetsPath + "Panel.png" },
                   { id: "playbutton", src: assetsPath + "SequencePlayButton.png" }
            ];

            var queue = new createjs.LoadQueue(false);
            queue.installPlugin(createjs.Sound);
            queue.addEventListener("complete", function (event) {
                //Paint board
                addBackground();
            });
            queue.loadManifest(assets);

            //loads background image
            function addBackground() {
                var gameBackground = new createjs.Container();
                gameBackground.x = 0;
                gameBackground.y = 0;
                var bgimage = new createjs.Bitmap(queue.getResult("background"))
                gameBackground.addChild(bgimage)

                self.stage.addChild(gameBackground);
                introductionScreen();

            }
            //load introduction screen /play button
            function introductionScreen() {
                
                var instructionsScreen = new createjs.Container();
               
                titleText = new createjs.Text(gameData.Title, "24px Alegreya", "#FFFFFF");
                titleText.X = 100;
                titleText.y = 75;
                titleText.lineWidth = 600;
                   
                var panelBG = new createjs.Bitmap(queue.getResult("panel"));
                panelBG.x = 50;
                panelBG.y = 60;

                var playButton = new createjs.Bitmap(queue.getResult("playbutton"))
                
                playButton.regX = 97;
                playButton.regY = 100;
                playButton.x = 650;
                playButton.y = 350;
                playButton.scaleX = playButton.scaleY = 0.20;

               // var directionsScreen = new createjs.Container();

                instructionsScreen.addChild(panelBG, playButton, titleText);
                createjs.Tween.get(playButton, { loop: false }).to({ rotation: 360, scaleX: .4, scaleY: .4 }, 2000)

             

                self.stage.addChild(instructionsScreen)



              

                //instructionScreen.addEventListener("click", handleClick);
                //function handleClick(event) {
                //    //console.log("clicked it);
                //    self.stage.addChild(indtroductionScreen, instructionsScreen, titleText, panelBG, playButton)


                //    StartInteraction();
                //};

            }




            function StartInteraction() {
                // load enemies load players load 


                function deliverQuestions() {

                }

                function deliverAnswers() {

                }

            }

            function gameOverScreen() {

            }

            function DisplayEndingNotes(EndedHow) {
                replayContainer.addEventListener("click", handleClick);
                function handleClick(event) {
                    StartitALL()
                }
            }


            //this updates the stage every tick not sure if we need it but
            createjs.Ticker.addEventListener("tick", handleTick);
            createjs.Ticker.on("tick", handleTick);
            createjs.Ticker.setFPS(30);

            function handleTick(event) {
                self.stage.update();

            }

        }
    }
    return Game;
})(createjs);

