import Phaser from 'phaser';

let segments = [];
let drawnSegments = [];

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
        let graphics = this.add.graphics();



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

        createRoad(this);
        drawRoad(this);


        // Add the player car sprite
        this.player = this.add.sprite(200, 300, 'frontCar').setScale(2);
        this.player.anims.play('frontCar', true);

    }

    update() {
        movement(this, this.player);
        roadMove(this);

    }
}

function movement(scene, player) {
    const SPEED = 5;
    let graphics = scene.add.graphics();
    let addSpeed = scene.input.keyboard.addKey('W');
    let subSpeed = scene.input.keyboard.addKey('S');
    let left = scene.input.keyboard.addKey('A');
    let right = scene.input.keyboard.addKey('D');


    if (addSpeed.isDown) {
        moveRoad(graphics ,scene);
    } else if (subSpeed.isDown) {
        segments.forEach(segment => {
            segment.y1 -= SPEED;
            segment.y2 -= SPEED;

            //redrawRoad(scene);
        });
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


function createRoad(scene){
    const ROAD_COLOR = 0x0999900;
    const ROAD_COLOR2 = 0x808080;
    const GRASS_COLOR = 0x00FF00;
    const GRASS_COLOR2 =  0x1A0A1B;
    const RUMBLE_COLOR = 0x000000;
    //TODO: ADD RUMBLE_COLOR2
    const LANE_COLOR = 0xFFFFFF;
    const LANE_COLOR2 = ROAD_COLOR2;
    const UI_SIZE = 100;
    let ANGLE = scene.scale.width/5;
    const RUMBLE_WIDTH = 20;
    const LANE_WIDTH = 10;
    const ROAD_HEIGHT = scene.scale.height/2;
    const SEGMENT_NUM = 10;
    let curSegHeight = (ROAD_HEIGHT-UI_SIZE)  / 2;

    // ----------------- road -----------------
    let x1 = 0;
    let x2 = scene.scale.width;
    let y1 = scene.scale.height - UI_SIZE;  // Also for road and grass and rumble and lane
    let y2 = y1 - curSegHeight;             // Also for road and grass and rumble and lane
    let x3 = x1 + ANGLE;
    let x4 = x2 - ANGLE;
    // ----------------- rumble -----------------
    let RrX1 = x1 - RUMBLE_WIDTH;           // Right rumble x1
    let RrX2 = x1
    let RrX3 = x3 - RUMBLE_WIDTH;
    let RrX4 = x3;
    let LrX1 = x2;                                  // Left rumble x1
    let LrX2 = x2 + RUMBLE_WIDTH;
    let LrX3 = x4;
    let LrX4 = x4 + RUMBLE_WIDTH;
    // ----------------- lines -----------------
    let LlMiddleB = x1 + (x2 - x1) / 3;     // Left lane middle bottom
    let RlMiddleB = x2 - (x2 - x1) / 3;     // Right lane middle bottom
    let LlMiddleT = x3 + (x4 - x3) / 3;     // Left lane middle top
    let RlMiddleT = x4 - (x4 - x3) / 3;     // Right lane middle top

    let LlX1 = LlMiddleB - LANE_WIDTH/2;     // Left lane x1
    let LlX2 = LlMiddleB + LANE_WIDTH/2;     // Left lane x2
    let LlX3 = LlMiddleT - LANE_WIDTH/2;     // Left lane x3
    let LlX4 = LlMiddleT + LANE_WIDTH/2;     // Left lane x4

    let RlX1 = RlMiddleB - LANE_WIDTH/2;     // Right lane x1
    let RlX2 = RlMiddleB + LANE_WIDTH/2;     // Right lane x2
    let RlX3 = RlMiddleT - LANE_WIDTH/2;     // Right lane x3
    let RlX4 = RlMiddleT + LANE_WIDTH/2;     // Right lane x4

    let start = 0;
    let invisible = 0;
    let road_color = ROAD_COLOR;
    let grass_color = GRASS_COLOR;
    let rumble_color = RUMBLE_COLOR;
    let lane_color = LANE_COLOR;


    //grass x1 and x2 will be still same 0 - max width

    for (let i = 0; i < SEGMENT_NUM; i++) {
        if (i % 2 === 0) {
            road_color = ROAD_COLOR;
            grass_color = GRASS_COLOR;
            rumble_color = RUMBLE_COLOR;
            lane_color = LANE_COLOR2;
        } else {
            road_color = ROAD_COLOR2;
            grass_color = GRASS_COLOR2;
            rumble_color = RUMBLE_COLOR;
            lane_color = LANE_COLOR;
        }
        segments.push({
                id: i,
                invisible: invisible,
                start: start,

                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                x3: x3,
                y3: y2,
                x4: x4,
                y4: y1,

                color: road_color,
                grassColor: grass_color,
                rumbleColor: rumble_color,
                laneColor: lane_color,

                RrX1: RrX1,
                RrX2: RrX2,
                RrX3: RrX3,
                RrX4: RrX4,
                LrX1: LrX1,
                LrX2: LrX2,
                LrX3: LrX3,
                LrX4: LrX4,

                LlX1: LlX1,
                LlX2: LlX2,
                LlX3: LlX3,
                LlX4: LlX4,
                RlX1: RlX1,
                RlX2: RlX2,
                RlX3: RlX3,
                RlX4: RlX4,
            });
        ANGLE /= 2;
        x1 = x3;
        x2 = x4;
        x3 += ANGLE;
        x4 -= ANGLE;
        curSegHeight /= 2;
        y1 = y2;
        y2 -= curSegHeight;

        RrX1 = x1 - RUMBLE_WIDTH;
        RrX2 = x1
        RrX3 = x3 - RUMBLE_WIDTH;
        RrX4 = x3;

        LrX1 = x2;
        LrX2 = x2 + RUMBLE_WIDTH;
        LrX3 = x4;
        LrX4 = x4 + RUMBLE_WIDTH;

        LlMiddleB = x1 + (x2 - x1) / 3;     // Left lane middle bottom
        RlMiddleB = x2 - (x2 - x1) / 3;     // Right lane middle bottom
        LlMiddleT = x3 + (x4 - x3) / 3;     // Left lane middle top
        RlMiddleT = x4 - (x4 - x3) / 3;     // Right lane middle top

        LlX1 = LlMiddleB - LANE_WIDTH/2;     // Left lane x1
        LlX2 = LlMiddleB + LANE_WIDTH/2;     // Left lane x2
        LlX3 = LlMiddleT - LANE_WIDTH/2;     // Left lane x3
        LlX4 = LlMiddleT + LANE_WIDTH/2;     // Left lane x4

        RlX1 = RlMiddleB - LANE_WIDTH/2;     // Right lane x1
        RlX2 = RlMiddleB + LANE_WIDTH/2;     // Right lane x2
        RlX3 = RlMiddleT - LANE_WIDTH/2;     // Right lane x3
        RlX4 = RlMiddleT + LANE_WIDTH/2;     // Right lane x4

    }
}
function drawRoad(scene) {
    for(let i = 0; i < segments.length; i++){
        let segment = segments[i];
        let graphics = scene.add.graphics();
        // grass
        graphics.fillStyle(segment.grassColor, 1);
        graphics.beginPath();
        graphics.moveTo(0, segment.y1);
        graphics.lineTo(scene.scale.width, segment.y1);
        graphics.lineTo(scene.scale.width, segment.y2);
        graphics.lineTo(0, segment.y2);
        graphics.closePath();
        graphics.fillPath();
        // rumble left
        graphics.fillStyle(segment.rumbleColor, 1);
        graphics.beginPath();
        graphics.moveTo(segment.LrX1, segment.y1);
        graphics.lineTo(segment.LrX2, segment.y1);
        graphics.lineTo(segment.LrX4, segment.y2);
        graphics.lineTo(segment.LrX3, segment.y2);
        graphics.closePath();
        graphics.fillPath();
        // rumble right
        graphics.beginPath();
        graphics.moveTo(segment.RrX1, segment.y1);
        graphics.lineTo(segment.RrX2, segment.y1);
        graphics.lineTo(segment.RrX4, segment.y2);
        graphics.lineTo(segment.RrX3, segment.y2);
        graphics.closePath();
        graphics.fillPath();
        // road
        graphics.fillStyle(segment.color, 1);
        graphics.beginPath();
        graphics.moveTo(segment.x1, segment.y1);
        graphics.lineTo(segment.x2, segment.y1);
        graphics.lineTo(segment.x4, segment.y2);
        graphics.lineTo(segment.x3, segment.y2);
        graphics.closePath();
        graphics.fillPath();
        // lane left
        graphics.fillStyle(segment.laneColor, 1);
        graphics.beginPath();
        graphics.moveTo(segment.LlX1, segment.y1);
        graphics.lineTo(segment.LlX2, segment.y1);
        graphics.lineTo(segment.LlX4, segment.y2);
        graphics.lineTo(segment.LlX3, segment.y2);
        graphics.closePath();
        graphics.fillPath();
        // lane right
        graphics.beginPath();
        graphics.moveTo(segment.RlX1, segment.y1);
        graphics.lineTo(segment.RlX2, segment.y1);
        graphics.lineTo(segment.RlX4, segment.y2);
        graphics.lineTo(segment.RlX3, segment.y2);
        graphics.closePath();
        graphics.fillPath();

        drawnSegments.push(graphics);
    }
}

function drawGrass(scene, segment, id) {


}


function moveRoad(graphics,scene){
    let speed = 5;
    console.log(segments.length);
    drawnSegments[2].clear();









}


// PRINCIP ZVäčšOVANIA, CELA CESTA SA BUDE POSUVAT DOLU A BUDU SA X1,X3 ZMENSOVAT X2,X4 ZVACSOVAT O ROVNAKU HODNOTU
// KED NEJAKE Y1 < 0 TAK NEVIDITELNY SEGMENT SA ZACNE  ZVACSOVAT
// KED NEJAKE Y2 < 0 TAK SEGMENT SA POSUNIE UPLNE HORE A ZMENSI SA A BUDE CAKAT POKYM SA ZACNE ZVACSOVAT
// POC SEGMENTOV JE POC VIDITELNYCH + 1
// AKO SPRAVIT START A CIEL LOL IDK

function roadMove(scene){



}
