import { defineStore } from 'pinia';

export const useViewStore = defineStore('viewStore', {
    state: () => ({
        view: 'menu', // Current view (e.g., menu, game, victory)
        sceneData: {}, // Data to pass between scenes
        continueGame: false,
    }),
    actions: {
        setView(newView) {
            this.view = newView;
        },
        setSceneData(data) {
            this.sceneData = data;
        },
        continueGameState(opt){
            this.continueGame = opt;
        },
        clearSceneData() {
            this.sceneData = {};
        },
    },
});