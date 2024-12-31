

<template>
  <img :src="win? 'public/img/VICTORY.png' : 'public/img/GAME-OVER.png'" id="title" alt="Nadpis"/>
  <button v-if="win" @click="gContinue" class="menuButton">Pokračovať</button>
  <button @click="restartGame" class="menuButton">Nová hra</button>
  <button @click="toMenu" class="menuButton" id="toMenuButton">Domov</button>
</template>

<script>
import Phaser from 'phaser';
import GameScene from './game/scenes/GameScene';
export default {
  name: 'Victory',
  props: {
    win: Boolean,
  },
  methods: {
    restartGame() {
      this.$emit('restart');
    },
    toMenu() {
      this.$emit('menu');
    },
    gContinue() {
      this.$emit('continue');
    },
  },
};

</script>

<style scoped>

</style>