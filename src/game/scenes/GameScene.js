import Phaser from 'phaser';
import {
    useViewStore
} from '/viewStore.js';
import app from "@/App.vue";


// ak localStorage tak if v ktorom budu kon3tanty a v3etky premenne ktore sa budu ukladat do LS budu mat variable = localStorage.getItem('variable') || default
// omg to je cool,

const COLORS = {
    roadLineColor: 0xFF61C6, // Pink
    roadColor1: 0x160E21, // Dark purple
    roadColor2: 0x190D23, // Darker purple
    rumbleColor1: 0xC756E7, // Light purple
    grassColor1: 0x0E0C1D, // Darkest purple
    gradient1: '#da19d6',
    gradient2: '#2d2573',
    textColor: '#FFFFFF',
    hudOutline: 0x201033,
    poleColor: 0x717171
};



const CAR_COLORS = ['whiteFront', 'blueFront', 'pinkFront'];
const CAR_LEFT = ['whiteSLeft', 'blueSLeft', 'pinkSLeft'];
const CAR_RIGHT = ['whiteSRight', 'blueSRight', 'pinkSRight'];
const finishAnimation = [];

let win = false;

// VARIABLES TO TAKE FROM LS
let lines = [0];
let introComplete = false;

let colors = [0];
let numLines = 1;
let count = 0;
let isGrey = false;
let animationSpeed = 1; // Separate variable for controlling the animation speed
let speed = 0;
let startGame = false;
let greenLight = false;
let levels;
let WIDTH, HEIGHT;
let playerRoadWidth = 0;
const playedLevels = new Map(JSON.parse(localStorage.getItem('playedLevels')) || new Map());

if (window.innerHeight > window.innerWidth) {
    WIDTH = window.innerHeight;
    HEIGHT = window.innerWidth;
} else {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
}
const topWidth = WIDTH / 4;
let bottomWidth = 0;
let elapsedDistance = window.localStorage.getItem('elapsedDistance') || 0;
let spawnedEnemies = window.localStorage.getItem('spawnedEnemies') || 0;


