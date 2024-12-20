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
      scene: [GameScene],
      backgroundColor: '#289f7c',
    });
  },
};
</script>
