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

      <audio ref="audioMenu" loop>
        <source src="/music/audioMenu.mp3" type="audio/mp3" />
      </audio>

      <div class="menuContent">
        <img src="/img/nadpis.png" id="title" alt="Nadpis" />
        <button @click="startGame" class="menuButton">Nová hra</button>
        <button @click="gContinue" class="menuButton">Pokračovať</button>
        <button @click="quit" class="menuButton" id="quitButton">Ukončiť</button>
      </div>

      <div v-if="isRulesVisible" class="rulesModal">
        <div class="rulesContent">
          <h2><strong>Popis hry</strong></h2>

          <p>
            <strong>{{ rules[currentRuleIndex].title }}</strong>
          </p>
          <div class="text" v-html="rules[currentRuleIndex].content"></div>

          <div class="navigation">
            <button @click="prevRule" :disabled="currentRuleIndex === 0">←</button>
            <button @click="nextRule" :disabled="currentRuleIndex === rules.length - 1">→</button>
          </div>

          <div v-if="currentRuleIndex === rules.length - 1">
            <button @click="printAllRules" class="printButton">
              <img src="/img/print.png" id="print" alt="Ikona tisku" />
            </button>
          </div>
          <button @click="closeRules" class="closeButton">Zatvoriť</button>
        </div>
      </div>
    </div>

    <!-- Herná scéna -->
    <div v-else ref="gameContainer">
      <audio ref="audioGame" loop>
        <source src="/music/audioGame.mp3" type="audio/mp3" />
      </audio>
    </div>
  </div>
</template>

<script>
import Phaser from "phaser";
import GameScene from "@/game/scenes/GameScene.js";

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
          content: "Vaším cieľom je prejsť stanovenú vzdialenosť bez straty všetkých životov. Vyhýbajte sa prekážkám, ktoré vám stoja v ceste, a urobte všetko pre to, aby ste zostali čo najdlhšie nažive."
        },
        {
          title: "Ovládanie:",
          content: "●  PC: Na pohyb vášho vozidla používajte šípky doľava a doprava na klávesnici.<br>●  Mobil: Nakláňajte zariadenie doľava alebo doprava, aby ste sa vyhli prekážkam.<br>●  Myš: Pohybujte myšou doľava a doprava pre jednoduché ovládanie.<br>"
        },
        {
          title: "Pravidlá:",
          content: "Hra obsahuje 5 levelov obtiažnosti easy, medium alebo hard. Každá prekážka (auto), ktorú zasiahnete, vás oberie o časť životov, táto časť životov sa v každom leveli mení. Každý level má tiež inú rýchlosť vozidla a iný počet prekážok. Preto si udržujte koncentráciu a pohotovo reagujte na meniace sa prostredie."
        }
      ]
    };
  },

  mounted() {
    if (!this.isMuted) {
      this.$refs.audioMenu.load();
      this.$refs.audioMenu.play();
    }
  },

  methods: {
    startGame() {
      this.gameStarted = true;

      const config = {
        type: Phaser.AUTO,
        parent: this.$refs.gameContainer,
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [GameScene]
      };
      this.game = new Phaser.Game(config);

      if (!this.isMuted) {
        this.$refs.audioGame.play();
      }
    },

    gContinue() {
      console.log("Continuing game...");
    },

    mute() {
      this.isMuted = !this.isMuted;

      if (this.isMuted) {
        this.$refs.audioMenu.pause();
        this.$refs.audioGame.pause();
      }
      else {
        if (this.gameStarted) {
          this.$refs.audioGame.play();
        } else {
          this.$refs.audioMenu.play();
        }
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
    },

    printAllRules() {
      const printableText = this.rules.map(rule => `
      <h3>${rule.title}</h3>
      <div>${rule.content}</div>
    `).join("<hr>");

      let printWindow = window.open("", "_blank");
      printWindow.document.write(`
      <html>
        <head>
            <title>Pravidlá hry</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              h1 {
                font-size: 2em;
                text-align: center;
                margin-bottom: 50px;
              }
              h3 {
                color: #333;
              }
              hr {
                margin: 30px 0;
              }
            </style>
        </head>
        <body>
            <h1>Pravidlá hry</h1>
            ${printableText}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }
};
</script>

<style scoped>
@font-face {
  font-family: "PressStart";
  src: url("/font/PressStart2P-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

* {
  font-family: "Courier New", Courier, monospace;
  font-size: 2.2vh;
}

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
  font-family: PressStart, sans-serif;
}

#title {
  width: 20vw;
  height: 40vh;
  margin-bottom: 3vh;
  justify-content: start;
  margin-top: 25px;
}

.menuButton {
  font-size: 2.1vh;
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
  top: 4vh;
  right: 2vw;
  z-index: 100;
}

#ruleButton {
  width: 3.5vw;
  height: 7vh;
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
  font-family: "Courier New", Courier, monospace;
}

.rulesContent {
  background:#ffb7c5;
  padding-left: 2.5vw;
  padding-right: 2.5vw;
  border-radius: 8px;
  width: 45vw;
  height: 65vh;
  text-align: center;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.7);
  border: 2px solid white;
  position: relative;
}

.rulesContent h2 {
  padding-top: 2vh;
}

h2 strong {
  color: black;
  font-size: 5vh;
}

p {
  text-align: left;
}

.rulesContent .text {
  text-align: left;
  font-size: 1.2em;
  color: black;
  padding-left: 0;
}

.navigation {
  display: flex;
  justify-content: space-between;
  bottom: 1vh;
  left: 50%;
  gap: 11vw;
  transform: translateX(-50%);
  font-size: 2.3em;
  position: absolute;
}

.closeButton {
  margin-top: 1em;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  transform: translateX(-50%);
  bottom: 6vh;
  position: absolute;
  box-shadow: 0 0 4px 2px #343a40;
}

.closeButton:hover {
  background-color: #495057;
}

.printButton  {
  position: absolute;
  top: 4vh;
  right: 2vw;
}

#print {
  width: 1.7vw;
  height: 3.7vh;
}

.printButton:hover {
  transform: scale(1.1);
}


strong {
  font-weight: bold;
  color: #b36270;
  font-size: 1.5em;
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
  top: 4vh;
  left: 2vw;
  z-index: 100;
}

#muteButton {
  width: 3.5vw;
  height: 7vh;
  transition: transform 0.2s ease;
}

#muteButton:hover {
  transform: scale(1.1);
}

</style>
