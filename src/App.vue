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
  margin: 0;
  padding: 0;
}
</style>