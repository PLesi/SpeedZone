<template>
  <div>
    <div id="phaser-container"></div>
  </div>
</template>

<script>
import Phaser from 'phaser';
import { onMounted, onUnmounted, watch } from 'vue';
import { useViewStore } from '@/../viewStore.js';
import GameScene from '@/../src/game/scenes/GameScene.js'; // Your Phaser scene

export default {
  name: 'GameScene',
  setup() {
    const viewStore = useViewStore();
    let game = null; // Reference to the Phaser game instance

    const initPhaser = () => {
      // Initialize Phaser game
      const config = {
        type: Phaser.AUTO,
        parent: 'phaser-container',
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
      };

      game = new Phaser.Game(config);
    };

    const destroyPhaser = () => {
      // Clean up Phaser game instance
      if (game) {
        game.destroy(true); // Destroy the game and free up resources
        game = null;
      }
    };

    // Watch for view changes
    watch(
        () => viewStore.currentView,
        (newView) => {
          if (newView === 'victory') {
            destroyPhaser(); // Stop the Phaser game
          }
        }
    );

    // Initialize Phaser on mount
    onMounted(() => {
      initPhaser();
    });

    // Cleanup on unmount
    onUnmounted(() => {
      destroyPhaser();
    });
  },
};
</script>

<style scoped>
#phaser-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
