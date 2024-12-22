import Phaser from 'phaser';

const w = window.innerWidth;
const h = window.innerHeight;
const s = w / 2;
const k = 0.1; // Road curvature
let roadSegments = [];
let lines = [0];
let colors = [0];
let numLines = 10;
let count = 0;
let isGrey = false;
let speed = 0.5;
let animationSpeed = 1; // Separate variable for controlling the animation speed

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load the road spritesheet
        this.load.spritesheet('frontCar', 'frontCar.png', { frameWidth: 50, frameHeight: 33 });
        this.load.spritesheet('carLeft', 'carLeft.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('rightCar', 'rightCar.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('idleRight', 'idleRight.png', { frameWidth: 56, frameHeight: 33 });
    }

    create() {
        this.graphics = this.add.graphics();

        this.anims.create({
            key: 'frontCar',
            frames: this.anims.generateFrameNumbers('frontCar', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idleRight',
            frames: this.anims.generateFrameNumbers('idleRight', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'carLeft',
            frames: this.anims.generateFrameNumbers('carLeft', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'rightCar',
            frames: this.anims.generateFrameNumbers('rightCar', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        // Add the player car sprite
        this.player = this.add.sprite(200, 300, 'frontCar').setScale(2);
        this.player.anims.play('frontCar', true);

        // Setup keyboard input
        this.addSpeedKey = this.input.keyboard.addKey('W');
        this.subSpeedKey = this.input.keyboard.addKey('S');
        this.leftKey = this.input.keyboard.addKey('A');
        this.rightKey = this.input.keyboard.addKey('D');

        this.updateIteration = 0;
    }


    update(time, delta) {
        this.updateIteration ++;
        movement(this, this.player);
        animatedRoad(this.graphics, this, delta);
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

    graphics.clear();

    // Draw the horizon line
    graphics.lineStyle(1, 0x000000, 1);
    graphics.moveTo(0, HEIGHT);
    graphics.lineTo(WIDTH, HEIGHT);

    if (lines.length > 1) {
        const topGrassColor = colors[0] === 0 ? 0x00ff00 : 0x006400;
        const topRoadColor = colors[0] === 0 ? 0x808080 : 0xA9A9A9;
        const rumbleColor = colors[0] === 0 ? 0xffff00 : 0xff0000;

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
        const x1 = lines[i] + WIDTH / 10;
        const x2 = lines[i + 1] + WIDTH / 10;
        let x1N = 0;
        let x2N = 0;

        if (lines.length > 1) {
            x1N = lines[i+1] + WIDTH / 10;
        }
        const roadColor = colors[i] === 0 ? 0xA9A9A9 : 0x808080;
        const grassColor = colors[i] === 0 ? 0x006400 : 0x00ff00;
        const rumbleColor = colors[i] === 0 ? 0xffff00 : 0xff0000;

        // Draw left grass
        graphics.fillStyle(grassColor, 1);
        graphics.fillRect(0, HEIGHT + lines[i], WIDTH / 2 - x1, lines[i + 1] - lines[i]);

        // Draw right grass
        graphics.fillRect(WIDTH / 2 + x1, HEIGHT + lines[i], WIDTH - (WIDTH / 2 + x1), lines[i + 1] - lines[i]);

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
}



