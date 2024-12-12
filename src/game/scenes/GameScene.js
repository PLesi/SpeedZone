import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load the road spritesheet
        this.load.spritesheet('road', 'road1.png', { frameWidth: 600, frameHeight: 338 });
        this.load.spritesheet('frontCar', 'frontCar.png', { frameWidth: 50, frameHeight: 33 });
        this.load.spritesheet('carLeft', 'carLeft.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('rightCar', 'rightCar.png', { frameWidth: 61, frameHeight: 33 });
        this.load.spritesheet('idleRight', 'idleRight.png', { frameWidth: 56, frameHeight: 33 });
    }

    create() {

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



        // Add the road sprite and set it to a specific frame
        this.road = this.add.sprite(0, 0, 'road').setOrigin(0, 0).setFrame(0);

        // Enable image smoothing for better quality
        this.textures.get('road').setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Set displayWidth and displayHeight to match the screen dimensions
        this.road.displayWidth = this.scale.width;
        this.road.displayHeight = this.scale.height;

        // Add the player car sprite
        this.player = this.add.sprite(200, 300, 'frontCar').setScale(2);
        this.player.anims.play('frontCar', true);

    }

    update() {
        movement(this, this.player);
    }
}

function movement(scene, player) {
    const SPEED = 5;
    let addSpeed = scene.input.keyboard.addKey('W');
    let subSpeed = scene.input.keyboard.addKey('S');
    let left = scene.input.keyboard.addKey('A');
    let right = scene.input.keyboard.addKey('D');

    if (addSpeed.isDown) {
        player.y -= SPEED;
        player.scaleX -= 0.04;
        player.scaleY -= 0.04;
    } else if (subSpeed.isDown) {
        player.y += SPEED;
    }

    if (left.isDown) {
        player.x -= SPEED;
        player.anims.play('carLeft', true);
    } else if (right.isDown) {
        player.x += SPEED;
        player.anims.play('rightCar', true);
    } else {
        if (player.x > innerWidth / 2) {
            player.anims.play('idleRight', true);
        } else {
        player.anims.play('frontCar', true);
     }
    }
}
