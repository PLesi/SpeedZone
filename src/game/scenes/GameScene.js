import Phaser from 'phaser';

const COLORS = {
    roadLineColor: 0xFF61C6,    // Pink
    roadColor1: 0x160E21,       // Dark purple
    roadColor2: 0x190D23,       // Darker purple
    rumbleColor1: 0xC756E7,     // Light purple
    grassColor1: 0x0E0C1D,      // Darkest purple
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

// VARIABLES TO TAKE FROM LS
let lines = [0];
let colors = [0];
let numLines = 1;
let count = 0;
let isGrey = false;
let animationSpeed = 1; // Separate variable for controlling the animation speed
let speed = 0;
let startGame = false;
let greenLight = false;
let levels;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const topWidth = WIDTH / 4;
let bottomWidth = 0;
let elapsedDistance = 0;// LS
let spawnedEnemies = 0; // LS


export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.dots = '';
        this.dotCounter = 0;
        this.timer = 0;
        this.sceneEnemies = [];

        this.currentLevel = 1;
        this.dificulty = 1;
    }

    preload() {
        this.loadAssets();
    }

    create() {
        this.setupGraphics();
        this.setupFinishLine();
        this.createAnimations();
        this.setupKeyboard(); // TODO: setup gyroscope and mouse input
        this.setupPlayer();
        this.getLevel();
        this.setupEnemies();
        this.setupHUD();

        // Initialize the update iteration
    }

    update(time, delta) {
        this.movement();
        this.roadMovement(delta);
        this.racePreparations();
        this.updateHUD();
    }

    loadAssets(){
        this.assets = [
            { key:'frontCar',   path:'img/frontCar.png',   frame: { frameWidth:  50, frameHeight:  33 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'whiteFront', path:'img/whiteFront.png', frame: { frameWidth:  48, frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'whiteSLeft', path:'img/whiteSLeft.png', frame: { frameWidth: 53.5,frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'whiteSRight',path:'img/whiteSRight.png',frame: { frameWidth: 53.5,frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'blueFront',  path:'img/blueFront.png',  frame: { frameWidth:  48, frameHeight:  27 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'blueSLeft',  path:'img/blueSLeft.png',  frame: { frameWidth:  54, frameHeight:  27 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'blueSRight', path:'img/blueSRight.png', frame: { frameWidth:  54, frameHeight:  27 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'pinkFront',  path:'img/pinkFront.png',  frame: { frameWidth:  48, frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'pinkSLeft',  path:'img/pinkSLeft.png',  frame: { frameWidth:  54, frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'pinkSRight', path:'img/pinkSRight.png', frame: { frameWidth:  54, frameHeight:  28 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'carLeft',    path:'img/carLeft.png',    frame: { frameWidth:  59, frameHeight:  31 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'rightCar',   path:'img/rightCar.png',   frame: { frameWidth:  59, frameHeight:  31 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'redSRight',  path:'img/redSRight.png',  frame: { frameWidth:  54, frameHeight:  31 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'redSLeft',   path:'img/redSLeft.png',   frame: { frameWidth:  54, frameHeight:  31 }, type:'spriteSheet', start: 0, end:  1, frameRate: 10, repeat: -1 },
            { key:'lakituStart',path:'img/lakitu.png',     frame: { frameWidth: 500, frameHeight: 410 }, type:'spriteSheet', start: 0, end:  3, frameRate:  1, repeat:  0 },
            { key:'explosion',  path:'img/explosion.png',  frame: { frameWidth:  80, frameHeight:  48 }, type:'spriteSheet', start: 0, end: 11, frameRate: 15, repeat:  0 },
            { key:'finish',     path:'img/finish.png',     type: 'image'},
            { key:'background', path:'img/background.png', type: 'image'},
            { key:'levels',     path:'levels.json',        type: 'json' },
        ];
        this.assets.forEach(asset => {
            switch(asset.type){
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
    createAnimations(){
        this.assets.forEach(asset => {
            if (asset.type === 'spriteSheet') {
                this.anims.create({
                    key: asset.key,
                    frames: this.anims.generateFrameNumbers(asset.key, {start: asset.start, end: asset.end}),
                    frameRate: asset.frameRate,
                    repeat: asset.repeat
                });
            }
        });
    }

    setupGraphics(){
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(WIDTH, HEIGHT/2).setDepth(0);
        this.info = this.add.graphics().setDepth(3);
        this.graphics = this.add.graphics().setDepth(1);
        this.loadingScreen = this.add.graphics().setDepth(10);
    }

    setupHUD(){
        const DASHBOARD_HEIGHT = this.scale.height/10;

        this.info.clear();
        createGradientShape(this, WIDTH/2, DASHBOARD_HEIGHT/2, WIDTH, DASHBOARD_HEIGHT, COLORS.gradient1,  COLORS.gradient2, 'rectangle');
        this.info.lineStyle(WIDTH/150,COLORS.hudOutline, 1);
        this.info.strokeRect(0, 0, WIDTH, DASHBOARD_HEIGHT);
        this.info.lineStyle(0);
        createGradientShape(this, 0, 0, DASHBOARD_HEIGHT*4, DASHBOARD_HEIGHT*4, COLORS.gradient1,  COLORS.gradient2, 'circle');
        createGradientShape(this, WIDTH, 0, DASHBOARD_HEIGHT*4, DASHBOARD_HEIGHT*4, COLORS.gradient1,  COLORS.gradient2,'circle');
        this.info.lineStyle(WIDTH/150,COLORS.hudOutline, 1);
        this.info.strokeCircle(0, 0, DASHBOARD_HEIGHT*2);
        this.info.strokeCircle(WIDTH, 0, DASHBOARD_HEIGHT*2);

        this.speedText = this.add.text(10, DASHBOARD_HEIGHT / 2, Math.trunc(speed) + " km/h", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: COLORS.textColor,
        }).setOrigin(-0.2, 0).setDepth(4);

        this.healthText = this.add.text(DASHBOARD_HEIGHT*2 + 10, DASHBOARD_HEIGHT / 2, "Health: 100%", {
            fontSize: `${this.scale.width/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(0,0.5).setDepth(4);

        this.timeText = this.add.text(this.scale.width/2, DASHBOARD_HEIGHT / 2, "Time: " + this.timer + "s", {
            fontSize: `${this.scale.width/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(0.5,0.5).setDepth(4);

        this.distanceText = this.add.text(this.scale.width - DASHBOARD_HEIGHT*2 - 10, DASHBOARD_HEIGHT / 2, "Distance: 0m", {
            fontSize: `${this.scale.width/50}px`,
            fill: COLORS.textColor,
        }).setOrigin(1,0.5).setDepth(4);

        this.levelText = this.add.text(this.scale.width - 10, DASHBOARD_HEIGHT / 2, "Level: 1", {
            fontSize: `${DASHBOARD_HEIGHT/3}px`,
            fill: COLORS.textColor,
        }).setOrigin(1,0.5).setDepth(4);
    }

    updateHUD(){
        // TODO: Update the HUD elements
        let speed = (animationSpeed/2.75)*120; // Convert the speed to km/h
        this.speedText.setText(Math.trunc(speed) + "\nkm/h");
        this.healthText.setText("Health:" + this.player.getData('health') + "%");
        this.timeText.setText("Time: " + this.timer + "s");
        this.distanceText.setText("Distance: " + Math.round(elapsedDistance * 100)/100 + "Km");
        this.levelText.setText("Level: 1");
    }

    setupFinishLine(){
        let finishLineY = HEIGHT - HEIGHT/3
        this.finishLine = this.add.tileSprite(
            WIDTH/2,
            finishLineY,
            2* (WIDTH/8),
            HEIGHT/50,
            'finish'
        ).setDepth(0);
        this.finishLine.tileScaleX = 0.1;
        this.finishLine.tileScaleY = 0.1;
        this.poleLeft = this.add.rectangle(WIDTH/2 - WIDTH/8, finishLineY  , 2, 4*HEIGHT/50, COLORS.poleColor).setDepth(0).setOrigin(0.5, 0);
        this.poleRight = this.add.rectangle(WIDTH/2 + WIDTH/8, finishLineY, 2, 4*HEIGHT/50, COLORS.poleColor).setDepth(0).setOrigin(0.5, 0);
    }

    moveFinishLine(){
        this.tweens.add({
            targets: [this.poleLeft, this.poleRight],
            y: HEIGHT/2 - HEIGHT/10 + this.finishLine.height/2,
            duration: 2500,
            onUpdate: (tween) => {
                this.finishLine.y = this.poleLeft.y;
            },
            onComplete: () =>{
                this.finishLine.setDepth(10);
                this.poleLeft.setDepth(10);
                this.poleRight.setDepth(10);
                this.tweens.add({
                    targets: this.finishLine,
                    y: HEIGHT - this.player.height*4,
                    height: this.player.height*this.player.scale,
                    width: WIDTH - bottomWidth/2,
                    tileScaleX: 0.3,
                    tileScaleY: 0.3,
                    duration: 1500,
                    onUpdate: (tween) => {
                        this.poleLeft.y = this.finishLine.y;
                        this.poleRight.y = this.finishLine.y;
                        this.poleLeft.x = this.finishLine.x - this.finishLine.width/2;
                        this.poleRight.x = this.finishLine.x + this.finishLine.width/2;

                        this.poleLeft.height = tween.progress * this.player.height*4*this.player.scale;
                        this.poleRight.height = tween.progress * this.player.height*4*this.player.scale;

                        this.poleRight.width = tween.progress * (this.player.width/20)*this.player.scale;
                        this.poleLeft.width = tween.progress * (this.player.width/20)*this.player.scale;
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
                                       // this.scene.start('VictoryScene', { time: this.timer, distance: Math.round(elapsedDistance * 100)/100, level: 1, health: this.player.getData('health') });

                                    }
                                });

                            }

                        });

                        //TODO: get rid of finish line, poles
                        //      fade out this scene, go to new scene
                        //      make new scene with buttons to go to next level or retry or menu

                        //start new scene
                    }
                });

            }

        })



    }

    setupPlayer(){
        this.player = this.physics.add.sprite(WIDTH/2, HEIGHT - HEIGHT/15, 'frontCar').setScale(2).setDepth(1);
        this.player.anims.play('frontCar', true);
        this.player.setData('health', 100);
        this.player.body.setCollideWorldBounds(true);
        this.updatePlayerCollider();
        this.player.body.setOffset(0, this.player.height * 0.1);
    }

    updatePlayerCollider(){
        this.player.body.setSize(this.player.width, this.player.height * 0.8);
    }


    setupEnemies(){
        let enemyX = 0;
        this.currentLevel.enemies.forEach(enemy => {
            let animationKey = null;
            switch (enemy.startPosition) {
                case 'left':
                    enemyX = WIDTH/2 - topWidth/3;
                    animationKey = getRandomItem(CAR_RIGHT);
                    break;
                case 'middle':
                    enemyX = WIDTH/2;
                    animationKey = getRandomItem(CAR_COLORS);
                    break;
                case 'right':
                    enemyX = WIDTH/2 + topWidth/3;
                    animationKey = getRandomItem(CAR_LEFT);
                    break;
            }
            let newEnemy = this.physics.add.sprite(enemyX, HEIGHT/2, 'whiteFront').setScale(0).setDepth(2).setOrigin(0.5, 1);
            newEnemy.x = enemyX;        // LS
            newEnemy.startPosition = enemy.startPosition;
            newEnemy.anims.play(animationKey, true);
            newEnemy.body.setSize(newEnemy.width, newEnemy.height * 0.8);
            newEnemy.body.setOffset(0, newEnemy.height * 0.1);
            newEnemy.setData('appearanceTime', enemy.appearanceTime);
            newEnemy.setData('onScreen',false);
            newEnemy.setData('collided', false);
            this.physics.add.overlap(this.player, newEnemy, this.handleCollision, null, this);

            this.sceneEnemies.push(newEnemy);  // Add the enemy to the sceneEnemies array
            // SAVE ENEMY X FROM ARRAY TO LS
        });
    }

    handleCollision(player, enemy) {

        if (enemy.getData('collided')) {
            return;
        }

        enemy.setData('collided', true);

        speed /= 2;
        this.moveFinishLine();
        this.player.setData('health', this.player.getData('health') - this.currentLevel.enemyDamage); // Decrease the player's health
        this.physics.world.removeCollider(enemy); // Remove the collider to prevent multiple collisions

        let explosion = this.add.sprite(enemy.x, enemy.y, 'explosion').setScale(2).setDepth(2);
        explosion.anims.play('explosion', true);

        explosion.once('animationcomplete', () => {
            explosion.destroy(); // Destroy the explosion sprite
            enemy.destroy();     // Destroy the enemy
        });
        enemy.setVisible(false);
    }

    spawnEnemy(enemyID){
        if(enemyID >= this.sceneEnemies.length)
            return;

        let enemy = this.sceneEnemies[enemyID];
        console.log(enemy.getData('appearanceTime') + " " + Math.round(elapsedDistance * 100)/100);
        if(enemy.getData('appearanceTime') <= Math.round(elapsedDistance * 100)/100 && enemy.getData('onScreen') === false){
           enemy.setData('onScreen', true);
          spawnedEnemies++;
           this.tweens.add({
               targets: enemy,
               y: HEIGHT/2,
               scale: (topWidth/5)/32,
               duration: 1500,
               onComplete: () => {
                   this.moveEnemy(enemy);
               }
           });
       }
    }

    moveEnemy(enemy){
        if(enemy) {
            let direction = 0
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
                y: HEIGHT + 32 * (this.player.scale + 0.5),
                ease: 'Linear',
                duration: duration,
                onUpdate: (tween) => {
                    enemy.scale = Phaser.Math.Linear(initialScale, this.player.scale + 1, tween.progress);
                }
            });
        }
    }



    roadMovement(delta){
        const halfWidth = WIDTH / 2;
        const halfHeight = this.scale.height / 2;
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
            graphics.fillRect(0,halfHeight, WIDTH, HEIGHT);
            //draw top road trapzoid
            drawPolygon(graphics, halfWidth - WIDTH/10, halfWidth + WIDTH/10, halfWidth + WIDTH/10 + lines[0], halfWidth + WIDTH/10 + lines[0], halfHeight, halfHeight+lines[0], topRoadColor);
            drawPolygon(graphics, halfWidth - WIDTH/8, halfWidth - WIDTH/8 - 2, halfWidth - WIDTH/8 - 2 - lines[0], halfWidth - WIDTH/8 - lines[0], halfHeight, halfHeight + lines[0], COLORS.rumbleColor1);
            drawPolygon(graphics, halfWidth + WIDTH/8, halfWidth + WIDTH/8 + 2, halfWidth + WIDTH/8 + 2 +  lines[0],  halfWidth + WIDTH/8 +  lines[0], halfHeight, halfHeight + lines[0], COLORS.rumbleColor1);
        }

        // Draw road segments
        for (let i = 0; i < numLines - 1; i++) {
            const x1 = lines[i] + WIDTH / 8;
            const x2 = lines[i + 1] + WIDTH / 8;
            if (!startGame)
                roadMaxWidth = x1;
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

        if (lines[lines.length - 1] < this.scale.height) {
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

            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    removeLoading(this);
                    startGame = true;
                    this.tweens.add({
                        targets: this.lakitu,
                        x: { value: WIDTH / 3, ease: 'Cosine.easeInOut' },
                        y: { value: WIDTH/6 + WIDTH/14, ease: 'Cubic.easeOut' },
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
                                    x: { value: WIDTH, ease: 'Cubic.easeIn' },
                                    y: { value: 0, ease: 'Cosine.easeOut' },
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
    }
    racePreparations(){
        if (greenLight) {
           if(speed < this.currentLevel.speed){
              this.addSpeed();
           }
            this.startTimer();
            elapsedDistance =( ((speed/2.75)*120) / 3600 ) * this.timer;
            this.spawnEnemy(spawnedEnemies);
        }
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

        this.currentLevel = levels.levels[0];   //TODO add random level selection, and dificulty...and make sure im not repeating levels i played before. LocalStorage?
        this.dificulty = this.currentLevel.dificulty;

        this.currentLevel.enemies.forEach(enemy => {
            // Example: Place enemies at their positions based on the data as a red circle
            console.log(`Enemy at ${enemy.startPosition}, appearing at ${enemy.appearanceTime}`);
        });
    }

    setupKeyboard(){
        this.addSpeedKey = this.input.keyboard.addKey('W'); //TODO DELETE THESE TWO
        this.subSpeedKey = this.input.keyboard.addKey('S');
        this.leftKey = this.input.keyboard.addKey('A');
        this.rightKey = this.input.keyboard.addKey('D');
    }

    movement() {
        const baseSpeed = WIDTH / 800;
        let steerSpeed = baseSpeed * animationSpeed;

        if (this.leftKey.isDown) {
            this.player.x -= steerSpeed;
            this.player.anims.play('carLeft', true);
            this.updatePlayerCollider();

        } else if (this.rightKey.isDown) {
            this.player.x += steerSpeed;
            this.player.anims.play('rightCar', true);
            this.updatePlayerCollider();

        } else {
            if (this.player.x >= WIDTH/2 + WIDTH/10) {
                this.player.anims.play('redSLeft', true);
                this.updatePlayerCollider();

                //TODO MAKE AN ANIMATION FOR WHEN CAR IS ON RIGHT SIDE
            }else if (this.player.x <= WIDTH/2 - WIDTH/10) {
                this.player.anims.play('redSRight', true);
                this.updatePlayerCollider();
            }
            else {
                this.player.anims.play('frontCar', true); //TODO do these animations when is middle of car on same x as is start of top line or end
                this.updatePlayerCollider();
            }
        }
    }

    addSpeed() {
        if (speed !== this.currentLevel.speed) {
            let startTime = Date.now(); // Record start time
            let currentSpeed = speed; // Store the initial speed
            let duration = 3000; // Time to reach the desired speed in milliseconds

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

}

function drawPolygon(graphics, x1, x2, x3, x4, y1, y2, color) {
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    graphics.moveTo(x1,y1);
    graphics.lineTo(x2,y1);
    graphics.lineTo(x3,y2);
    graphics.lineTo(x4,y2);
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
        scene.loadingText.setText("Loading" + dots);
    }
}

function removeLoading(scene) {
    scene.loadingScreen.clear();
    scene.loadingText.destroy();
}

let gradientCounter = 0;
function createGradientShape(scene, x, y, width, height, color1, color2, shape = 'circle') {
    const uniqueKey = `gradientShape_${gradientCounter++}`; // Generate a unique key

    // Create a canvas texture for the gradient
    const gradientCanvas = scene.textures.createCanvas(uniqueKey, width, height);
    const gradientCtx = gradientCanvas.context;

    // Create the gradient
    const gradient = shape === 'circle'
        ? gradientCtx.createRadialGradient(
            width / 2, height / 2, 0, // Inner circle (center, 0 radius)
            width / 2, height / 2, Math.min(width, height) / 2 // Outer circle (center, full radius)
        )
        : gradientCtx.createLinearGradient(0, 0, 0, height); // Horizontal gradient for rectangle

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


