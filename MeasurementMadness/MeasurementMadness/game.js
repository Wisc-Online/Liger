/// <reference path="createjs.min.js" />
var Game = Game || (function (createjs) {


    function Game(canvas, gameData) {
		// this is our constructor to the game
		var self = this;
		
		var stage = new createjs.Stage(canvas);
		 stage.enableMouseOver(10);
		var currentPage = null;
		
		createjs.Ticker.setFPS(40);
		createjs.Ticker.addEventListener("tick", handleTick);
		function handleTick() { 
		stage.update();
		}
		
		var settings = {
			ruler:{
				pixelsPerDivision: 5,
				divisionsPerInch: 32,
				divisionsPerCentimenter: 10
			}
		}
		
		
		function showPage(page){
			
			if (currentPage != null){
				var pageToRemove = currentPage;
				createjs.Tween.get(currentPage).to({alpha: 0}, 250).call(function(){
					stage.removeChild(pageToRemove);	
				});
			}
			
			currentPage = page;
			
			if (currentPage != null){
				currentPage.alpha = 0;
				
				stage.addChild(currentPage);
				
				createjs.Tween.get(currentPage).to({alpha: 1}, 250);
			}
		}
     
	  
	  
		function createIntroductionPage(){
			
			var page = new createjs.Container();
			
			var circle = new createjs.Shape();
			circle.graphics.beginFill("red").drawCircle(0, 0, 50);
			circle.x = 100;
			circle.y = 100;
			page.addChild(circle);
			// do the stuff on the page, setup click handlers, etc...
			
			
			circle.addEventListener("click", function(){
				showPage(createGamePage());
			});
			
			return page;
		}
		
		function createGamePage(){
			
			var page = new createjs.Container();
			var rulerLength = 6.25;
			var ruler = createRuler(rulerLength);
			
			var rulerWidthPixels = rulerLength * settings.ruler.pixelsPerDivision * settings.ruler.divisionsPerInch;
			
			var targetRulerWidthOfCanvasPercent = 1.0;
			
			
			ruler.x = 0;
			ruler.y = 100;
			
			ruler.scaleX = targetRulerWidthOfCanvasPercent * (stage.canvas.width / rulerWidthPixels)
			
			page.addChild(ruler);
			// do the stuff on the page, setup click handlers, etc...
			
			return page;
		}
		
		function createRuler(lengthInInches){
			var ruler = new createjs.Container();
			
			var pixelsPerDivision = settings.ruler.pixelsPerDivision;

			var totalDivisions = settings.ruler.divisionsPerInch * (lengthInInches);
			
			var cmPerInch = 2.54;
			
			var rectangle =  new createjs.Shape();
			var rulerHeight = 200;
			rectangle.graphics.beginStroke("black").beginFill("white").drawRect(0, 0, totalDivisions * pixelsPerDivision, rulerHeight);

			ruler.addChild(rectangle);
			
			var divisionContainer;
			var backgroundOfDivision;
			
			var division, divisionHeight, numberText;
			//Paint Standard Ruler
			for(var i = 0; i < totalDivisions; ++i){
				
				divisionContainer = new createjs.Container();
				divisionContainer.value = i * (1 / settings.ruler.divisionsPerInch);

				backgroundOfDivision = new createjs.Shape();
				
				division = new createjs.Shape();				
				division.x = i * pixelsPerDivision
				division.graphics.setStrokeStyle(0.5).beginStroke("black");
				
				if (i % 32 == 0){
					// make big line
					divisionHeight = 70;
					
					if (i > 0)
					{
						var numberText = new createjs.Text( (i / 32).toString(), "32px Arial", "black");
						
						numberText.x = division.x;
						numberText.y = divisionHeight;
						numberText.textAlign = "center";

						divisionContainer.addChild(numberText);
					}
					
				}
				else if (i % 8 == 0){
					// make 1/4 inch line
					divisionHeight = 60;
				}
				else if (i % 4 == 0){
					// make 1/8 inch line
					divisionHeight = 45;
				}
				else if (i % 2 == 0){
					// make 1/16 inch line
					divisionHeight = 30;
				}
				else{
					// make 1/32 inch line
					divisionHeight = 15;
					
				}
				backgroundOfDivision.graphics.setStrokeStyle(0.5).beginStroke("Green").beginFill("Green");
				backgroundOfDivision.alpha = 0.0;
				backgroundOfDivision.graphics.drawRect(-pixelsPerDivision / 2, 0, pixelsPerDivision, divisionHeight).endStroke();
				backgroundOfDivision.x = i*pixelsPerDivision;
				
				division.graphics.drawRect(0, 0, 0, divisionHeight).endStroke();
				divisionContainer.divisionHeight = divisionHeight;
				divisionContainer.division = division;
				divisionContainer.backgroundOfDivision = backgroundOfDivision;
				
				divisionContainer.addChild(backgroundOfDivision);
				divisionContainer.addEventListener("rollover", function(e){
						createjs.Tween.get(e.currentTarget.backgroundOfDivision).to({alpha:1.0},500);
				});
				divisionContainer.addEventListener("rollout",function(e){
					createjs.Tween.get(e.currentTarget.backgroundOfDivision, {override:true}).to({alpha:0.0},250);
				});
				divisionContainer.addEventListener("mousedown", function(e){
				
					alert("Clicked Value: " + e.currentTarget.value.toString());
				//Check if its correct
					
				});
				
				divisionContainer.addChild(division);
				ruler.addChild(divisionContainer);
			}
			
		
			
			//set up metric ruler
			var mmPixelsPerDivision =(pixelsPerDivision * settings.ruler.divisionsPerInch)/25.4
			var mmLengthInches = 0;
			var mmInches = 0.0254;
			
			
			//Paint Metric Ruler
			
			for(var m = 0;mmLengthInches <= lengthInInches ; ++m){
				mmDivision = new createjs.Shape();
				divisionContainer = new createjs.Container();
				divisionContainer.y = rulerHeight;
				divisionContainer.x =  m * mmPixelsPerDivision;
				
				
				
				mmDivision.graphics.setStrokeStyle(0.5).beginStroke("Black");
				
				
				if(m %10 ==0){
					//make big line
					divisionHeight = 45;
					
					if (m > 0)
					{
						var mmNumberText = new createjs.Text( (m).toString(), "32px Arial", "black");
						mmNumberText.textAlign = "center";
						mmNumberText.y = -divisionHeight - 30;
						
						divisionContainer.addChild(mmNumberText);
					
					}
				}
				else{
				//make small line
				divisionHeight = 25;
				}
				
				backgroundOfDivision = new createjs.Shape();
				backgroundOfDivision.graphics.setStrokeStyle(0.5).beginStroke("Green").beginFill("Green");
				backgroundOfDivision.alpha = 0.0;
				backgroundOfDivision.graphics.drawRect(-mmPixelsPerDivision / 2, 0, mmPixelsPerDivision, -divisionHeight).endStroke();
				
				//backgroundOfDivision.x = m * mmPixelsPerDivision;
				

				backgroundOfDivision.textAlign = "center";
				
				
				divisionContainer.backgroundOfDivision = backgroundOfDivision;
				
				divisionContainer.addChild(backgroundOfDivision);
				
				mmDivision.graphics.drawRect(0, 0, 0, -divisionHeight).endStroke();
				
				divisionContainer.x = m * mmPixelsPerDivision
				divisionContainer.y = 200;
				
				divisionContainer.divisionHeight = -divisionHeight;
				divisionContainer.mmDivision = mmDivision;
				
				divisionContainer.addChild(mmDivision);
				
				divisionContainer.addEventListener("rollover", function(e){
						createjs.Tween.get(e.currentTarget.backgroundOfDivision).to({alpha:1.0},500);
				});
				divisionContainer.addEventListener("rollout",function(e){
					
					createjs.Tween.get(e.currentTarget.backgroundOfDivision, {override:true}).to({alpha:0.0},250);
				});
				divisionContainer.addEventListener("mousedown", function(e){
				
				//Check if its correct
					
				});
				
				ruler.addChild(divisionContainer);
				
				mmLengthInches += mmInches;
			}
			
			
			
			
			return ruler;
		}
		
		
	  
		self.start = function(){
			var introPage = createIntroductionPage();
			
			showPage(introPage);
		}
	  
    }
	
	
    return Game;
})(createjs);



