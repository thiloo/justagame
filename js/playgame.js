var tunnelWidth = 256;
var shipHorizontalSpeed = 100;
var shipMoveDelay = 0;
var swipeDistance = 10;

var playgame = function(game) {};
playgame.prototype = {
    create: function() {
        var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)]
        var tunnelBG = game.add.tileSprite(0, 0, game.width, game.height, "tunnelbg");
        tunnelBG.tint = tintColor;
        var leftWallBG = game.add.tileSprite(-tunnelWidth / 2, 0, game.width / 2, game.height, "wall");
        leftWallBG.tint = tintColor;
        var rightWallBG = game.add.tileSprite((game.width + tunnelWidth) / 2, 0, game.width / 2, game.height, "wall");
        rightWallBG.tint = tintColor;
        this.shipPositions = [
            (game.width - tunnelWidth) / 2 + 32,
            (game.width + tunnelWidth) / 2 - 32
        ];
        this.ship = game.add.sprite(this.shipPositions[0], 860, "ship");
        this.ship.side = 0;
        this.ship.anchor.set(0.5);
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.canMove = true;
        game.input.onDown.add(this.moveShip, this);
        this.smokeEmitter = game.add.emitter(this.ship.x, this.ship.y + 10, 20);
        this.smokeEmitter.makeParticles("smoke");
        this.smokeEmitter.setXSpeed(-15, 15);
        this.smokeEmitter.setYSpeed(50, 150);
        this.smokeEmitter.setAlpha(0.5, 1);
        this.smokeEmitter.start(false, 1000, 40);
        console.log("playgame started");
    },
    moveShip: function() {
        if (this.ship.canMove) {
            this.ship.canMove = false;
            this.ship.side = 1 - this.ship.side;
            var horizontalTween = game.add.tween(this.ship).to({
                x: this.shipPositions[this.ship.side]
            }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
            horizontalTween.onComplete.add(function() {
                game.time.events.add(shipMoveDelay, function() {
                    this.ship.canMove = true;
                }, this);
            }, this);
        }
        var ghostShip = game.add.sprite(this.ship.x, this.ship.y, "ship");
        ghostShip.alpha = 0.5;
        ghostShip.anchor.set(0.5);
        var ghostTween = game.add.tween(ghostShip).to({
            alpha: 0
        }, 350, Phaser.Easing.Linear.None, true);
        ghostTween.onComplete.add(function() {
            ghostShip.destroy();
        });
    },
    update: function() {
        this.smokeEmitter.x = this.ship.x;
        this.smokeEmitter.y = this.ship.y;
    }
};
