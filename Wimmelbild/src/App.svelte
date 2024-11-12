<script lang="ts">
    import { onMount, tick } from 'svelte';
    import type { Pokemon, Berry } from './types/interfaces';
    import { gameConfig } from './config/gameConfig';
    import { PositionService } from './services/PositionService';
    import { PokemonService } from './services/PokemonService';
    import WinMessage from './components/WinMessage.svelte';
    import PokemonDetails from './components/PokemonDetails.svelte';
    import PokemonList from './components/PokemonList.svelte';
    import { BackgroundService } from './services/BackgroundService';
    import TitleScreen from './components/TitleScreen.svelte';
    import { GameStateManager } from './services/GameStateManager';
    import { writable } from 'svelte/store';

    const positionService = new PositionService(gameConfig);
    const pokemonService = new PokemonService(gameConfig);
    const backgroundService = new BackgroundService(gameConfig);
    const gameStateManager = new GameStateManager();

    // Create a writable store for discoveredPokemon
    const discoveredPokemonStore = writable(new Set());

    // Update the store whenever gameStateManager changes
    $: {
        discoveredPokemonStore.set(gameStateManager.getDiscoveredPokemon());
    }

    let allPokemonList: Pokemon[] = [];

    function getRandomItems<T>(items: T[], count: number): T[] {
        return [...items].sort(() => Math.random() - 0.5).slice(0, count);
    }

    const BERRY_SIZE = 50;
    const TARGET_PANEL_WIDTH = 200;  // Approximate width of target panel
    const TARGET_PANEL_HEIGHT = 300; // Approximate height of target panel
    const SCREEN_PADDING = 20;

    function getRandomPosition(): { x: number; y: number } {
        const maxX = window.innerWidth - BERRY_SIZE - SCREEN_PADDING;
        const maxY = window.innerHeight - BERRY_SIZE - SCREEN_PADDING;
        
        // Keep trying until we get a valid position
        let x, y;
        do {
            x = Math.random() * (maxX - SCREEN_PADDING) + SCREEN_PADDING;
            y = Math.random() * (maxY - SCREEN_PADDING) + SCREEN_PADDING;
        } while (
            // Check if position overlaps with target panel
            x > (window.innerWidth - TARGET_PANEL_WIDTH - BERRY_SIZE) &&
            y < TARGET_PANEL_HEIGHT
        );

        return { x, y };
    }

    let pokemons: Pokemon[] = [];
    let targetPokemon: Pokemon | null = null;
    let showWinMessage = false;
    let isLoading = true;

    let berryData: Berry[] = [];
    let selectedBerries: Berry[] = [];
    let targetBerries: Berry[] = [];
    let harvestedBerries: Set<string> = new Set();
    let harvestingBerries: Set<string> = new Set();

    let foundItems: (Pokemon | Berry)[] = [];
    let gameWon = false;

    let foundBerryCount = 0;

    let selectedPokemonForDetails: Pokemon | null = null;

    let showPokemonList = false;

    let wrongBerryAnimations: Set<string> = new Set();

    let currentBackground = '/backgrounds/woods.png';
    let currentMask = '/backgrounds/woods_mask.png';

    let gameStarted = false;

    let showingCelebration = false;

    function saveDiscoveredPokemon() {
        localStorage.setItem('discoveredPokemon', 
            JSON.stringify([...discoveredPokemonStore.get()])
        );
    }

    function handleGameStart() {
        gameStarted = true;
    }

    onMount(async () => {
        try {
            // Wait for background service to load
            await backgroundService.dataLoaded;
            
            // Load berry data
            const berryResponse = await fetch('berry_data.json');
            berryData = await berryResponse.json();
            
            await pokemonService.dataLoaded;
            allPokemonList = pokemonService.getAllPokemon();
            
            // Set initial background
            currentBackground = await backgroundService.getRandomBackground();
            
            await initializeGame();
        } catch (error) {
            console.error('Error loading data:', error);
            isLoading = false;
        }
    });

    async function initializeGame() {
        showWinMessage = false;
        pokemons = [];
        foundItems = [];
        isLoading = true;
        harvestedBerries = new Set();
        foundBerryCount = 0;
        harvestingBerries = new Set();
        
        try {
            // Get random background with its mask
            const bgInfo = await backgroundService.getRandomBackground();
            currentBackground = bgInfo.image;
            await backgroundService.loadMask(bgInfo.mask);

            const newPokemons: Pokemon[] = [];
            
            for (let i = 0; i < gameConfig.POKEMON_COUNT; i++) {
                let pokemon: Pokemon | null = null;
                let attempts = 0;
                const MAX_ATTEMPTS = 50;

                while (!pokemon && attempts < MAX_ATTEMPTS) {
                    try {
                        let position = positionService.getRandomPosition(gameConfig.POKEMON_SIZE);
                        
                        // Check for overlap with existing Pokemon
                        if (positionService.checkOverlap(
                            position.x, 
                            position.y, 
                            gameConfig.POKEMON_SIZE, 
                            newPokemons
                        )) {
                            attempts++;
                            continue;
                        }

                        // Get terrain type at position
                        const terrainType = backgroundService.getTerrainTypeAtPosition(
                            position.x, 
                            position.y
                        );

                        // Try to generate a Pokemon for this position
                        pokemon = await pokemonService.generatePokemon(position, terrainType);
                        
                        if (pokemon) {
                            newPokemons.push(pokemon);
                            break;
                        }
                    } catch (error) {
                        console.log('Failed to generate Pokemon at position, trying again:', error);
                        attempts++;
                    }
                }

                if (!pokemon) {
                    console.error(`Failed to place Pokemon after ${MAX_ATTEMPTS} attempts`);
                }
            }
            
            pokemons = newPokemons;
            targetPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];

            selectedBerries = getRandomItems(berryData, 5).map(berry => ({
                ...berry,
                position: getRandomPosition()
            }));
            
            targetBerries = getRandomItems(selectedBerries, 3);
            
            isLoading = false;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            isLoading = false;
        }
    }

    function handleBerryClick(berry: Berry) {
        if (targetBerries.some(targetBerry => targetBerry.index === berry.index)) {
            harvestingBerries.add(berry.index);
            harvestingBerries = harvestingBerries;
            foundItems = [...foundItems, berry];
            foundBerryCount++;
        } else {
            wrongBerryAnimations.add(berry.index);
            wrongBerryAnimations = wrongBerryAnimations;
        }
    }

    async function handlePokemonFound(pokemon: Pokemon) {
        showingCelebration = true;
        showPokemonList = true;
        
        await tick();
        
        // Add to discovered Pokemon right after counter animation (3 seconds)
        setTimeout(() => {
            gameStateManager.addDiscoveredPokemon(pokemon.id);
            // Update the store manually
            discoveredPokemonStore.update(set => {
                set.add(pokemon.id);
                return set;
            });
        }, 3000);
        
        // Close pokemon list and show win message after all animations
        setTimeout(() => {
            showPokemonList = false;
            showingCelebration = false;
            showWinMessage = true;
        }, 10000);
    }

    function handleClick(item: Pokemon | Berry) {
        const isPokemon = 'id' in item;
        
        if (isPokemon) {
            const allBerriesCollected = targetBerries.every(targetBerry => 
                foundItems.some(foundItem => !('id' in foundItem) && foundItem.index === targetBerry.index)
            );

            if (allBerriesCollected && item.id === targetPokemon?.id) {
                foundItems = [...foundItems, item];
                // Remove this line as we'll add it after counter animation
                // gameStateManager.addDiscoveredPokemon(item.id);
                handlePokemonFound(item);
            } else {
                selectedPokemonForDetails = item;
            }
        } else {
            handleBerryClick(item);
        }
    }

    function closeDetails() {
        selectedPokemonForDetails = null;
    }

    function togglePokemonList() {
        showPokemonList = !showPokemonList;
    }

    function resetProgress() {
        gameStateManager.resetProgress();
        initializeGame();
    }
