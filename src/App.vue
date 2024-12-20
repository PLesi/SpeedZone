<template>
  <div id="app">
    <MainMenu />
  </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue';

export default {
  name: 'App',
  components: {
    MainMenu
  }
};
</script>

<style>
#app {
  text-align: center;
}
</style>