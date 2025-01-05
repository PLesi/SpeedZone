<template>
  <div>
    <div id="phaser-container"></div>
  </div>
</template>

<script>
import Phaser from 'phaser';
import { onMounted, onUnmounted, watch, ref, nextTick } from 'vue';
import { useViewStore } from '@/../viewStore.js';
import GameScene from '@/../src/game/scenes/GameScene.js';

export default {
  name: 'GameScene',
  setup() {
    const viewStore = useViewStore();
    const game = ref(null);
    const containerKey = ref(0); // Add a key to force re-render

    const initPhaser = () => {
      // Ensure thorough cleanup
      destroyPhaser();

      // Clear module cache if possible
      if (import.meta.hot) {
        import.meta.hot.dispose(() => {
          destroyPhaser();
        });
      }

      // Reset all global state
      if (!viewStore.continueGame) {
        window.gameState = {
          lines: [0],
          colors: [0],
          numLines: 1,
          count: 0,
          isGrey: false,
          animationSpeed: 1,
          speed: 0,
          startGame: false,
          greenLight: false,
          levels: null,
          bottomWidth: 0,
          elapsedDistance: 0,
          spawnedEnemies: 0,
        };
      }

      // Force DOM cleanup
      containerKey.value++;

      // Wait for next tick to ensure DOM is ready
      nextTick(() => {
        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-container',
          width: window.innerWidth,
          height: window.innerHeight,
          scene: GameScene,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0 },
              debug: true
            }
          },
          input: {
            keyboard: {
              target: window,
              capture: true // Ensure keyboard events are captured
            }
          },
          callbacks: {
            postBoot: (gameInstance) => {
              // Store reference and setup global error handler
              game.value = gameInstance;
              gameInstance.events.on('error', handleGameError);
            }
          }
        };

        try {
          game.value = new Phaser.Game(config);
        } catch (error) {
          console.error('Game initialization error:', error);
          destroyPhaser(); // Cleanup on error
        }
      });
    };


    const destroyPhaser = () => {
      if (!game.value) return;

      try {
        // Stop all scenes first
        game.value.scene.scenes.forEach(scene => {
          try {
            scene.scene.stop();
            scene.scene.shutdown();
          } catch (e) {
            console.warn('Scene cleanup warning:', e);
          }
        });

        // Remove all event listeners
        game.value.events.removeAllListeners();

        // Cleanup input
        if (game.value.input) {
          game.value.input.keyboard?.destroy();
          game.value.input.mouse?.destroy();
          game.value.input.touch?.destroy();
        }

        // Destroy the game instance
        game.value.destroy(true, true);

        // Clear game reference
        game.value = null;

        // Force garbage collection if possible
        if (window.gc) {
          window.gc();
        }

        console.log('Game cleanup complete');
      } catch (error) {
        console.error('Cleanup error:', error);
      } finally {
        // Always cleanup DOM
        const canvases = document.querySelectorAll('#phaser-container canvas');
        canvases.forEach(canvas => canvas.remove());
      }
    };

    const handleGameError = (error) => {
      console.error('Game runtime error:', error);
      destroyPhaser();
      initPhaser(); // Auto-restart on fatal error
    };

    // Improved view watcher
    watch(() => viewStore.currentView, (newView, oldView) => {
      if (newView === 'victory') {
        destroyPhaser();
      } else if (newView === 'game') {
        // Ensure proper cleanup before reinit
        destroyPhaser();
        // Use RAF to ensure smooth transition
        requestAnimationFrame(() => {
          setTimeout(initPhaser, 100);
        });
      }
    });

    const handleResize = () => {
      if (game.value) {
        game.value.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      initPhaser();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      destroyPhaser();
    });

    return {
      viewStore,
      containerKey // Expose key for template
    };
  }
};




</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#phaser-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative; /* Ensure proper stacking context */
}
</style>