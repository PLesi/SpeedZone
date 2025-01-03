<template>
  <div>
    <!-- Hlavné menu -->
    <div v-if="!gameStarted" class="menu">
      <img class="menuBackground" src="/img/menu.png" alt="Pozadie menu" />

      <div class="muteContainer">
        <button @click="mute">
          <img :src="isMuted ? '/img/volumeoff.png' : '/img/volume.png'" id="muteButton" alt="Ikona zvuku" />
        </button>
      </div>

      <div class="ruleContainer">
        <button @click="showRules">
          <img src="/img/info.png" id="ruleButton" alt="Ikona informacii" />
        </button>
      </div>

      <div class="menuContent">
        <img src="/img/nadpis.png" id="title" alt="Nadpis" />
        <button @click="startGame" class="menuButton">Nová hra</button>
        <button @click="gContinue" class="menuButton">Pokračovať</button>
        <button @click="quit" class="menuButton" id="quitButton">Ukončiť</button>
      </div>

      <div v-if="isRulesVisible" class="rulesModal">
        <div class="rulesContent">
          <h2>Pravidlá hry</h2>

          <p>
            <strong>{{ rules[currentRuleIndex].title }}</strong>
          </p>
          <div class="text" v-html="rules[currentRuleIndex].content"></div>

          <div class="navigation">
            <button @click="prevRule" :disabled="currentRuleIndex === 0">←</button>
            <button @click="nextRule" :disabled="currentRuleIndex === rules.length - 1">→</button>
          </div>

          <button @click="closeRules" class="closeButton" id="quitButton">Zatvoriť</button>
        </div>
      </div>
    </div>

    <!-- Herná scéna -->
    <div v-else ref="gameContainer"></div>
  </div>
</template>




<script>
import Phaser from "phaser";
import GameScene from "@/game/scenes/GameScene.js";
import {useViewStore} from '@/../viewStore.js';


export default {
  data() {
    return {
      gameStarted: false,
      game: null,

      isRulesVisible: false,
      currentRuleIndex: 0,

      isMuted: false,

      rules: [
        {
          title: "Cieľ hry:",
          content: "Vaším cieľom je prejsť stanovenú vzdialenosť bez straty všetkých životov. Vyhýbajte sa nástrahám, ktoré vám stoja v ceste, a urobte všetko pre to, aby ste zostali čo najdlhšie nažive."
        },
        {
          title: "Ovládanie:",
          content: `
      <ul>
        <li>PC: Používajte šípky doľava a doprava na klávesnici na ovládanie vášho vozidla.</br>
        <li>Mobil: Nakláňajte zariadenie doľava alebo doprava, aby ste sa vyhli prekážkam.</li>
        <li>Myš: Pohybujte myšou doľava a doprava pre jednoduché ovládanie.</li>
      </ul>
    `
        },
        {
          title: "Pravidlá:",
          content: "Každá prekážka, ktorú zasiahnete, vás oberie o časť životov, každým levelom sa ta časť mení. Mení sa aj rýchlosť vozidla a počet prekážok. Preto si udržujte koncentráciu a pohotovo reagujte na meniace sa prostredie."
        }
      ]
    };
  },

  setup() {
    const viewStore = useViewStore();

    const startGame = () => {
      viewStore.setView('game'); // Transition to the game
    };

    return {
      startGame,
    };
  },
  methods: {


    gContinue() {
      console.log("Continuing game...");
    },

    mute() {
      this.isMuted = !this.isMuted;

      if (this.isMuted) {
        // vypnutie zvuku

      } else {
        // zapnutie zvuku
      }
    },

    quit() {
    },

    showRules() {
      this.isRulesVisible = true;
      this.currentRuleIndex = 0;
    },
    closeRules() {
      this.isRulesVisible = false;
    },
    nextRule() {
      if (this.currentRuleIndex < this.rules.length - 1) {
        this.currentRuleIndex++;
      }
    },
    prevRule() {
      if (this.currentRuleIndex > 0) {
        this.currentRuleIndex--;
      }
    }
  }
};
</script>
<style>
.menuButton {
  font-size: 2.5vh;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid #a2d2ff;
  border-radius: 8px;
  box-shadow: 0 0 8px 4px #d7f9f8;
  transition: background-color 0.3s, color 0.3s;
  width: 13.5vw;
  height: 7.5vh;
}

.menuButton:hover {
  background-color: rgba(240, 245, 255, 0.8);
  color: black;
}
</style>

<style scoped>
.menu {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.menuBackground {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.menuContent {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1em;
  align-items: center;
}

#title {
  width: 20vw;
  height: 40vh;
  margin-bottom: 30px;
  justify-content: start;
  margin-top: 25px;
}
.menuButton {
  font-size: 2.5vh;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid #a2d2ff;
  border-radius: 8px;
  box-shadow: 0 0 8px 4px #d7f9f8;
  transition: background-color 0.3s, color 0.3s;
  width: 13.5vw;
  height: 7.5vh;
}

.menuButton:hover {
  background-color: rgba(240, 245, 255, 0.8);
  color: black;
}

#quitButton {
  border: 3px solid #e5857b;
  box-shadow: 0 0 8px 5px #f1b2b2;
}

#quitButton:hover {
  background-color: rgba(255, 0, 0, 0.7);
}

.ruleContainer {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 100;
}

#ruleButton {
  width: 50px;
  height: 50px;
  transition: transform 0.2s ease;
}

#ruleButton:hover {
  transform: scale(1.1);
}

/* Modálne okno */
.rulesModal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.rulesContent {
  background:#ffb7c5;
  padding: 2em;
  border-radius: 8px;
  width: 45vw;
  height: 60vh;
  text-align: center;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.7);
  border: 2px solid white;
  position: relative;
}

.rulesContent h2 {
  font-size: 2.1em;
  color: black;
  padding-bottom: 15px;
}

p {
  text-align: left;
}

.rulesContent .text {
  text-align: left;
  font-size: 1.2em;
  color: black;
}

.navigation {
  display: flex;
  justify-content: space-between;
  bottom: 1em;
  left: 50%;
  gap: 11vw;
  transform: translateX(-50%);
  font-size: 2.3em;
  position: absolute;
}

.closeButton {
  margin-top: 1em;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  transform: translateX(-50%);
  bottom: 5em;
  position: absolute;
}

.closeButton:hover {
  background-color: #d32f2f;
}

strong {
  font-weight: bold;
  color: #b36270;
  font-size: 1.5em;
}
ul {
  padding-left: 20px;
  text-align: left;
  color: black;
}

ul li {
  padding-bottom: 2em;
}

button {
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  box-shadow: none;
}

.muteContainer {
  position: fixed;
  top: 25px;
  left: 25px;
  z-index: 100;
}

#muteButton {
  width: 50px;
  height: 50px;
  transition: transform 0.2s ease;
}

#muteButton:hover {
  transform: scale(1.1);
}



</style>
