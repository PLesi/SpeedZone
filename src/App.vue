<template>
  <div id="game"></div>
</template>

<script>
import Phaser from 'phaser';
import GameScene from './game/scenes/GameScene';
export default {
  name: 'App',
  mounted() {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          debug: true, // Enable debug to visualize the collision box
          gravity: { y: 0 }, // Adjust gravity as needed
        },
      },
      scene: [GameScene],
      backgroundColor: '#289f7c',
    });
  },
};
</script>
