import { defineStore } from 'pinia';

export const useViewStore = defineStore('viewStore', {
    state: () => ({
        view: 'menu', // Current view (e.g., menu, game, victory)
        sceneData: {}, // Data to pass between scenes
    }),
    actions: {
        setView(newView) {
            this.view = newView;
        },
        setSceneData(data) {
            this.sceneData = data;
        },
        clearSceneData() {
            this.sceneData = {};
        },
    },
});