</script>

{#if !gameStarted}
    <TitleScreen on:start={handleGameStart} />
{:else}
    <main>
        {#if isLoading}
            <div class="loading">Loading...</div>
        {:else}
            <div class="game-container">
                <button 
                    class="pokedex-button"
                    on:click={() => !showingCelebration && togglePokemonList()}
                    disabled={showingCelebration}
                >
                    📖 Pokédex
                </button>

                <div class="background-container">
                    <img src={currentBackground} alt="Game background" class="background-image" />
                    
                    <div class="target-panel">
                        <h2>Find these:</h2>
                        {#each targetBerries as berry, index (berry.index + '_target')}
                            <div class="target-item" class:found={foundItems.some(item => !('id' in item) && item.index === berry.index)}>
                                <img src={berry.local_image} alt={berry.name} />
                            </div>
                        {/each}

                        {#if targetPokemon}
                            <div class="target-item" class:found={foundItems.some(item => 'id' in item && item.id === targetPokemon?.id)}>
                                <div class="pokemon-target-wrapper" class:locked={foundBerryCount < targetBerries.length}>
                                    <img src={targetPokemon.image} alt={targetPokemon.name} />
                                    {#if foundBerryCount < targetBerries.length}
                                        <div class="locked-overlay">
                                            🔒
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                    </div>

                    {#each pokemons as pokemon, index (`pokemon_${pokemon.id}_${index}`)}
                        <button
                            class="pokemon-button"
                            style="left: {pokemon.x}px; top: {pokemon.y}px; width: {pokemon.size}px; height: {pokemon.size}px;"
                            on:click={() => !showingCelebration && handleClick(pokemon)}
                            disabled={showingCelebration}
                        >
                            <img src={pokemon.image} alt={pokemon.name} class="pokemon-image" />
                        </button>
                    {/each}

                    {#each selectedBerries as berry, index (`berry_${berry.index}_${index}`)}
                        {#if !harvestedBerries.has(berry.index)}
                            <button
                                class="berry-button"
                                style="left: {berry.position?.x}px; top: {berry.position?.y}px;"
                                on:click={() => handleClick(berry)}
                                class:harvesting={harvestingBerries.has(berry.index)}
                                class:wrong-berry={wrongBerryAnimations.has(berry.index)}
                                on:animationend={() => {
                                    if (harvestingBerries.has(berry.index)) {
                                        harvestingBerries.delete(berry.index);
                                        harvestedBerries.add(berry.index);
                                        harvestingBerries = harvestingBerries;
                                        harvestedBerries = harvestedBerries;
                                    }
                                    if (wrongBerryAnimations.has(berry.index)) {
                                        wrongBerryAnimations.delete(berry.index);
                                        wrongBerryAnimations = wrongBerryAnimations;
                                    }
                                }}
                            >
                                <img 
                                    src={berry.local_image} 
                                    alt={berry.name} 
                                    class="berry-image" 
                                />
                            </button>
                        {/if}
                    {/each}
                </div>

                {#if showWinMessage}
                    <WinMessage 
                        onNewGame={initializeGame} 
                        foundPokemon={targetPokemon}
                    />
                {:else if selectedPokemonForDetails}
                    <PokemonDetails 
                        pokemon={selectedPokemonForDetails} 
                        onClose={closeDetails}
                    />
                {/if}
            </div>
        {/if}

        {#if showPokemonList || showingCelebration}
            <PokemonList
                discoveredPokemon={$discoveredPokemonStore}
                allPokemon={allPokemonList}
                onClose={() => !showingCelebration && (showPokemonList = false)}
                resetProgress={resetProgress}
                celebratePokemonId={showingCelebration ? targetPokemon?.id : null}
            />
        {/if}
    </main>
{/if}
<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
    }

    .game-container {
        position: fixed;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }

    .background-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .background-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .pokemon-button {
        position: absolute;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
    }

    .pokemon-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    @keyframes fall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }

    .loading {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
    }

    .berry-button {
        position: absolute;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        width: 50px;
        height: 50px;
        transition: transform 0.2s;
    }

    .berry-button:hover {
        transform: scale(1.1);
    }

    .berry-button.harvesting {
        animation: harvestBerry 0.5s ease-out forwards;
        pointer-events: none;
    }

    .berry-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    @keyframes harvestBerry {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.7;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }

    .target-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 15px;
        border-radius: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .target-item {
        display: inline-block;
        margin: 5px;
        padding: 5px;
        border: 2px solid #ccc;
        border-radius: 5px;
        position: relative;
    }

    .target-item.found {
        border-color: #4CAF50;
        background-color: rgba(76, 175, 80, 0.2);
    }

    .target-item img {
        width: 40px;
        height: 40px;
        object-fit: contain;
    }

    .pokemon-target-wrapper {
        position: relative;
        width: 40px;
        height: 40px;
    }

    .pokemon-target-wrapper.locked {
        opacity: 0.7;
    }

    .locked-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        padding: 5px;
    }

    .pokedex-button {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
        z-index: 1500;
    }

    .pokedex-button:hover {
        transform: scale(1.05);
        background: rgba(255, 255, 255, 1);
    }

    .berry-button.wrong-berry {
        animation: wrongBerryShake 0.5s ease-in-out;
    }

    @keyframes wrongBerryShake {
        0%, 100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-5px) rotate(-5deg);
        }
        75% {
            transform: translateX(5px) rotate(5deg);
        }
    }

    .pokemon-button:disabled,
    .pokedex-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    .pokemon-button:disabled:hover,
    .pokedex-button:disabled:hover {
        transform: none;
    }
</style>

