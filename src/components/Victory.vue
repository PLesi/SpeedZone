<template>
  <div>
    <h1>Victory!</h1>
    <button @click="goToMenu">Main Menu</button>
  </div>
</template>

<script>
import { useViewStore } from '@/../viewStore';

export default {
  name: 'Victory',
  setup() {
    const viewStore = useViewStore();

    const goToMenu = () => {
      viewStore.setView('menu'); // Transition to Main Menu
    };

    return {
      goToMenu,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
}
button {
  margin: 10px;
  padding: 10px;
  font-size: 16px;
}
</style>
