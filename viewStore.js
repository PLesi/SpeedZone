import { defineStore } from 'pinia';

export const useViewStore = defineStore('viewStore', {
    state: () => ({
        view: 'menu',  // Default to 'menu' or wherever you want to start
    }),
    actions: {
        setView(newView) {
            this.view = newView;
        },
    },
});