export default class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.cursors = null;
        this.addSpeedKey = null;
        this.subSpeedKey = null;
        this.leftKey = null;
        this.rightKey = null;

    }

    preload() {
        this.loadAssets();
    }

    create() {
        const viewStore = useViewStore();
        // Start fresh
        this.initializeVariables();


        this.setupGraphics();
        this.setupFinishLine();
        this.createAnimations();
        this.setupPlayer();
        this.player.setScale(1);
        this.getLevel();
        this.roadMovement(16);
        this.setupEnemies();
        this.setupHUD();


        this.setupKeyboard();
        this.setupFinishLine();


        // In your create() method:
        const saveButton = this.add.text(100, 50, 'Save Game', {
            fill: '#fff'
        })
            .setInteractive()
            .setDepth(100)
            .on('pointerdown', () => saveGameState(this));

        const loadButton = this.add.text(250, 50, 'Load Game', {
            fill: '#fff'
        })
            .setInteractive()
            .setDepth(100)
            .on('pointerdown', () => resumeGameState(this));


        window.addEventListener('unload', () => {
            saveGameState(this);
        });


        // Initialize mouse control tracking
        this.isMouseActive = false;

        // Listen for mouse interactions
        this.input.on('pointerdown', () => {
            this.isMouseActive = true; // Enable mouse control
        });



    }

    update(time, delta) {
        const viewStore = useViewStore();
        this.movement();
        this.gyroscopeMovement();
        this.roadMovement(delta);
        this.racePreparations();
        this.updateHUD();
        this.endOfGame();
    }
    showIntroSequence() {
        introComplete = false;
        this.lakitu = this.add.sprite(0, HEIGHT, 'lakituStart').setScale(0).setDepth(2);
        bottomWidth = playerRoadWidth / 5;
        if (this.player) {
            this.player.scale = bottomWidth / 53;
            this.player.originY = 1;
            this.player.y = HEIGHT / 2 * 2 - this.player.height;
        }
        animationSpeed = 0.00007;

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                removeLoading(this);
                startGame = true;
                this.lakitu.id = 'lakitu';
                this.tweens.add({
                    targets: this.lakitu,
                    x: {
                        value: WIDTH / 3,
                        ease: 'Cosine.easeInOut'
                    },
                    y: {
                        value: WIDTH / 6 + WIDTH / 14,
                        ease: 'Cubic.easeOut'
                    },
                    scale: (HEIGHT / 4) / 410,
                    duration: 1500,
                    loop: false,
                    onComplete: () => {
                        this.lakitu.anims.play('lakituStart', true);
                        this.lakitu.on('animationcomplete', () => {
                            this.lakitu.anims.stop();
                            greenLight = true;
                            introComplete = true;
                            this.tweens.add({
                                targets: this.lakitu,
                                x: {
                                    value: WIDTH,
                                    ease: 'Cubic.easeIn'
                                },
                                y: {
                                    value: 0,
                                    ease: 'Cosine.easeOut'
                                },
                                scale: 0,
                                duration: 1500,
                                onComplete: () => {
                                    this.lakitu.destroy();
                                }
                            });
                        });
                    }
                });
            },
            loop: false
        });
    }
    initializeVariables() {
        // Scene variables
        this.dots = '';
        this.dotCounter = 0;
        this.timer = 0;
        this.sceneEnemies = [];
        this.timerEvent = null;

        const viewStore = useViewStore();
        const isLoading = viewStore.continueGame;

        // Only reset these if not loading a saved game
        if (!isLoading) {
            // Global variables
            lines = [0];
            colors = [0];
            numLines = 1;
            count = 0;
            animationSpeed = 1;
            speed = 0;
            isGrey = false;
            startGame = false;
            greenLight = false;
            win = false;
            elapsedDistance = 0;
            spawnedEnemies = 0;
            bottomWidth = 0;
            playerRoadWidth = 0;
        } else {
            // Load saved state before starting any timers or calculations
            elapsedDistance = window.localStorage.getItem('elapsedDistance') || 0;
        }

    }


    loadAssets() {
        this.assets = [{
            key: 'frontCar',
            path: 'img/frontCar.png',
            frame: {
                frameWidth: 50,
                frameHeight: 33
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'whiteFront',
            path: 'img/whiteFront.png',
            frame: {
                frameWidth: 48,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'whiteSLeft',
            path: 'img/whiteSLeft.png',
            frame: {
                frameWidth: 53.5,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'whiteSRight',
            path: 'img/whiteSRight.png',
            frame: {
                frameWidth: 53.5,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'blueFront',
            path: 'img/blueFront.png',
            frame: {
                frameWidth: 48,
                frameHeight: 27
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'blueSLeft',
            path: 'img/blueSLeft.png',
            frame: {
                frameWidth: 54,
                frameHeight: 27
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'blueSRight',
            path: 'img/blueSRight.png',
            frame: {
                frameWidth: 54,
                frameHeight: 27
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'pinkFront',
            path: 'img/pinkFront.png',
            frame: {
                frameWidth: 48,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'pinkSLeft',
            path: 'img/pinkSLeft.png',
            frame: {
                frameWidth: 54,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'pinkSRight',
            path: 'img/pinkSRight.png',
            frame: {
                frameWidth: 54,
                frameHeight: 28
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'carLeft',
            path: 'img/carLeft.png',
            frame: {
                frameWidth: 59,
                frameHeight: 31
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'rightCar',
            path: 'img/rightCar.png',
            frame: {
                frameWidth: 59,
                frameHeight: 31
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'redSRight',
            path: 'img/redSRight.png',
            frame: {
                frameWidth: 54,
                frameHeight: 31
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'redSLeft',
            path: 'img/redSLeft.png',
            frame: {
                frameWidth: 54,
                frameHeight: 31
            },
            type: 'spriteSheet',
            start: 0,
            end: 1,
            frameRate: 10,
            repeat: -1
        }, {
            key: 'lakituStart',
            path: 'img/lakitu.png',
            frame: {
                frameWidth: 500,
                frameHeight: 410
            },
            type: 'spriteSheet',
            start: 0,
            end: 3,
            frameRate: 1,
            repeat: 0
        }, {
            key: 'explosion',
            path: 'img/explosion.png',
            frame: {
                frameWidth: 80,
                frameHeight: 48
            },
            type: 'spriteSheet',
            start: 0,
            end: 11,
            frameRate: 15,
            repeat: 0
        }, {
            key: 'finish',
            path: 'img/finish.png',
            type: 'image'
        }, {
            key: 'background',
            path: 'img/background.png',
            type: 'image'
        }, {
            key: 'levels',
            path: 'levels.json',
            type: 'json'
        }, ];

        this.assets.forEach(asset => {
            switch (asset.type) {
                case 'spriteSheet':
                    this.load.spritesheet(asset.key, asset.path, asset.frame);
                    break;
                case 'image':
                    this.load.image(asset.key, asset.path);
                    break;
                case 'json':
                    this.load.json(asset.key, asset.path);
                    break;
            }
        });
    }
    createAnimations() {
        this.assets.forEach(asset => {
            if (asset.type === 'spriteSheet') {
                this.anims.create({
                    key: asset.key,
                    frames: this.anims.generateFrameNumbers(asset.key, {
                        start: asset.start,
                        end: asset.end
                    }),
                    frameRate: asset.frameRate,
                    repeat: asset.repeat
                });
            }
        });
    }

    setupGraphics() {
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(WIDTH, HEIGHT / 2).setDepth(0);
        this.info = this.add.graphics().setDepth(3);
        this.graphics = this.add.graphics().setDepth(1);
        this.loadingScreen = this.add.graphics().setDepth(10);
    }

    setupHUD() {
        const DASHBOARD_HEIGHT = HEIGHT / 10;

        this.info.clear();
        createGradientShape(this, WIDTH / 2, DASHBOARD_HEIGHT / 2, WIDTH, DASHBOARD_HEIGHT, COLORS.gradient1, COLORS.gradient2, 'rectangle');
        this.info.lineStyle(WIDTH / 150, COLORS.hudOutline, 1);
        this.info.strokeRect(0, 0, WIDTH, DASHBOARD_HEIGHT);
        this.info.lineStyle(0);
        createGradientShape(this, 0, 0, DASHBOARD_HEIGHT * 4, DASHBOARD_HEIGHT * 4, COLORS.gradient1, COLORS.gradient2, 'circle');
        createGradientShape(this, WIDTH, 0, DASHBOARD_HEIGHT * 4, DASHBOARD_HEIGHT * 4, COLORS.gradient1, COLORS.gradient2, 'circle');
        this.info.lineStyle(WIDTH / 150, COLORS.hudOutline, 1);
        this.info.strokeCircle(0, 0, DASHBOARD_HEIGHT * 2);
        this.info.strokeCircle(WIDTH, 0, DASHBOARD_HEIGHT * 2);

        this.speedText = this.add.text(10, DASHBOARD_HEIGHT / 2, Math.trunc(speed) + " km/h", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: COLORS.textColor,
        }).setOrigin(-0.2, 0).setDepth(4);

        this.healthText = this.add.text(DASHBOARD_HEIGHT * 2 + 10, DASHBOARD_HEIGHT / 2, "Health: 100%", {
            fontSize: `${WIDTH/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(0, 0.5).setDepth(4);

        this.levelText = this.add.text(WIDTH / 2, DASHBOARD_HEIGHT / 2, "Time: " + this.timer + "s", {
            fontSize: `${WIDTH/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(0.5, 0.5).setDepth(4);

        this.distanceText = this.add.text(WIDTH - DASHBOARD_HEIGHT * 2 - 10, DASHBOARD_HEIGHT / 2, "Distance: 0m", {
            fontSize: `${WIDTH/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(1, 0.5).setDepth(4);

        this.timeText = this.add.text(WIDTH - 10, DASHBOARD_HEIGHT / 2, "Level: 1", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: COLORS.textColor,
        }).setOrigin(1, 0).setDepth(4);
    }

    updateHUD() {
        // TODO: Update the HUD elements
        let speed = (animationSpeed / 2.75) * 120; // Convert the speed to km/h
        this.speedText.setText(Math.trunc(speed) + "\nkm/h");
        this.healthText.setText("❤: " + this.player.getData('health') + "%");
        this.levelText.setText("Level: " + this.currentLevel.level);
        this.distanceText.setText("🛣: " + Math.round(elapsedDistance * 100) / 100 + "Km");
        this.timeText.setText("⏲:" + this.timer + "s");
    }

    setupFinishLine() {
        let finishLineY = HEIGHT - HEIGHT / 3
        this.finishLine = this.add.tileSprite(
            WIDTH / 2,
            finishLineY,
            2 * (WIDTH / 8),
            HEIGHT / 50,
            'finish'
        ).setDepth(0);
        this.finishLine.tileScaleX = 0.1;
        this.finishLine.tileScaleY = 0.1;
        this.poleLeft = this.add.rectangle(WIDTH / 2 - WIDTH / 8, finishLineY, 2, 4 * HEIGHT / 50, COLORS.poleColor).setDepth(0).setOrigin(0.5, 0);
        this.poleRight = this.add.rectangle(WIDTH / 2 + WIDTH / 8, finishLineY, 2, 4 * HEIGHT / 50, COLORS.poleColor).setDepth(0).setOrigin(0.5, 0);
    }

    moveFinishLine() {
        win = true;
        this.finishLine.id = 'finishLine';
        this.tweens.add({
            targets: [this.poleLeft, this.poleRight],
            y: HEIGHT / 2 - HEIGHT / 10 + this.finishLine.height / 2,
            duration: 2500,
            onUpdate: (tween) => {
                this.finishLine.y = this.poleLeft.y;
            },
            onComplete: () => {
                this.finishLine.setDepth(10);
                this.poleLeft.setDepth(10);
                this.poleRight.setDepth(10);
                this.tweens.add({
                    targets: this.finishLine,
                    y: HEIGHT - this.player.height * 4,
                    height: this.player.height * this.player.scale,
                    width: WIDTH - bottomWidth / 2,
                    tileScaleX: 0.3,
                    tileScaleY: 0.3,
                    duration: 3000,
                    onUpdate: (tween) => {
                        this.poleLeft.y = this.finishLine.y;
                        this.poleRight.y = this.finishLine.y;
                        this.poleLeft.x = this.finishLine.x - this.finishLine.width / 2;
                        this.poleRight.x = this.finishLine.x + this.finishLine.width / 2;

                        this.poleLeft.height = tween.progress * this.player.height * 5 * this.player.scale;
                        this.poleRight.height = tween.progress * this.player.height * 5 * this.player.scale;

                        this.poleRight.width = tween.progress * (this.player.width / 20) * this.player.scale;
                        this.poleLeft.width = tween.progress * (this.player.width / 20) * this.player.scale;
                    },
                    onComplete: () => {
                        greenLight = false;
                        this.stopTimer();
                        this.subtractSpeed();
                        this.tweens.add({
                            targets: this.finishLine,
                            alpha: 0,
                            y: HEIGHT + this.poleRight.height + this.player.height,
                            duration: 1000,
                            onUpdate: (tween) => {
                                this.poleLeft.y = this.finishLine.y;
                                this.poleRight.y = this.finishLine.y;
                            },
                            onComplete: () => {
                                this.finishLine.destroy();
                                this.poleLeft.destroy();
                                this.poleRight.destroy();
                                let overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000).setOrigin(0, 0).setDepth(10);
                                overlay.alpha = 0;
                                this.tweens.add({
                                    targets: overlay,
                                    alpha: 1,
                                    duration: 1000,
                                    onComplete: () => {
                                        const dataToPass = {
                                            level: this.currentLevel.level,
                                            difficulty: this.currentLevel.difficulty,
                                            diffVersion: this.currentLevel.diffIndex + 1,
                                            win: win,

                                        }
                                        const viewStore = useViewStore();
                                        localStorage.setItem('playedLevels', JSON.stringify(Array.from(playedLevels.entries())));
                                        viewStore.setSceneData(dataToPass); // Store the data to pass to the next scene
                                        viewStore.setView('victory'); // Trigger a transition to Victory view
                                    }
                                });

                            }

                        });
                    }
                });
            }
        })
    }

    endOfGame() {
        if (elapsedDistance >= this.currentLevel.roadLength && !win) {
            this.moveFinishLine();
        }
    }

    setupPlayer() {
        if (this.player) {
            this.player.destroy();
        }

        this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT - HEIGHT / 15, 'frontCar')
            .setScale(1) // Start with default scale
            .setDepth(1);

        this.player.anims.play('frontCar', true);
        this.player.setData('health', 100);
        this.player.body.setCollideWorldBounds(true);
        this.updatePlayerCollider();
        this.player.body.setOffset(0, this.player.height * 0.1);
    }


    updatePlayerCollider() {
        this.player.body.setSize(this.player.width * 0.95, this.player.height * 0.6);
    }


    setupEnemies() {
        let enemyX = 0;
        this.currentLevel.difficultyVersions[1].enemies.forEach(enemy => {
            let animationKey = null;
            switch (enemy.startPosition) {
                case 'left':
                    enemyX = WIDTH / 2 - topWidth / 3;
                    animationKey = getRandomItem(CAR_RIGHT);
                    break;
                case 'middle':
                    enemyX = WIDTH / 2;
                    animationKey = getRandomItem(CAR_COLORS);
                    break;
                case 'right':
                    enemyX = WIDTH / 2 + topWidth / 3;
                    animationKey = getRandomItem(CAR_LEFT);
                    break;
            }
            let newEnemy = this.physics.add.sprite(enemyX, HEIGHT / 2, 'whiteFront').setScale(0).setDepth(2).setOrigin(0.5, 1);
            newEnemy.x = enemyX; // LS
            newEnemy.startPosition = enemy.startPosition;
            newEnemy.anims.play(animationKey, true);
            newEnemy.body.setSize(newEnemy.width * 0.95, newEnemy.height * 0.6);
            newEnemy.body.setOffset(0, newEnemy.height * 0.3);
            newEnemy.setData('appearanceTime', enemy.appearanceTime);
            newEnemy.setData('onScreen', false);
            newEnemy.setData('collided', false);
            newEnemy.setData('hasSpawned', false);
            this.physics.add.overlap(this.player, newEnemy, this.handleCollision, null, this);


            this.sceneEnemies.push(newEnemy); // Add the enemy to the sceneEnemies array
            // SAVE ENEMY X FROM ARRAY TO LS
        });
    }


    handleCollision(player, enemy) {

        if (enemy.getData('collided')) {
            return;
        }

        enemy.setData('collided', true);

        // Decrease player health and check for game over
        const newHealth = this.player.getData('health') - this.currentLevel.enemyDamage;
        this.player.setData('health', newHealth);

        // Check if player is dead
        if (newHealth <= 0) {
            win = false;
            greenLight = false;
            this.stopTimer();
            this.subtractSpeed();

            // Create fade out effect
            let overlay = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000)
                .setOrigin(0, 0)
                .setDepth(10)
                .setAlpha(0);

            this.tweens.add({
                targets: overlay,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                    const dataToPass = {
                        level: this.currentLevel.level,
                        difficulty: this.currentLevel.difficulty,
                        diffVersion: this.currentLevel.diffIndex + 1,
                        win: win
                    };
                    const viewStore = useViewStore();
                    localStorage.setItem('playedLevels', JSON.stringify(Array.from(playedLevels.entries())));
                    viewStore.setSceneData(dataToPass);
                    viewStore.setView('victory');
                }
            });
            return;
        }

        this.physics.world.removeCollider(enemy);

        let explosion = this.add.sprite(enemy.x, enemy.y, 'explosion').setScale((this.player.width * this.player.scale) / 48).setDepth(2);
        explosion.anims.play('explosion', true);

        explosion.once('animationcomplete', () => {
            explosion.destroy(); // Destroy the explosion sprite
            //enemy.destroy(); // Destroy the enemy
        });
        enemy.setVisible(false);
    }

    spawnEnemy(enemyID) {
        if (enemyID >= this.sceneEnemies.length)
            return;

        let enemy = this.sceneEnemies[enemyID];
        enemy.id = 'enemy' + enemyID;
        const shouldSpawn =
            enemy.getData('appearanceTime') <= Math.round(elapsedDistance * 100) / 100 &&
            !enemy.getData('onScreen') &&
            !enemy.getData('hasSpawned') &&
            !enemy.getData('collided');

        if (shouldSpawn) {
            // Reset enemy state for spawn
            enemy.setScale(0);
            enemy.y = HEIGHT / 2;
            enemy.setVisible(true);

            // Update enemy data
            enemy.setData('onScreen', true);
            enemy.setData('hasSpawned', true);
            spawnedEnemies++;

            // Start scaling animation
            this.tweens.add({
                targets: enemy,
                scale: (topWidth / 5) / 32,
                duration: 1500,
                onComplete: () => {
                    this.moveEnemy(enemy);
                }
            });
        }
    }

    moveEnemy(enemy) {
        if (enemy && introComplete) { // Only move enemies if intro is complete
            let direction = 0;
            let duration = 5000;
            let initialScale = enemy.scale;

            switch (enemy.startPosition) {
                case 'left':
                    direction = WIDTH / 2 - 2 * bottomWidth;
                    break;
                case 'middle':
                    direction = WIDTH / 2;
                    break;
                case 'right':
                    direction = WIDTH / 2 + 2 * bottomWidth;
                    break;
            }

            duration = duration / (this.currentLevel.speed / 2.75);

            this.tweens.add({
                targets: enemy,
                x: direction,
                y: HEIGHT + 32 * (this.player.scale + 1.5),
                ease: 'Linear',
                duration: duration,
                onUpdate: (tween) => {
                    enemy.scale = Phaser.Math.Linear(initialScale, this.player.scale + 1, tween.progress);
                },
                onComplete: () => {
                    enemy.setData('onScreen', false);

                }
            });
        }
    }



    roadMovement(delta) {
        const halfWidth = WIDTH / 2;
        const halfHeight = HEIGHT / 2;
        let roadMaxWidth = 0;
        let graphics = this.graphics;

        graphics.clear();
        // Draw the horizon line
        graphics.lineStyle(1, COLORS.roadLineColor, 1);
        graphics.moveTo(0, halfHeight);
        graphics.lineTo(WIDTH, halfHeight);
        graphics.setDepth(1);

        if (lines.length > 1) {
            const topRoadColor = colors[0] === 0 ? COLORS.roadColor1 : COLORS.roadColor2;

            // Draw top grass
            graphics.fillStyle(COLORS.grassColor1, 1);
            graphics.fillRect(0, halfHeight, WIDTH, HEIGHT);
            //draw top road trapzoid
            drawPolygon(graphics, halfWidth - WIDTH / 10, halfWidth + WIDTH / 10, halfWidth + WIDTH / 10 + lines[0], halfWidth + WIDTH / 10 + lines[0], halfHeight, halfHeight + lines[0], topRoadColor);
            drawPolygon(graphics, halfWidth - WIDTH / 8, halfWidth - WIDTH / 8 - 2, halfWidth - WIDTH / 8 - 2 - lines[0], halfWidth - WIDTH / 8 - lines[0], halfHeight, halfHeight + lines[0], COLORS.rumbleColor1);
            drawPolygon(graphics, halfWidth + WIDTH / 8, halfWidth + WIDTH / 8 + 2, halfWidth + WIDTH / 8 + 2 + lines[0], halfWidth + WIDTH / 8 + lines[0], halfHeight, halfHeight + lines[0], COLORS.rumbleColor1);
        }

        // Draw road segments
        for (let i = 0; i < numLines - 1; i++) {
            const x1 = lines[i] + WIDTH / 8;
            const x2 = lines[i + 1] + WIDTH / 8;
            if (!startGame)
                roadMaxWidth = x1;
            //get width of road on y on which is player
            if (this.player.y < halfHeight + lines[i + 1] && this.player.y > halfHeight + lines[i]) {
                playerRoadWidth = x1;
            }


            const roadColor = colors[i] === 0 ? COLORS.roadColor1 : COLORS.roadColor2;
            const grassColor = colors[i] === 0 ? COLORS.grassColor1 : 0x00ff00;
            const rumbleColor = COLORS.rumbleColor1;

            // Draw grass and trapezoid
            graphics.fillStyle(grassColor, 1);
            graphics.strokeRect(0, halfHeight + lines[i], halfWidth - x1, lines[i + 1] - lines[i]);
            graphics.strokeRect(halfWidth + x1, halfHeight + lines[i], WIDTH - (halfWidth + x1), lines[i + 1] - lines[i]);
            // Draw road trapezoid
            drawPolygon(graphics, halfWidth - x1, halfWidth + x1, halfWidth + x2, halfWidth - x2, halfHeight + lines[i], halfHeight + lines[i + 1], roadColor);
            const addWidth = Math.max(lines[i] / 15, 2);
            // Draw rumble trapezoid
            drawPolygon(graphics, halfWidth - x1, halfWidth - x1 - addWidth, halfWidth - x2 - addWidth, halfWidth - x2, halfHeight + lines[i], halfHeight + lines[i + 1], rumbleColor);
            drawPolygon(graphics, halfWidth + x1, halfWidth + x1 + addWidth, halfWidth + x2 + addWidth, halfWidth + x2, halfHeight + lines[i], halfHeight + lines[i + 1], rumbleColor);
        }

        lines = lines.map((line, i) => line + 10 * (i + 1) * 0.1 * animationSpeed); // Update the lines

        if (count++ > 6 / animationSpeed) {
            count = 0;
            lines.unshift(0);
            colors.unshift(isGrey ? 1 : 0);
            isGrey = !isGrey;
            numLines++;
        }

        if (numLines > 100) {
            lines.pop();
            colors.pop();
            numLines--;
        }


        if (lines[lines.length - 1] < HEIGHT) {
            this.dotCounter++;
            if (this.dotCounter % 30 === 0) {
                this.dots = '.'.repeat((this.dots.length % 3) + 1);
            }
            drawLoading(this, Math.floor(delta / 1000), this.dots);
        } else if (!startGame) {
            this.lakitu = this.add.sprite(0, HEIGHT, 'lakituStart').setScale(0).setDepth(2);
            bottomWidth = roadMaxWidth / 5;
            this.player.scale = bottomWidth / 53;
            this.player.originY = 1;
            this.player.y = halfHeight * 2 - this.player.height;
            animationSpeed = 0.00007;

            const viewStore = useViewStore();
            if (viewStore.continueGame === true) {
                viewStore.continueGameState(false);
                startGame = true;
                introComplete = true;
                greenLight = true;
                // Load saved state before starting any timers or calculations
                resumeGameState(this);
                // Prevent initial distance calculation
                window.gameState = window.gameState || {};
                window.gameState.isRestoringState = true;


                // If game was saved during intro, we need to show intro
            }
            if (!startGame) {
                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        removeLoading(this);
                        startGame = true;
                        this.lakitu.id = 'lakitu';
                        this.tweens.add({
                            targets: this.lakitu,
                            x: {
                                value: WIDTH / 3,
                                ease: 'Cosine.easeInOut'
                            },
                            y: {
                                value: WIDTH / 6 + WIDTH / 14,
                                ease: 'Cubic.easeOut'
                            },
                            scale: (HEIGHT / 4) / 410,
                            duration: 1500,
                            loop: false,
                            onComplete: () => {

                                this.lakitu.anims.play('lakituStart', true);
                                this.lakitu.on('animationcomplete', () => {
                                    this.lakitu.anims.stop();
                                    greenLight = true;
                                    this.tweens.add({
                                        targets: this.lakitu,
                                        x: {
                                            value: WIDTH,
                                            ease: 'Cubic.easeIn'
                                        },
                                        y: {
                                            value: 0,
                                            ease: 'Cosine.easeOut'
                                        },
                                        scale: 0,
                                        duration: 1500,
                                        onComplete: () => {
                                            introComplete = true;
                                            this.lakitu.destroy();

                                        }
                                    });
                                });
                            }
                        });
                    },
                    loop: false
                });
            }
        }
    }
    racePreparations() {
        if (greenLight) {
            if (speed < this.currentLevel.speed) {
                this.addSpeed();
            }
            // Only start timer if it's not already running
            if (!this.timerEvent) {
                this.startTimer();

            }
            // Skip distance calculation if we're restoring state
            if (!window.gameState?.isRestoringState) {
                elapsedDistance = (((speed / 2.75) * 120) / 3600) * this.timer;
            }
            this.spawnEnemy(spawnedEnemies);
        }
    }



    startTimer() {
        this.timer = window.gameState?.timer || 0;
        if (!this.timerEvent) {
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.timer++;
                },
                callbackScope: this,
                loop: true
            });

        }
    }

    stopTimer() {
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }


    getLevel() {
        levels = this.cache.json.get('levels');
        // Determine the level index
        let levelIndex = playedLevels.size - 1 < levels.levels.length ? playedLevels.size : getRandomNumber(0, levels.levels.length - 1);

        // Randomly select a difficulty index that hasn't been played for this level
        let difficultyIndex = 0;
        do {
            difficultyIndex = getRandomNumber(0, 2);
        } while (playedLevels.get(levelIndex) === difficultyIndex);

        // Store the new played level and difficulty version
        playedLevels.set(levelIndex, difficultyIndex);
        console.log(difficultyIndex);

        localStorage.setItem('playedLevels', JSON.stringify(Array.from(playedLevels.entries())));


        this.currentLevel = levels.levels[levelIndex]; //TODO add random level selection, and dificulty...and make sure im not repeating levels i played before. LocalStorage?
        this.currentLevel.diffIndex = difficultyIndex;
        console.log(this.currentLevel);
        this.dificulty = this.currentLevel.difficulty;
        console.log(this.dificulty);

        this.currentLevel.difficultyVersions[difficultyIndex].enemies.forEach(enemy => {
            // Example: Place enemies at their positions based on the data as a red circle
            console.log(`Enemy at ${enemy.startPosition}, appearing at ${enemy.appearanceTime}`);
        });
    }
    gyroscopeMovement() {
        if (this.gyroData) {
            // Map beta (tilt forward/back) to vertical movement
            this.player.x += this.gyroData.beta * 0.1;

            // Map gamma (tilt left/right) to horizontal movement
        }
    }
    handleOrientation(event) {
        const angle = window.screen.orientation ?
            window.screen.orientation.angle :
            window.orientation || 0;

        let beta = event.beta; // Front-to-back tilt (rotation around the X-axis)

        // Adjust beta based on device orientation
        if (angle === 90) {
            // Landscape mode (rotated right)
            beta = event.beta;
        } else if (angle === -90) {
            // Landscape mode (rotated left)
            beta = -event.beta;
        }
        // Update the gyroData object with the corrected beta value
        this.gyroData.beta = beta;
    }
    setupKeyboard() {
        this.gyroData = {
            beta: 0
        };
        // Input tracking
        this.cursors = this.input.keyboard.createCursorKeys();
        this.lastKeyboardInput = 0;
        this.lastMouseInput = 0;

        this.input.on('pointermove', (pointer) => {
            this.lastMouseInput = this.time.now;
            this.mouseTarget = {
                x: pointer.x,
                y: pointer.y
            };
        });

        this.input.keyboard.on('keydown', () => {
            this.lastKeyboardInput = this.time.now;
        });

        window.addEventListener("deviceorientation", this.handleOrientation.bind(this));
        this.input.keyboard.removeAllKeys(true);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.input.keyboard.enabled = true;
    }
    movement() {
        if (!this.player) return;

        const now = this.time.now;
        let isUsingMouse = false; // Last mouse input within 300ms

        if (now - this.lastMouseInput < now - this.lastKeyboardInput) {
            isUsingMouse = true;
        } else {
            isUsingMouse = false;
        }

        // Base speed calculation
        const baseSpeed = WIDTH / 400;
        let steerSpeed = baseSpeed * animationSpeed / 2;


        // Mouse movement logic
        if (isUsingMouse) {
            const pointerX = this.input.activePointer.worldX;

            if (pointerX > this.player.x + 10) {
                this.player.x += steerSpeed;
                this.player.anims.play('rightCar', true);
            } else if (pointerX < this.player.x - 10) {
                this.player.x -= steerSpeed;
                this.player.anims.play('carLeft', true);
            } else {
                if (this.player.x >= WIDTH / 2 + WIDTH / 10) {
                    this.player.anims.play('redSLeft', true);
                } else if (this.player.x <= WIDTH / 2 - WIDTH / 10) {
                    this.player.anims.play('redSRight', true);
                } else {
                    this.player.anims.play('frontCar', true);
                }
            }

            this.updatePlayerCollider();
        }
        // Keyboard movement logic
        else if (this.leftKey?.isDown) {
            this.isMouseActive = false; // Disable mouse control when keyboard is active
            this.player.x -= steerSpeed;
            this.player.anims.play('carLeft', true);
            this.updatePlayerCollider();
        } else if (this.rightKey?.isDown) {
            this.isMouseActive = false; // Disable mouse control when keyboard is active
            this.player.x += steerSpeed;
            this.player.anims.play('rightCar', true);
            this.updatePlayerCollider();
        } else {
            // Idle animation logic
            if (this.player.x >= WIDTH / 2 + WIDTH / 10) {
                this.player.anims.play('redSLeft', true);
            } else if (this.player.x <= WIDTH / 2 - WIDTH / 10) {
                this.player.anims.play('redSRight', true);
            } else {
                this.player.anims.play('frontCar', true);
            }

            this.updatePlayerCollider();
        }

        // Prevent the player from going out of bounds
        const leftLimit = WIDTH / 2 - playerRoadWidth;
        const rightLimit = WIDTH / 2 + playerRoadWidth;

        if (this.player.x < leftLimit) {
            this.player.x = leftLimit;
        } else if (this.player.x > rightLimit) {
            this.player.x = rightLimit;
        }
    }

    shutdown() {
        // Clean up keyboard bindings
        if (this.input?.keyboard) {
            this.input.keyboard.removeAllKeys(true);
        }
        this.cursors = null;
        this.addSpeedKey = null;
        this.subSpeedKey = null;
        this.leftKey = null;
        this.rightKey = null;
    }

    addSpeed() {
        if (speed !== this.currentLevel.speed) {
            let startTime = Date.now(); // Record start time
            let currentSpeed = speed; // Store the initial speed
            let duration = 1500; // Time to reach the desired speed in milliseconds

            const updateSpeed = () => {
                let elapsed = Date.now() - startTime; // Calculate elapsed time
                let t = Phaser.Math.Clamp(elapsed / duration, 0, 1); // Normalize t to [0, 1]
                speed = Phaser.Math.Linear(currentSpeed, this.currentLevel.speed, t); // Interpolate speed
                animationSpeed = speed; // Update animation speed

                if (t < 1) {
                    // Continue updating until t reaches 1
                    requestAnimationFrame(updateSpeed);
                }
            };

            updateSpeed(); // Start the interpolation process
        }
    }
    subtractSpeed() {
        if (speed > 0) {
            let startTime = Date.now(); // Record start time
            let initialSpeed = speed; // Store the current speed
            let duration = 3000; // Time to reduce the speed to zero in milliseconds

            const updateSpeed = () => {
                let elapsed = Date.now() - startTime; // Calculate elapsed time
                let t = Phaser.Math.Clamp(elapsed / duration, 0, 1); // Normalize t to [0, 1]
                speed = Phaser.Math.Linear(initialSpeed, 0, t); // Interpolate speed to zero
                animationSpeed = speed; // Update animation speed

                if (t < 1) {
                    // Continue updating until t reaches 1
                    requestAnimationFrame(updateSpeed);
                } else {
                    // Ensure speed is exactly zero at the end
                    speed = 0;
                    animationSpeed = 0;
                }
            };

            updateSpeed(); // Start the interpolation process
        }
    }

    resetGameState() {
        // Properly clean up input before reset
        // Stop all running tweens
        this.tweens.killAll();

        // Clear graphics
        if (this.graphics) this.graphics.clear();
        if (this.info) this.info.clear();
        if (this.loadingScreen) this.loadingScreen.clear();

        // Remove all game objects
        this.children.removeAll(true);

        // Clear physics
        if (this.physics.world) {
            this.physics.world.colliders.destroy();
        }

        // Initialize core graphics before loading state
        this.loadingScreen = this.add.graphics().setDepth(10);
        this.graphics = this.add.graphics().setDepth(1);
        this.info = this.add.graphics().setDepth(3);
    }




}

function drawPolygon(graphics, x1, x2, x3, x4, y1, y2, color) {
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y1);
    graphics.lineTo(x3, y2);
    graphics.lineTo(x4, y2);
    graphics.closePath();
    graphics.fillPath();
}

function drawLoading(scene, time, dots) {
    scene.loadingScreen.clear();
    scene.loadingScreen.fillStyle(0x000000, 1);
    scene.loadingScreen.fillRect(0, 0, scene.scale.width, scene.scale.height);

    if (!scene.loadingText) {
        scene.loadingText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, "Loading" + dots, {
            fontSize: '32px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setDepth(11);
    } else {
        if (scene.loadingText)
            scene.loadingText.setText("Loading" + dots);
    }
}

function removeLoading(scene) {
    scene.loadingScreen.alpha = 0;
    scene.loadingText.alpha = 0;
}

let gradientCounter = 0;

function createGradientShape(scene, x, y, width, height, color1, color2, shape = 'circle') {
    const uniqueKey = `gradientShape_${gradientCounter++}`; // Generate a unique key

    // Create a canvas texture for the gradient
    const gradientCanvas = scene.textures.createCanvas(uniqueKey, width, height);
    const gradientCtx = gradientCanvas.context;

    // Create the gradient
    const gradient = shape === 'circle' ?
        gradientCtx.createRadialGradient(
            width / 2, height / 2, 0, // Inner circle (center, 0 radius)
            width / 2, height / 2, Math.min(width, height) / 2 // Outer circle (center, full radius)
        ) :
        gradientCtx.createLinearGradient(0, 0, 0, height); // Horizontal gradient for rectangle

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    // Apply the gradient and draw the shape
    gradientCtx.fillStyle = gradient;
    gradientCtx.beginPath();

    if (shape === 'circle') {
        gradientCtx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2); // Full circle
    } else if (shape === 'rectangle') {
        gradientCtx.rect(0, 0, width, height); // Full rectangle
    }

    gradientCtx.closePath();
    gradientCtx.fill();

    // Refresh the canvas texture
    gradientCanvas.refresh();

    // Add the render texture to the scene
    const rt = scene.add.renderTexture(x, y, width, height).setOrigin(0.5, 0.5);
    rt.draw(uniqueKey).setDepth(3);

    return rt;
}

function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function saveGameState(scene) {
    // Save all global variables and scene state
    const gameState = {
        globalVars: {
            lines: [...lines],
            colors: [...colors],
            numLines,
            count,
            isGrey,
            animationSpeed,
            speed,
            startGame,
            greenLight,
            elapsedDistance,
            spawnedEnemies,
            bottomWidth,
            playerRoadWidth,
            win,
            playedLevels,
            timer: scene.timer || 0
        },
        player: scene.player ? {
            x: scene.player.x,
            y: scene.player.y,
            scale: scene.player.scale,
            health: scene.player.getData('health'),
            texture: scene.player.texture.key,
            frame: scene.player.frame.name,
            currentAnim: scene.player.anims?.currentAnim?.key || 'frontCar'
        } : null,
        enemies: scene.sceneEnemies.map(enemy => ({
            x: enemy.x,
            y: enemy.y,
            scale: enemy.scale,
            texture: enemy.texture.key,
            frame: enemy.frame.name,
            startPosition: enemy.startPosition,
            onScreen: enemy.getData('onScreen'),
            collided: enemy.getData('collided'),
            appearanceTime: enemy.getData('appearanceTime'),
            currentAnim: enemy.anims?.currentAnim?.key || 'frontCar'
        })),
        tweens: (scene.tweens?.getTweens() || []).map(tween => ({
            targets: Array.isArray(tween.targets) ? tween.targets.map(target => target?.id || null) : [tween.targets?.id || null],
            duration: tween.duration,
            elapsed: tween.elapsed,
            progress: tween.progress,
            data: tween.data.map(d => ({
                key: d.key,
                start: d.start,
                end: d.end,
                current: tween.targets[0]?.[d.key] || d.start
            })),
            totalElapsed: tween.totalElapsed,
            totalProgress: tween.totalProgress,
            ease: tween.ease,
            delay: tween.delay,
            repeat: tween.repeat,
            yoyo: tween.yoyo
        })),
        currentLevel: scene.currentLevel,
        lakitu: scene.lakitu ? {
            x: scene.lakitu.x,
            y: scene.lakitu.y,
            scale: scene.lakitu.scale,
            alpha: scene.lakitu.alpha,
            visible: scene.lakitu.visible,
            currentAnim: scene.lakitu?.anims?.currentAnim?.key || 'lakituStart',
            isExiting: scene.lakitu.x > WIDTH / 2
        } : null,
        finishLine: scene.finishLine ? {
            x: scene.finishLine.x,
            y: scene.finishLine.y,
            width: scene.finishLine.width,
            height: scene.finishLine.height,
            tileScaleX: scene.finishLine.tileScaleX,
            tileScaleY: scene.finishLine.tileScaleY
        } : null
    };

    localStorage.setItem('gameState', JSON.stringify(gameState));
    console.log('Game state saved:', gameState);
}

function resumeGameState(scene) {

    const savedState = JSON.parse(localStorage.getItem('gameState'));
    if (!savedState) {
        console.warn('No saved state found');
        return;
    }


    // Preserve the elapsed distance before any other operations
    // Mark that we're loading a saved state
    window.gameState = window.gameState || {};
    window.gameState.loadedState = true;

    // Set the elapsed distance first
    elapsedDistance = savedState.globalVars.elapsedDistance;
    startGame = savedState.globalVars.startGame;

    // Ensure these values persist
    Object.defineProperty(window.gameState, 'elapsedDistance', {
        value: elapsedDistance,
        writable: false,
        configurable: true
    });
    // Reset the current scene state
    scene.resetGameState();
    // Restore global variables
    Object.assign(window, savedState.globalVars);

    // Ensure timer is properly restored
    scene.timer = savedState.globalVars.timer || 0;
    elapsedDistance = savedState.globalVars.elapsedDistance;
    // Start the timer with the saved value
    if (scene.timer > 0) {
        scene.timerEvent = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!window.gameState.isRestoringState) {
                    scene.timer++;
                }
            },
            callbackScope: scene,
            loop: true,
            startAt: scene.timer * 1000 // Start from the saved time
        });
    }
    // Remove restoration flag after a short delay to ensure everything is properly initialized
    scene.time.delayedCall(100, () => {
        window.gameState.isRestoringState = false;
    });

    // Create graphics objects with correct depth
    scene.setupGraphics();

    // Restore current level
    scene.currentLevel = savedState.currentLevel;

    // Restore player with correct position and origin
    if (savedState.player) {
        scene.player = scene.physics.add.sprite(
            savedState.player.x,
            savedState.player.y,
            savedState.player.texture
        ).setDepth(2);

        // Set the correct origin before setting scale
        scene.player.setOrigin(0.5, 1);

        // Set scale after origin is set
        scene.player.setScale(savedState.player.scale);

        // Set the exact Y position from saved state
        scene.player.y = savedState.player.y;

        scene.player.setData('health', savedState.player.health);
        scene.createAnimations();
        scene.player.anims.play(savedState.player.currentAnim || 'frontCar', true);
        scene.player.body.setCollideWorldBounds(true);
        scene.updatePlayerCollider();
    }


    // Restore enemies with their movement patterns
    // In the resumeGameState function, replace the enemies restoration section with this updated logic:

    // Restore enemies with their movement patterns
    // Restore enemies with their movement patterns
    // Reset enemy array
    scene.sceneEnemies = [];

    // Track already spawned enemies to prevent respawning
    const processedEnemyTimes = new Set();

    savedState.enemies.forEach((enemyData, index) => {
        const enemy = scene.physics.add.sprite(
            enemyData.x,
            enemyData.y,
            enemyData.texture
        ).setDepth(2).setOrigin(0.5, 1);
        enemy.setScale(enemyData.scale);
        enemy.startPosition = enemyData.startPosition;

        // Mark enemy as processed to prevent respawning
        processedEnemyTimes.add(enemyData.appearanceTime);

        // Set initial state based on appearance time and saved state
        const hasAppeared = enemyData.appearanceTime <= savedState.globalVars.elapsedDistance;
        const shouldBeVisible = hasAppeared && enemyData.onScreen && !enemyData.collided;

        // Set enemy data
        enemy.setData('onScreen', enemyData.onScreen);
        enemy.setData('collided', enemyData.collided);
        enemy.setData('appearanceTime', enemyData.appearanceTime);
        enemy.setData('hasSpawned', hasAppeared);

        // Set visibility
        enemy.setVisible(shouldBeVisible);

        const defaultAnim = enemyData.startPosition === 'left' ? 'redSRight' :
            enemyData.startPosition === 'right' ? 'redSLeft' : 'frontCar';
        enemy.anims.play(enemyData.currentAnim || defaultAnim, true);

        // Calculate destination based on start position
        let direction = WIDTH / 2;
        switch (enemyData.startPosition) {
            case 'left':
                direction = WIDTH / 2 - 2 * bottomWidth;
                break;
            case 'right':
                direction = WIDTH / 2 + 2 * bottomWidth;
                break;
        }

        // Handle enemy movement restoration
        if (hasAppeared) {
            // If enemy should be on screen and not collided
            if (enemyData.onScreen && !enemyData.collided) {
                // Calculate remaining animation
                const totalDistance = HEIGHT + 32 * (savedState.player.scale + 1.5) - HEIGHT / 2;
                const distanceTraveled = enemyData.y - HEIGHT / 2;
                const remainingDistance = totalDistance - distanceTraveled;
                const originalDuration = 5000 / (scene.currentLevel.speed / 2.75);
                const remainingDuration = (remainingDistance / totalDistance) * originalDuration;
                if (remainingDistance > 0) {
                    scene.tweens.add({
                        targets: enemy,
                        x: direction,
                        y: HEIGHT + 32 * (savedState.player.scale + 1.5),
                        scale: savedState.player.scale + 1,
                        ease: 'Linear',
                        duration: remainingDuration,
                        onComplete: () => {
                            enemy.setData('onScreen', false);
                            enemy.setVisible(false);
                        }
                    });
                } else {
                    enemy.setData('onScreen', false);
                    enemy.setVisible(false);
                }
            } else if (!enemyData.collided) {
                // Enemy has appeared but waiting to be shown
                enemy.setScale(0);
                enemy.y = HEIGHT / 2;
                enemy.x = direction;
                enemy.setVisible(true);
                // Reset the enemy for proper spawning
                enemy.setData('hasSpawned', false);
                enemy.setData('onScreen', false);
            }
        }


        if (scene.player) {
            scene.physics.add.overlap(scene.player, enemy, scene.handleCollision, null, scene);
        }
        scene.sceneEnemies.push(enemy);
    });

    // Update global spawned enemies counter based on appeared enemies
    spawnedEnemies = savedState.enemies.filter(e =>
        e.appearanceTime <= savedState.globalVars.elapsedDistance || e.collided
    ).length;

    // Store processed enemy times in game state to prevent respawning
    window.gameState.processedEnemyTimes = processedEnemyTimes;


    // Restore finish line with proper animation state
    if (savedState.finishLine) {
        scene.finishLine = scene.add.tileSprite(
            savedState.finishLine.x,
            savedState.finishLine.y,
            savedState.finishLine.width,
            savedState.finishLine.height,
            'finish'
        ).setDepth(savedState.finishLine.y < HEIGHT / 2 ? 10 : 0);
        scene.finishLine.tileScaleX = savedState.finishLine.tileScaleX;
        scene.finishLine.tileScaleY = savedState.finishLine.tileScaleY;

        // If finish line was moving, restore its animation
        if (savedState.finishLine.y < HEIGHT - scene.player?.height * 4) {
            const progress = (savedState.finishLine.y - HEIGHT / 2) / (HEIGHT - HEIGHT / 2);
            const remainingDuration = 3000 * (1 - progress);

            scene.tweens.add({
                targets: scene.finishLine,
                y: HEIGHT - scene.player.height * 4,
                height: scene.player.height * scene.player.scale,
                width: WIDTH - bottomWidth / 2,
                tileScaleX: 0.3,
                tileScaleY: 0.3,
                duration: remainingDuration,
                onUpdate: (tween) => {
                    if (scene.poleLeft && scene.poleRight) {
                        scene.poleLeft.y = scene.finishLine.y;
                        scene.poleRight.y = scene.finishLine.y;
                        scene.poleLeft.x = scene.finishLine.x - scene.finishLine.width / 2;
                        scene.poleRight.x = scene.finishLine.x + scene.finishLine.width / 2;
                    }
                }
            });
        }
    }

    // Setup HUD and controls
    scene.setupHUD();
    scene.setupKeyboard();
}