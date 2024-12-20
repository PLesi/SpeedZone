 <!-- TODO:
            1. Tlačitka pre nová hra, pokračovať, mutnuť hudbu, ukončiť
                1.1. Nová hra - spustí hru od začiatku, náhodný level
                1.2. Pokračovať - spustí hru od posledného vypnutia...údaje uložené v JSON
                1.3. Mutnuť hudbu - vypne/zapne hudbu
                1.4. Ukončiť - ukončí hru
            2. Pozadie - obrázok
            3. Nadpis - Názov hry
            4. Hudba - loop, suno ai
            5. Animácia zapnutia menu...viď https://www.superhry.cz/games/916/ (Nadpis aby sa zobrazil z menšieho na väčší)

    -->
 <template>
   <div class="main-menu">
     <h2>Hlavné Menu</h2>
     <button @click="startGame">Začať Hru</button>
     <button @click="showSettings">Nastavenia</button>
     <button @click="exitGame">Ukončiť</button>
   </div>
 </template>

 <script>
 export default {
   methods: {
     startGame() {
       console.log('Hra sa začína');
       // Tu by ste mohli vyvolať napr. zmenu scény
     },
     showSettings() {
       console.log('Zobraziť nastavenia');
     },
     exitGame() {
       console.log('Ukončiť hru');
     },
   },
 };
 </script>

 <style scoped>
 .main-menu {
   display: flex;
   flex-direction: column;
   gap: 1em;
 }
 button {
   padding: 0.5em 1em;
   font-size: 1rem;
 }
 </style>
