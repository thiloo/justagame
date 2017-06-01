var barrierSpeed = 280;
var savedbarrierSpeed = 280;
var gameoverscreen = function(game){};
gameoverscreen.prototype = {
create: function(){
    barrierSpeed = savedbarrierSpeed;
	var titleBG = game.add.tileSprite(0, 0, game.width, game.height, "backsplash");
	titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
	game.add.bitmapText(game.width / 2, 50 , "font", "Your score", 48).anchor.x = 0.5;
	game.add.bitmapText(game.width / 2, 150 , "font", score.toString(), 72).anchor.x = 0.5;
	var playButton = game.add.button(game.width / 2, game.height - 150, "playbutton", this.startGame);
	playButton.anchor.set(0.5);
	var tween = game.add.tween(playButton).to({
		width: 220,
		height:220
	}, 1500, "Linear", true, 0, -1);
	tween.yoyo(true);
	},
	startGame: function(){
		game.state.start("PlayGame");
	}
}
