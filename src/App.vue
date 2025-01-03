<template>
  <div id="app">
    <!-- Gyroscope Permission -->
    <div v-if="gyroSupported && !gyroEnabled" id="gyroReq">
      <button @click="requestGyroPermission" class="menuButton gyroBtn">Enable Gyroscope</button>
    </div>

    <!-- Rotate Message -->
    <div v-if="showRotateMessage" class="rotate-message">
      <h1 class="mess">Prosím otočte mobil do režimu na šírku.</h1>
    </div>

    <!-- Dynamic Views -->
    <component v-else :is="currentView" />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useViewStore } from "/viewStore";
import MainMenu from "./components/MainMenu.vue";
import GameView from "./components/GameView.vue";
import Victory from "./components/Victory.vue";

export default {
  components: {
    MainMenu,
    GameView,
    Victory,
  },

  setup() {
    const viewStore = useViewStore();
    const showRotateMessage = ref(false);
    const gyroEnabled = ref(false);
    const gyroSupported = ref(false); // Tracks gyroscope support

    // Dynamically determine the active component
    const currentView = computed(() => {
      if (viewStore.view === "menu") return "MainMenu";
      if (viewStore.view === "game") return "GameView";
      if (viewStore.view === "victory") return "Victory";
      return null;
    });

    // Check if the device is in portrait mode
    const checkOrientation = () => {
      showRotateMessage.value = window.matchMedia("(orientation: portrait)").matches;
    };

    // Request gyroscope permission
    const requestGyroPermission = async () => {
      if (
          typeof DeviceMotionEvent !== "undefined" &&
          DeviceMotionEvent.requestPermission
      ) {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === "granted") {
            gyroEnabled.value = true;
            console.log("Gyroscope permission granted");
          } else {
            console.error("Gyroscope permission denied");
          }
        } catch (err) {
          console.error("Error requesting gyroscope permission:", err);
        }
      } else {
        console.warn("Device does not support gyroscope permissions");
      }
    };

    // Check if the device supports gyroscope permissions
    const checkGyroSupport = () => {
      gyroSupported.value =
          typeof DeviceMotionEvent !== "undefined" &&
          typeof DeviceMotionEvent.requestPermission === "function";
    };

    // Lifecycle hooks
    onMounted(() => {
      checkOrientation(); // Initial orientation check
      checkGyroSupport(); // Check for gyroscope support
      window.addEventListener("resize", checkOrientation);
      window.addEventListener("orientationchange", checkOrientation);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    });

    return {
      currentView,
      showRotateMessage,
      gyroEnabled,
      gyroSupported,
      requestGyroPermission,
    };
  },
};
</script>

<style>
/* Base Styles */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Rotate Message Styles */
.rotate-message {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(15, 16, 33);
}

.mess {
  font-size: 2.5vh;
  color: white;
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
  text-shadow: 2px 2px 4px #ff00d5;
  text-align: center;
}

/* Dynamic Components Styling */
#app {
  width: 100%;
  height: 100%;
}

/* Gyroscope Permission Styles */
#gyroReq
{
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(15, 16, 33);
}
.gyroBtn{
  width: fit-content;
  height: fit-content;
}

</style>
