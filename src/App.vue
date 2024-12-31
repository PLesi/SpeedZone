<template>
  <div id="app">
    <component :is="currentView" />
  </div>
</template>

<script>
import { computed } from 'vue';  // Import computed
import { useViewStore } from '/viewStore';  // Import the Pinia store
import MainMenu from './components/MainMenu.vue';
import GameView from './components/GameView.vue';
import Victory from './components/Victory.vue';

export default {
  components: {
    MainMenu,
    GameView,
    Victory,
  },
  setup() {
    const viewStore = useViewStore();  // Get access to the store

    // Use computed to dynamically determine the current view
    const currentView = computed(() => {
      if (viewStore.view === 'menu') return 'MainMenu';
      if (viewStore.view === 'game') return 'GameView';
      if (viewStore.view === 'victory') return 'Victory';
      return null;
    });

    return {currentView};
  },
};
</script>
