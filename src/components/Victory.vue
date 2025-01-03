<template>
  <div class="bg-black">
    <div class="menuContent">
      <img v-if="data?.win" src="/img/VICTORY.png" id="winLogo" alt="Victory" />
      <img v-else src="/img/DEFEAT.png" id="winLogo" alt="Defeat" />
      <div class="buttonsAndInfo">
        <p> Level: <span class="value">{{ data?.level }}</span></p>
        <p> Obtiažnosť: <span class="value">{{ data?.dificulty }}</span> </p>
      </div>
      <button v-if="!data?.win" @click="playAgain" class="menuButton">Hrať znova</button>
      <button v-else @click="nextGame" class="menuButton">Pokračovať</button>
      <button @click="goToMenu" class="menuButton">Main Menu</button>
    </div>
  </div>
</template>

<script>
import { useViewStore } from '@/../viewStore';
import { computed } from 'vue';

export default {
  name: 'Victory',
  setup() {
    const viewStore = useViewStore();
    const data = computed(() => viewStore.sceneData); // Accessing scene data from Pinia

    const goToMenu = () => {
      viewStore.setView('menu'); // Transition to Main Menu
    };

    const playAgain = () => {
      viewStore.setView('game'); // Transition to Game
    };
    const nextGame = () => {
      viewStore.setView('game'); // Transition to Game
    };

    return {
      data, // Ensure "data" is returned so it's accessible in the template
      goToMenu,
      playAgain,
      nextGame,
    };
  },
};
</script>
<style scoped>
h1 {
  text-align: center;
}
.buttonsAndInfo {
  width: fit-content;
  margin: 0 auto;
  grid-gap: 0 1vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}


.bg-black {
  background-color: black;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column; /* Ensures content stacks vertically */
}

.menuContent {
  text-align: center;
  color: white;
  height: fit-content;
  margin: auto;
  width: 100%; /* Default width */
  display: flex;
  flex-direction: column; /* Ensures content stacks vertically */
}

#winLogo {
  height: 20vh;
  width: auto;
  padding: 0;
  margin: 0 auto;
}

.menuButton {

  margin: 2vh auto;

  padding: 10px 20px;
  cursor: pointer;
  font-size: 5vh;
  height: fit-content;
  width: auto;
}

p {
  font-size: 5vh;
  color: #ffffff;
  margin: 0 0 20px;
}

br {
  margin: 0;
  padding: 0;
}

.value {
  font-size: 1.2em;
  color: #e287ff;
}

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .menuContent {
    width: 100%; /* Take full width on smaller devices */
    padding: 10px;
  }


  .menuButton {
    height: fit-content;
    width: auto;
    font-size: 14px; /* Smaller button font */
    padding: 8px 16px;
  }

  #winLogo {
    height: 20vh; /* Adjust logo size */
  }
}

@media (max-width: 480px) {
  .menuButton {

    height: fit-content;
    width: auto;
    font-size: 14px; /* Further reduce button size */
    padding: 8px 16px;
  }



  #winLogo {
    height: 10vh; /* Smaller logo size for very small screens */
  }
}
</style>
