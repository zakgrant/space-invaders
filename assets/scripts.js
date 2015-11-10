(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game, PostGame, PreGame, SpaceShooterGame, game;

PreGame = require('./pregame');

PostGame = require('./postgame');

Game = require('./game');

module.exports = SpaceShooterGame = (function() {
  function SpaceShooterGame() {
    this.game = new Phaser.Game(451, 750, Phaser.AUTO);
    this.registerStates();
  }

  SpaceShooterGame.prototype.registerStates = function() {
    this.game.state.add('preGame', new PreGame(this.game), true);
    this.game.state.add('game', new Game(this.game));
    return this.game.state.add('postGame', new PostGame(this.game));
  };

  return SpaceShooterGame;

})();

game = new SpaceShooterGame();


},{"./game":3,"./postgame":4,"./pregame":5}],2:[function(require,module,exports){
var FPS;

module.exports = FPS = (function() {
  function FPS(game) {
    this.game = game;
    this.fpsText = null;
    this.create();
  }

  FPS.prototype.create = function() {
    return this.fpsText = this.game.add.text(0, 0, "0", {
      fontSize: '16px',
      fill: 'white',
      stroke: "black",
      strokeThickness: 5
    });
  };

  FPS.prototype.update = function() {
    return this.fpsText.content = this.game.time.fps.toString();
  };

  return FPS;

})();


},{}],3:[function(require,module,exports){
var FPS, Game;

FPS = require('./fps');

module.exports = Game = (function() {
  function Game(game) {
    this.game = game;
  }

  Game.prototype.preload = function() {
    this.game.load.image('bg', 'assets/background.png');
    this.game.load.image('player', 'assets/player-ship.png');
    this.game.load.image('enemy1', 'assets/enemy-green.png');
    this.game.load.image('enemy2', 'assets/enemy-red.png');
    this.game.load.image('enemy3', 'assets/enemy-yellow.png');
    this.game.load.image('powerUp', 'assets/star-gold.png');
    return this.game.load.image('laser', 'assets/laser-green.png');
  };

  Game.prototype.create = function() {
    this.playerVelocity = 400;
    this.laserVelocity = 500;
    this.enemyVelocity = 100;
    this.baseEnemyVelocity = 100;
    this.cursor = null;
    this.lives = 3;
    this.score = 0;
    this.timeBetweenLaserBeams = 200;
    this.laserDelta = 0;
    this.averageEnemySpawnTime = 600;
    this.enemyDelta = 0;
    this.powerUpDelta = 0;
    this.powerUpSpawnTime = 8000;
    this.powerUpVelocity = 100;
    this.powerUpTime = 5000;
    this.poweredUpDelta = 0;
    this.background = this.game.add.sprite(0, 0, 'bg');
    this.createPlayer();
    this.createLasers();
    this.createPowerUps();
    this.createEnemies();
    this.createScoreText();
    this.createLivesText();
    this.cursor = this.game.input.keyboard.createCursorKeys();
    return this.startTime = this.game.time.now;
  };

  Game.prototype.update = function() {
    this.player.body.velocity.x = 0;
    if (this.cursor.left.isDown) {
      this.player.body.velocity.x = -this.playerVelocity;
    } else if (this.cursor.right.isDown) {
      this.player.body.velocity.x = this.playerVelocity;
    }
    if (this.cursor.up.isDown) {
      this.fire();
    }
    this.updateEnemySpeed();
    this.spawnEnemy();
    this.spawnPowerUps();
    this.updateScoreText();
    this.updateLivesText();
    this.game.physics.overlap(this.player, this.enemies, this.playerHit, null, this);
    this.game.physics.overlap(this.lasers, this.enemies, this.enemyHit, null, this);
    this.game.physics.overlap(this.lasers, this.powerUps, this.powerUpHit, null, this);
    return this.game.physics.overlap(this.player, this.powerUps, this.powerUpPlayer, null, this);
  };

  Game.prototype.createPlayer = function() {
    this.player = this.game.add.sprite(0, 0, 'player');
    this.player.body.collideWorldBounds = true;
    this.player.y = (this.game.height - this.player.height) - 20;
    return this.player.x = this.game.width / 2 - this.player.width / 2;
  };

  Game.prototype.createLasers = function() {
    this.lasers = this.game.add.group();
    this.lasers.createMultiple(40, 'laser');
    return this.lasers.setAll('outOfBoundsKill', true);
  };

  Game.prototype.createEnemies = function() {
    this.enemies = this.game.add.group();
    this.enemies.createMultiple(25, 'enemy1');
    this.enemies.setAll('outOfBoundsKill', true);
    this.enemies.setAll('scale.x', 0.5);
    return this.enemies.setAll('scale.y', 0.5);
  };

  Game.prototype.createPowerUps = function() {
    this.powerUps = this.game.add.group();
    this.powerUps.createMultiple(5, 'powerUp');
    return this.powerUps.setAll('outOfBoundsKill', true);
  };

  Game.prototype.fire = function() {
    var bounce;
    if (this.game.time.now > this.laserDelta) {
      this.spawnOneLaserBeam();
      this.laserDelta = this.game.time.now + this.timeBetweenLaserBeams;
      bounce = this.game.add.tween(this.player);
      return bounce.to({
        y: this.player.y + 5
      }, 80, Phaser.Easing.Bounce.None).to({
        y: this.player.y
      }, 80, Phaser.Easing.Bounce.None).start();
    }
  };

  Game.prototype.spawnOneLaserBeam = function() {
    var laser, laser1, laser2;
    if (this.isPoweredUp) {
      laser1 = this.lasers.getFirstExists(false);
      laser1.reset(this.player.x, this.player.y);
      laser1.body.velocity.y = -this.laserVelocity;
      laser2 = this.lasers.getFirstExists(false);
      laser2.reset(this.player.x + this.player.width, this.player.y);
      laser2.body.velocity.y = -this.laserVelocity;
      if (this.game.time.now > this.poweredUpDelta) {
        return this.isPoweredUp = false;
      }
    } else {
      laser = this.lasers.getFirstExists(false);
      laser.reset(this.player.x + (this.player.width / 2 - 3), this.player.y);
      return laser.body.velocity.y = -this.laserVelocity;
    }
  };

  Game.prototype.spawnEnemy = function() {
    if (this.game.time.now > this.enemyDelta) {
      this.spawnOneEnemy();
      return this.enemyDelta = this.game.time.now + this.enemySpawnTime();
    }
  };

  Game.prototype.spawnPowerUps = function() {
    if (this.game.time.now > this.powerUpDelta) {
      this.spawnOnePowerUp();
      return this.powerUpDelta = this.game.time.now + this.powerUpSpawnTime;
    }
  };

  Game.prototype.spawnOnePowerUp = function() {
    var powerUp;
    powerUp = this.powerUps.getFirstExists(false);
    powerUp.reset(this.game.rnd.realInRange(powerUp.width, this.game.world.width - powerUp.width), -powerUp.width);
    return powerUp.body.velocity.y += this.powerUpVelocity;
  };

  Game.prototype.createScoreText = function() {
    return this.scoreText = this.game.add.text(20, 20, this.score, {
      fontSize: '14px',
      fill: 'white'
    });
  };

  Game.prototype.createLivesText = function() {
    this.livesText = this.game.add.text(0, 0, this.lives, {
      fontSize: '14px',
      fill: 'white'
    });
    this.livesText.anchor = new Phaser.Point(1, 0);
    this.livesText.x = this.game.width - 20;
    return this.livesText.y = 20;
  };

  Game.prototype.enemySpawnTime = function() {
    var lower, spawnTimeRange, upper;
    spawnTimeRange = this.averageEnemySpawnTime * 0.2;
    upper = this.averageEnemySpawnTime + spawnTimeRange;
    lower = this.averageEnemySpawnTime - spawnTimeRange;
    return this.game.rnd.integerInRange(lower, upper);
  };

  Game.prototype.spawnOneEnemy = function() {
    var enemy;
    enemy = this.enemies.getFirstExists(false);
    enemy.reset(this.game.rnd.realInRange(enemy.width, this.game.world.width - enemy.width), -enemy.width);
    return enemy.body.velocity.y = +this.enemyVelocity;
  };

  Game.prototype.playerHit = function(player, enemy) {
    var bounce;
    enemy.kill();
    bounce = this.game.add.tween(this.player);
    bounce.to({
      alpha: 0.4
    }, 100, Phaser.Easing.Bounce.None).to({
      alpha: this.player.alpha
    }, 100, Phaser.Easing.Bounce.None).start();
    if (this.lives === 1) {
      this.player.kill();
      this.game.state.start('postGame', false);
    }
    return this.lives -= 1;
  };

  Game.prototype.enemyHit = function(laser, enemy) {
    laser.kill();
    enemy.kill();
    return this.score += 1;
  };

  Game.prototype.updateScoreText = function() {
    return this.scoreText.content = this.score;
  };

  Game.prototype.updateLivesText = function() {
    var f;
    this.livesText.content = this.lives;
    if (this.lives === 1) {
      f = this.livesText.font;
      f.fill = '#ff0000';
      return this.livesText.setStyle(f);
    }
  };

  Game.prototype.updateEnemySpeed = function() {
    var velocityAddOn;
    velocityAddOn = (this.game.time.now - this.startTime) / 1000;
    return this.enemyVelocity = this.baseEnemyVelocity + velocityAddOn;
  };

  Game.prototype.powerUpHit = function(laser, powerUp) {
    laser.kill();
    return powerUp.kill();
  };

  Game.prototype.powerUpPlayer = function(player, powerUp) {
    powerUp.kill();
    this.score = +10;
    this.isPoweredUp = true;
    return this.poweredUpDelta = this.game.time.now + this.powerUpTime;
  };

  return Game;

})();


},{"./fps":2}],4:[function(require,module,exports){
var PostGame;

module.exports = PostGame = (function() {
  function PostGame(game) {
    game = this.game;
  }

  PostGame.prototype.create = function() {
    this.gameOverText = this.game.add.text(0, 0, "GAME OVER", {
      font: 'bold 40px Arial',
      fill: 'white'
    });
    this.gameOverText.x = Math.floor(this.game.world.width / 2 - this.gameOverText.width / 2);
    this.gameOverText.y = Math.floor(this.game.world.height / 2 - this.gameOverText.height / 2);
    this.pressUpText = this.game.add.text(0, 0, "Press UP to try again", {
      font: 'normal 20px Arial',
      fill: 'white'
    });
    this.pressUpText.x = Math.floor(this.game.world.width / 2 - this.pressUpText.width / 2);
    this.pressUpText.y = Math.floor((this.game.world.height / 2 - this.pressUpText.height / 2) + 40);
    return this.cursor = this.game.input.keyboard.createCursorKeys();
  };

  PostGame.prototype.update = function() {
    if (this.cursor.up.isDown) {
      return this.game.state.start('game', true, true);
    }
  };

  return PostGame;

})();


},{}],5:[function(require,module,exports){
var PreGame;

module.exports = PreGame = (function() {
  function PreGame(game) {
    game = this.game;
  }

  PreGame.prototype.preload = function() {
    return this.game.load.image('bg', 'assets/background.png');
  };

  PreGame.prototype.create = function() {
    this.background = this.game.add.sprite(0, 0, 'bg');
    this.gameOverText = this.game.add.text(0, 0, "Space Shooter", {
      font: 'bold 40px Arial',
      fill: 'white'
    });
    this.gameOverText.x = Math.floor(this.game.world.width / 2 - this.gameOverText.width / 2);
    this.gameOverText.y = Math.floor(this.game.world.height / 2 - this.gameOverText.height / 2);
    this.pressUpText = this.game.add.text(0, 0, "Press UP to play", {
      font: 'normal 20px Arial',
      fill: 'white'
    });
    this.pressUpText.x = Math.floor(this.game.world.width / 2 - this.pressUpText.width / 2);
    this.pressUpText.y = Math.floor((this.game.world.height / 2 - this.pressUpText.height / 2) + 40);
    return this.cursor = this.game.input.keyboard.createCursorKeys();
  };

  PreGame.prototype.update = function() {
    if (this.cursor.up.isDown) {
      return this.game.state.start('game', true, true);
    }
  };

  return PreGame;

})();


},{}]},{},[1])
