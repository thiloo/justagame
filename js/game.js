var game;
var bgColors = [0xF16745, 0xFFC65D, 0x7BC8A4, 0x4CC3D9, 0x93648D, 0x7c786a, 0x588c73, 0x8c4646, 0x2a5b84, 0x73503c];

window.onload = function() {
    game = new Phaser.Game(640, 960);
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    game.state.add("TitleScreen", titlescreen);
    game.state.add("PlayGame", playgame);
    game.state.start("Boot");
};

var boot = function(game) {};
boot.prototype = {
    preload: function() {
        this.game.load.image("loading", "assets/sprites/loading.png");
    },
    create: function() {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.state.start("Preload");
    }
};
