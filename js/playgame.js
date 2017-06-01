var tunnelWidth = 256;
var shipHorizontalSpeed = 100;
var shipMoveDelay = 0;
var swipeDistance = 10;
var barrierSpeed = 280;
var barrierGap = 120;
var shipInvisibilityTime = 1000;
var barrierIncreaseSpeed = 1.1;
var shipVerticalSpeed = 15000;
var scoreHeight = 100;
var scoreSegments = [
    100,
    50,
    25,
    10,
    5,
    2,
    1
];
var score;
var friendlyBarRatio = 2;

var playgame = function(game) {};
playgame.prototype = {
    create: function() {
        this.bgMusic = game.add.audio("bgmusic");
        this.bgMusic.loopFull(1);
        var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
        score = 0;
        this.scoreText = game.add.bitmapText(20, game.height - 90, "font", "0", 48);
        game.time.events.loop(250, this.updateScore, this);
        var tunnelBG = game.add.tileSprite(0, 0, game.width, game.height, "tunnelbg");
        tunnelBG.tint = tintColor;
        var leftWallBG = game.add.tileSprite(-tunnelWidth / 2, 0, game.width / 2, game.height, "wall");
        leftWallBG.tint = tintColor;
        var rightWallBG = game.add.tileSprite((game.width + tunnelWidth) / 2, 0, game.width / 2, game.height, "wall");
        rightWallBG.tint = tintColor;
        for (var i = 1; i <= scoreSegments.length; i++) {
            var leftSeparator = game.add.sprite((game.width - tunnelWidth) / 2, scoreHeight * i, "separator");
            leftSeparator.tint = tintColor;
            leftSeparator.anchor.set(1, 0)
            var rightSeparator = game.add.sprite((game.width + tunnelWidth) / 2, scoreHeight * i, "separator");
            rightSeparator.tint = tintColor;
            var posX = (game.width - tunnelWidth) / 2 - leftSeparator.width / 2;
            if (i % 2 == 0) {
                posX = (game.width + tunnelWidth) / 2 + leftSeparator.width / 2;
            }
            game.add.bitmapText(posX, scoreHeight * (i - 1) + scoreHeight / 2 - 18, "font", scoreSegments[i - 1].toString(), 36).anchor.x = 0.5;
        }
        this.shipPositions = [
            (game.width - tunnelWidth) / 2 + 32,
            (game.width + tunnelWidth) / 2 - 32
        ];
        this.ship = game.add.sprite(this.shipPositions[0], 860, "ship");
        this.ship.side = 0;
        this.ship.anchor.set(0.5);
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.canMove = true;
        this.ship.canSwipe = false;
        this.ship.destroyed = false;
        this.ship.anchor.set(0.5);
        game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        game.input.onDown.add(this.moveShip, this);
        game.input.onUp.add(function() {
            this.ship.canSwipe = false;
        }, this);
        game.input.onDown.add(this.moveShip, this);
        this.smokeEmitter = game.add.emitter(this.ship.x, this.ship.y + 10, 20);
        this.smokeEmitter.makeParticles("smoke");
        this.smokeEmitter.setXSpeed(-15, 15);
        this.smokeEmitter.setYSpeed(50, 150);
        this.smokeEmitter.setAlpha(0.5, 1);
        this.smokeEmitter.start(false, 1000, 40);
        this.barrierGroup = game.add.group();
        this.barrierGroup = game.add.group();
        this.addBarrier(this.barrierGroup, tintColor);
        this.highlightBar = game.add.tileSprite(game.width / 2, 0, tunnelWidth, scoreHeight, "smoke");
        this.highlightBar.anchor.set(0.5, 0);
        this.highlightBar.alpha = 0.1;
        this.highlightBar.visible = false;
        // var barrier = new Barrier(game, barrierSpeed, tintColor);
        // game.add.existing(barrier);
        // this.barrierGroup.add(barrier);
        console.log("playgame started");
    },
    moveShip: function() {
        this.ship.canSwipe = true;
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
            this.verticalTween = game.add.tween(this.ship).to({
                y: 0
            }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
            var ghostShip = game.add.sprite(this.ship.x, this.ship.y, "ship");
            ghostShip.alpha = 0.5;
            ghostShip.anchor.set(0.5);
            var ghostTween = game.add.tween(ghostShip).to({
                alpha: 0
            }, 350, Phaser.Easing.Linear.None, true);
            ghostTween.onComplete.add(function() {
                ghostShip.destroy();
            });
        }
    },
    update: function() {
        this.smokeEmitter.x = this.ship.x;
        this.smokeEmitter.y = this.ship.y;
        if (this.ship.canSwipe) {
            if (Phaser.Point.distance(game.input.activePointer.positionDown, game.input.activePointer.position) > swipeDistance) {
                this.restartShip();
            }
        }

        if (!this.ship.destroyed && this.ship.alpha == 1) {
            if (this.ship.y < scoreHeight * scoreSegments.length) {
                this.highlightBar.visible = true;
                var row = Math.floor(this.ship.y / scoreHeight);
                this.highlightBar.y = row * scoreHeight;
            }
            game.physics.arcade.collide(this.ship, this.barrierGroup, function(s, b) {
                if (!b.friendly) {
                    this.ship.destroyed = true
                    this.smokeEmitter.destroy();
                    var destroyTween = game.add.tween(this.ship).to({
                        x: this.ship.x + game.rnd.between(-100, 100),
                        y: this.ship.y - 100,
                        rotation: 10
                    }, 1000, Phaser.Easing.Linear.None, true);
                    destroyTween.onComplete.add(function() {
                        this.bgMusic.stop();
                        var explosionSound = game.add.audio("explosion");
                        explosionSound.play();
                        var explosionEmitter = game.add.emitter(this.ship.x, this.ship.y, 200);
                        explosionEmitter.makeParticles("smoke");
                        explosionEmitter.setAlpha(0.5, 1);
                        explosionEmitter.minParticleScale = 0.5;
                        explosionEmitter.maxParticleScale = 2;
                        explosionEmitter.start(true, 2000, null, 200);
                        this.ship.destroy();
                        game.time.events.add(Phaser.Timer.SECOND * 2, function() {
                            game.state.start("GameOverScreen");
                        });
                    }, this);
                } else {
                    console.log('hi')
                    if (b.alpha == 1) {
                        var barrierTween = game.add.tween(b).to({
                            alpha: 0
                        }, 200, Phaser.Easing.Bounce.Out, true);
                        if (this.ship.y < scoreHeight * scoreSegments.length) {
                            var row = Math.floor(this.ship.y / scoreHeight);
                            score += scoreSegments[row] * 5;
                            this.scoreText.text = score.toString();
                        }
                    }
                }
            }, null, this)
        }
    },
    restartShip: function() {
        this.highlightBar.visible = false;
        if (!this.ship.destroyed && this.ship.alpha == 1) {
            barrierSpeed *= barrierIncreaseSpeed;
            for (var i = 0; i < this.barrierGroup.length; i++) {
                this.barrierGroup.getChildAt(i).body.velocity.y = barrierSpeed;
            }
            console.log('hiiiii')
            this.ship.canSwipe = false;
            this.verticalTween.stop();
            this.ship.alpha = 0.5;
            this.verticalTween = game.add.tween(this.ship).to({
                y: 860
            }, 100, Phaser.Easing.Linear.None, true);
            this.verticalTween.onComplete.add(function() {
                this.verticalTween = game.add.tween(this.ship).to({
                    y: 0
                }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
                var alphaTween = game.add.tween(this.ship).to({
                    alpha: 1
                }, shipInvisibilityTime, Phaser.Easing.Bounce.In, true);
            }, this);
        }
    },
    addBarrier: function(group, tintColor) {
        var barrier = new Barrier(game, barrierSpeed, tintColor);
        game.add.existing(barrier);
        group.add(barrier);
    },
    updateScore: function() {
        if (this.ship.alpha == 1 && !this.ship.destroyed) {
            if (this.ship.y < scoreHeight * scoreSegments.length) {
                var row = Math.floor(this.ship.y / scoreHeight);
                score += scoreSegments[row];
                this.scoreText.text = score.toString();
            }
        }
    }
};

var Barrier = function(game, speed, tintColor) {
    var positions = [
        (game.width - tunnelWidth) / 2,
        (game.width + tunnelWidth) / 2
    ];
    var position = game.rnd.between(0, 1);
    Phaser.Sprite.call(this, game, positions[position], -100, "barrier");
    var cropRect = new Phaser.Rectangle(0, 0, tunnelWidth / 2, 24);
    this.crop(cropRect);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(position, 0.5);
    this.tint = tintColor;
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBarrier = true;
    this.anchor.set(position, 0.5);
    this.levelTint = tintColor;
    if (game.rnd.between(0, friendlyBarRatio) != 0) {
        this.tint = tintColor;
        this.friendly = false;
    } else {
        this.friendly = true;
    }
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBarrier = true;
};
Barrier.prototype = Object.create(Phaser.Sprite.prototype);
Barrier.prototype.constructor = Barrier;

Barrier.prototype.update = function() {
    if (this.placeBarrier && this.y > barrierGap) {
        this.placeBarrier = false;
        playgame.prototype.addBarrier(this.parent, this.levelTint);
    }
    if (this.y > game.height) {
        this.destroy();
    }
}
