var titlescreen = function(game){};
titlescreen.prototype = {
	create: function(){
        var titleBG = game.add.tileSprite(0, 0, game.width, game.height, "backsplash");
        titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
		var title = game.add.image(game.width / 2, 25, "title");
		title.anchor.set(0.5,0);
		var playButton = game.add.button(game.width / 2, game.height - 150, "playbutton", this.startGame);
		playButton.anchor.set(0.5);
        var tween = game.add.tween(playButton).to({
			width: 220,
			height:220
		}, 1500, "Linear", true, 0, -1);
		tween.yoyo(true);
		console.log("titlescreen started");
	},
	startGame: function(){
		this.game.state.start("PlayGame");
	}
}
