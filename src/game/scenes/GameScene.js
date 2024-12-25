import Phaser from 'phaser';

const roadLineColor = 0xFF61C6;
const roadColor1 = 0x160E21;
const roadColor2 = 0x190D23;
const rumbleColor1 = 0xC756E7;
const grassColor1 = 0x0E0C1D;

let lines = [0];
let colors = [0];
let numLines = 1;
let count = 0;
let isGrey = false;
let speed = 0.5;
let animationSpeed = 1; // Separate variable for controlling the animation speed
let startGame = false;

let levels;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const topWidth = WIDTH / 4;
let bottomWidth = 0;


export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.dots = '';
        this.dotCounter = 0;
        this.timer = 0;
        this.gameRuning = false;
        this.sceneEnemies = [];
        this.roadFun = 0
    }

    preload() {
        // Load the road spritesheet
        this.load.spritesheet('frontCar', 'img/frontCar.png', { frameWidth: 50, frameHeight: 33 });
        this.load.spritesheet('enemyWhite', 'img/whiteFront.png', { frameWidth: 53, frameHeight: 32 });
        this.load.spritesheet('enemyBlue', 'img/blueFront.png', { frameWidth: 53, frameHeight: 32 });
        this.load.spritesheet('enemyPink', 'img/pinkFront.png', { frameWidth: 53, frameHeight: 33 });

        this.load.spritesheet('carLeft', 'img/carLeft.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('rightCar', 'img/rightCar.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('idleRight', 'img/idleRight.png', { frameWidth: 56, frameHeight: 33 });
        this.load.spritesheet('lakituStart', 'img/lakitu.png', { frameWidth: 500, frameHeight: 410 });
        this.load.image('background', 'img/background.png');
        this.load.json('levels', 'levels.json');

    }

    create() {
        this.getLevel();

        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(WIDTH, HEIGHT/2);
        background.setDepth(0);

        this.info = this.add.graphics();
        this.info.setDepth(3);

        this.graphics = this.add.graphics();
        this.graphics.setDepth(1);

        this.loadingScreen = this.add.graphics();
        this.loadingScreen.setDepth(10);

        // Add Player Car animations
        animations(this);

        // Add the player car sprite
        this.player = this.add.sprite(WIDTH/2, HEIGHT - HEIGHT/15, 'frontCar').setScale(2).setDepth(1);
        this.player.anims.play('frontCar', true);
        this.player.setData('health', 100);

        this.lakitu = this.add.sprite(0, HEIGHT, 'lakituStart').setScale(0).setDepth(2);

        // Setup keyboard input
        this.addSpeedKey = this.input.keyboard.addKey('W');
        this.subSpeedKey = this.input.keyboard.addKey('S');
        this.leftKey = this.input.keyboard.addKey('A');
        this.rightKey = this.input.keyboard.addKey('D');

        // Initialize the update iteration
        this.updateIteration = 0;
        loeadEnemies(this, levels.levels[0].enemies);


        this.distance = levels.levels[0].roadLength;
        this.elapsedDistance = 0;



    }


    update(time, delta) {
        this.updateIteration ++;
        movement(this, this.player);
        animatedRoad(this.graphics, this, delta);
        showInformations(this);

    }

    startTimer(){
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

    getLevel(){
        levels = this.cache.json.get('levels');
        console.log(levels);

        const currentLevel = levels.levels[0];

        currentLevel.enemies.forEach(enemy => {
            // Example: Place enemies at their positions based on the data as a red circle
            console.log(`Enemy at ${enemy.position}, appearing at ${enemy.appearanceTime}`);
        });

    }

}

function movement(scene, player) {
    const SPEED = 5;

    if (scene.leftKey.isDown) {
        player.x -= SPEED;
        player.anims.play('carLeft', true);
    } else if (scene.rightKey.isDown) {
        player.x += SPEED;
        player.anims.play('rightCar', true);
    } else {
        if (player.x > innerWidth / 2) {
            player.anims.play('idleRight', true);
        } else {
            player.anims.play('frontCar', true);
        }
    }

    if (scene.addSpeedKey.isDown) {
        animationSpeed *= 1.05; // Increase animation speed by 5%
    } else if (scene.subSpeedKey.isDown) {
        animationSpeed /= 1.05; // Decrease animation speed by 5%
    }
}

function animatedRoad(graphics, scene, delta) {
    const WIDTH = scene.scale.width;
    const HEIGHT = scene.scale.height / 2;
    let roadMaxWidth = 0


    graphics.clear();

    // Draw the horizon line
    graphics.lineStyle(1, roadLineColor, 1);
    graphics.moveTo(0, HEIGHT);
    graphics.lineTo(WIDTH, HEIGHT);

    if (lines.length > 1) {
        const topGrassColor = colors[0] === 0 ? grassColor1 : grassColor1;
        const topRoadColor = colors[0] === 0 ? roadColor1 : roadColor2;
        const rumbleColor = colors[0] === 0 ? rumbleColor1 : rumbleColor1;


        graphics.fillStyle(topGrassColor, 1);
        graphics.fillRect(0, HEIGHT, WIDTH, HEIGHT * 2);

        // Top trapezoid
        graphics.fillStyle(topRoadColor, 1);
        graphics.beginPath();
        graphics.moveTo(WIDTH / 2 - WIDTH / 10, HEIGHT);                      // Top-left point
        graphics.lineTo(WIDTH / 2 + WIDTH / 10, HEIGHT);                      // Top-right point
        graphics.lineTo(WIDTH / 2 + WIDTH / 10 + lines[0], HEIGHT + lines[0]);                  // Bottom-right point
        graphics.lineTo(WIDTH / 2 - lines[0] - WIDTH / 10, HEIGHT + lines[0]);                  // Bottom-left point
        graphics.closePath();
        graphics.fillPath();

    }

    // Draw trapezoids and grass
    for (let i = 0; i < numLines - 1; i++) {
        const x1 = lines[i] + WIDTH / 8;

        const x2 = lines[i + 1] + WIDTH / 8;
        let x1N = 0;
        let x2N = 0;

        if(!startGame){
            roadMaxWidth = x1;
            console.log(roadMaxWidth);
        }

        if (lines.length > 1) {
            x1N = lines[i+1] + WIDTH / 8;
        }
        const roadColor = colors[i] === 0 ? roadColor1 : roadColor2;
        const grassColor = colors[i] === 0 ? grassColor1 : 0x00ff00;
        const rumbleColor = colors[i] === 0 ? rumbleColor1 : rumbleColor1;

        // Draw left grass
        graphics.fillStyle(grassColor, 1);
        graphics.lineStyle(2, roadLineColor, 1);
        graphics.strokeRect(0, HEIGHT + lines[i], WIDTH / 2 - x1, lines[i + 1] - lines[i]);


        // Draw right grass
        graphics.strokeRect(WIDTH / 2 + x1, HEIGHT + lines[i], WIDTH - (WIDTH / 2 + x1), lines[i + 1] - lines[i]);
        graphics.lineStyle(0);
        // Draw trapezoid
        graphics.fillStyle(roadColor, 1);
        graphics.beginPath();
        graphics.moveTo(WIDTH / 2 - x1, HEIGHT + lines[i]);                      // Top-left point
        graphics.lineTo(WIDTH / 2 + x1, HEIGHT + lines[i]);                      // Top-right point
        graphics.lineTo(WIDTH / 2 + x2, HEIGHT + lines[i + 1]);                  // Bottom-right point
        graphics.lineTo(WIDTH / 2 - x2, HEIGHT + lines[i + 1]);                  // Bottom-left point
        graphics.closePath();
        graphics.fillPath();

        let addWidth = lines[i]/15 > 2 ? lines[i]/15 : 2 ;

        graphics.fillStyle(rumbleColor, 1);
        graphics.beginPath();
        graphics.moveTo(WIDTH / 2 - x1, HEIGHT + lines[i]);
        graphics.lineTo(WIDTH / 2 - x1 - addWidth, HEIGHT + lines[i]);
        graphics.lineTo(WIDTH / 2 - x1N - addWidth, HEIGHT + lines[i + 1]);
        graphics.lineTo(WIDTH / 2 - x1N, HEIGHT + lines[i + 1]);
        graphics.closePath();
        graphics.fillPath();

        graphics.fillStyle(rumbleColor, 1);
        graphics.beginPath();
        graphics.moveTo(WIDTH / 2 + x1, HEIGHT + lines[i]);
        graphics.lineTo(WIDTH / 2 + x1 + addWidth, HEIGHT + lines[i]);
        graphics.lineTo(WIDTH / 2 + x1N + addWidth, HEIGHT + lines[i + 1]);
        graphics.lineTo(WIDTH / 2 + x1N, HEIGHT + lines[i + 1]);
        graphics.closePath();
        graphics.fillPath();
    }

    // Update line positions uniformly
    for (let i = 0; i < numLines; i++) {
        const heightIncrement = 10 * (i + 1) * 0.1;
        lines[i] += heightIncrement * animationSpeed;  // Adjust height increment and apply animation speed
    }
    count += 1;
    // Adding new lines
    if (count > 6 / animationSpeed) { // Adjusting the speed of new lines
        count = 0;
        lines.unshift(0); // new line added at the beginning of the array
        const color = isGrey ? 1 : 0;
        isGrey = !isGrey;
        colors.unshift(color);
        numLines += 1;
    }

    // Removing excess lines
    if (numLines > 100) {
        lines.pop();
        colors.pop();
        numLines -= 1;
    }

    if(lines[lines.length-1] < scene.scale.height) {
        scene.dotCounter++;
        if (scene.dotCounter % 30 === 0) {
            // Adjust the modulus value to control the speed of dots appearance
            scene.dots += '.';
            if (scene.dots.length > 3) {
                scene.dots = '';
            }
        }
        drawLoading(scene, Math.floor(delta / 1000), scene.dots);
    } else {
        if (!startGame) {
            bottomWidth = (roadMaxWidth)/5;
            scene.player.scale = bottomWidth/53;
            scene.player.originY = 1;
            scene.player.y = HEIGHT*2 - scene.player.height;
            animationSpeed = 0.00007;
            scene.time.addEvent({
                delay: 1000,
                callback: () => {
                    removeLoading(scene);
                    startGame = true;
                    scene.tweens.add({
                        targets: scene.lakitu,
                        x: {
                            value: WIDTH / 3, // Final X position
                            ease: 'Cosine.easeInOut' // Ease for smoother arc movement
                        },
                        y: {
                            value: HEIGHT / 3 + HEIGHT/7, // Final Y position
                            ease: 'Cubic.easeOut' // Easing to give an arc-like effect
                        },
                        scale: ((HEIGHT*2)/4)/410, // Scale it up to normal size
                        duration: 2000, // Duration of the tween in milliseconds
                        onComplete: () => {
                            // Tween to move to the second position (width / 2)
                            scene.lakitu.anims.play('lakituStart', true);
                            scene.lakitu.on('animationcomplete', () => {
                                scene.lakitu.anims.stop();
                                scene.tweens.add({
                                    targets: scene.lakitu,
                                    x:{
                                        value: WIDTH,
                                        ease: 'Cubic.easeIn'
                                    },
                                    y:{
                                        value: 0,
                                        ease: 'Cosine.easeOut'
                                    },
                                    scale: 0,
                                    duration: 2000,
                                });
                            });
                            moveEnemies(scene, scene.sceneEnemies[0], roadMaxWidth);

                        }
                    });
                },
                loop: false
            });
        }
    }


}

function animations(scene){
    scene.anims.create({
        key: 'frontCar',
        frames: scene.anims.generateFrameNumbers('frontCar', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'idleRight',
        frames: scene.anims.generateFrameNumbers('idleRight', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'carLeft',
        frames: scene.anims.generateFrameNumbers('carLeft', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'rightCar',
        frames: scene.anims.generateFrameNumbers('rightCar', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'lakituStart',
        frames: scene.anims.generateFrameNumbers('lakituStart', { start: 0, end: 3 }),
        frameRate: 1,
        repeat: 0
    });

    scene.anims.create({
        key: 'enemyWhite',
        frames: scene.anims.generateFrameNumbers('enemyWhite', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'enemyBlue',
        frames: scene.anims.generateFrameNumbers('enemyBlue', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'enemyPink',
        frames: scene.anims.generateFrameNumbers('enemyPink', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });



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
        scene.loadingText.setText("Loading" + dots);
    }
}

function removeLoading(scene) {
    scene.loadingScreen.clear();
    scene.loadingText.destroy();
}


function showInformations(scene){
    const DASHBOARD_HEIGHT = scene.scale.height/10;
    const DASHBOARD_COLOR = 0x321950;
    const DASHBOARD_OUTLINE = 0x201033;
    const TEXT_COLOR = '#FFFFFF';

    let speed = (animationSpeed/2.75)*120;

    scene.info.clear();

    scene. info.fillStyle(DASHBOARD_COLOR, 1);
    scene.info.fillRect(0, 0, scene.scale.width, DASHBOARD_HEIGHT);
    scene.info.lineStyle(scene.scale.width/200,DASHBOARD_OUTLINE, 1);
    scene.info.strokeRect(0, 0, scene.scale.width, DASHBOARD_HEIGHT);
    scene.info.lineStyle(0);
    scene.info.fillCircle(0, 0, DASHBOARD_HEIGHT*2);
    scene.info.fillCircle(scene.scale.width, 0, DASHBOARD_HEIGHT*2);
    scene.info.fillStyle(DASHBOARD_COLOR, 1);
    scene.info.lineStyle(scene.scale.width/200,DASHBOARD_OUTLINE, 1);
    scene.info.strokeCircle(0, 0, DASHBOARD_HEIGHT*2);
    scene.info.strokeCircle(scene.scale.width, 0, DASHBOARD_HEIGHT*2);

    if(!scene.speedText) {
        scene.speedText = scene.add.text(10, DASHBOARD_HEIGHT / 2, Math.trunc(speed) + " km/h", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: TEXT_COLOR,
        }).setOrigin(-0.2, 0).setDepth(4);
    } else {
        scene.speedText.setText(Math.trunc(speed) + "\nkm/h");
    }
    if(!scene.healthText){
        scene.healthText = scene.add.text(DASHBOARD_HEIGHT*2 + 10, DASHBOARD_HEIGHT / 2, "Health: 100%", {
            fontSize: `${scene.scale.width/50}px`,
            fill: TEXT_COLOR,
        }).setOrigin(0,0.5).setDepth(4);
    } else {
        scene.healthText.setText("Health:" + scene.player.getData('health') + "%");
    }
    if(!scene.timeText){
        scene.timeText = scene.add.text(scene.scale.width/2, DASHBOARD_HEIGHT / 2, "Time: " + scene.timer + "s", {
            fontSize: `${scene.scale.width/50}px`,
            fill: TEXT_COLOR,
        }).setOrigin(0.5,0.5).setDepth(4);
    } else {
        scene.timeText.setText("Time: " + scene.timer + "s");
    }
    if(!scene.distanceText){
        scene.distanceText = scene.add.text(scene.scale.width - DASHBOARD_HEIGHT*2 - 10, DASHBOARD_HEIGHT / 2, "Distance: 0m", {
            fontSize: `${scene.scale.width/50}px`,
            fill: TEXT_COLOR,
        }).setOrigin(1,0.5).setDepth(4);
    } else {
        scene.distanceText.setText("Distance: " + Math.trunc(scene.player.y) + "m");
    }
    if(!scene.levelText){
        scene.levelText = scene.add.text(scene.scale.width - 10, DASHBOARD_HEIGHT / 2, "Level: 1", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: TEXT_COLOR,
        }).setOrigin(1,0.5).setDepth(4);
    } else {
        scene.levelText.setText("Level: 1");
    }

}

function loeadEnemies(scene, enemies){
    let carColors = ['enemyWhite', 'enemyBlue', 'enemyPink'];
    let enemyX = 0;
    enemies.forEach(enemy => {
        switch (enemy.position) {
            case 'left':
                enemyX = WIDTH/2 - topWidth/3;
                break;
            case 'middle':
                enemyX = WIDTH/2;
                break;
            case 'right':
                enemyX = WIDTH/2 + topWidth/3;
                break;
        }
        // Example: Place enemies at their positions based on the data as a red circle
        const newEnemy = scene.add.sprite(enemyX, HEIGHT/2, 'enemyWhite').setScale(2).setDepth(2);
        console.log(`Enemy at ${enemy.position}, appearing at ${enemy.appearanceTime}`);

        newEnemy.scale = 0;
        newEnemy.anims.play(getRandomItem(carColors), true);
        newEnemy.setDepth(2);
        newEnemy.x = enemyX;
        newEnemy.originX = 0.5;
        newEnemy.originY = 1;
        scene.sceneEnemies.push(newEnemy);  // Add the enemy to the sceneEnemies array
    });
}

function moveEnemies(scene, enemy, roadMaxWidth){

    moveAndScaleObject(enemy, enemy.x, bottomWidth/3, HEIGHT/2 ,HEIGHT, (topWidth/5)/32, (roadMaxWidth/5)/32, bottomWidth, 5000, scene, roadMaxWidth);

}
function moveAndScaleObject(sprite, startX, X_bottom ,Y_top, Y_bottom, scaleTop, scaleBottom, roadMaxWidth, duration, scene) {
    // Ensure the sprite starts at the correct Y position and X position
    sprite.x = startX;
    sprite.y = Y_top;

    // Set the initial scale based on the scale at the top of the road

    // Create a tween that moves the sprite from top to bottom
    scene.tweens.add({
        targets: sprite,
        y: HEIGHT + 32*(scene.player.scale+1),  // Move towards the almost-bottom Y
        x: WIDTH/2 - 2 * roadMaxWidth,  // Move towards the almost-bottom Y
        ease: 'Linear',  // You can change this to another easing function for smoother motion
        duration: duration,  // The time it takes to move from top to almost bottom
        onUpdate: (tween) => {
            // Interpolate scale based on the vertical position of the sprite
            const scale = Phaser.Math.Linear(scaleTop, scene.player.scale+1, tween.progress);
            sprite.scale = scale;
        }
    });
}







function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}



