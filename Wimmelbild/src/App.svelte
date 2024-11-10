<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pokemon, Berry } from './types/interfaces';
    import { gameConfig } from './config/gameConfig';
    import { PositionService } from './services/PositionService';
    import { PokemonService } from './services/PokemonService';
    import TargetDisplay from './components/TargetDisplay.svelte';
    import WinMessage from './components/WinMessage.svelte';
    import PokemonDetails from './components/PokemonDetails.svelte';

    const positionService = new PositionService(gameConfig);
    const pokemonService = new PokemonService(gameConfig);

    function getRandomItems<T>(items: T[], count: number): T[] {
        return [...items].sort(() => Math.random() - 0.5).slice(0, count);
    }

    function getRandomPosition(): { x: number; y: number } {
        return {
            x: Math.random() * (window.innerWidth - 100), // Subtract berry size
            y: Math.random() * (window.innerHeight - 100) // Subtract berry size
        };
    }

    let pokemons: Pokemon[] = [];
    let targetPokemon: Pokemon | null = null;
    let showWinMessage = false;
    let isLoading = true;

    let berryData: Berry[] = [];
    let selectedBerries: Berry[] = [];
    let targetBerries: Berry[] = [];
    let harvestedBerries: Set<string> = new Set();

    let foundItems: (Pokemon | Berry)[] = [];
    let targets: (Pokemon | Berry)[] = [];
    let gameWon = false;

    let foundBerryCount = 0;

    let selectedPokemonForDetails: Pokemon | null = null;

    onMount(async () => {
        try {
            const berryResponse = await fetch('berry_data.json');
            berryData = await berryResponse.json();
            
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
        
        try {
            const newPokemons: Pokemon[] = [];
            
            for (let i = 0; i < gameConfig.POKEMON_COUNT; i++) {
                let position;
                let attempts = 0;
                
                do {
                    position = positionService.getRandomPosition(gameConfig.POKEMON_SIZE);
                    attempts++;
                } while (
                    positionService.checkOverlap(
                        position.x, 
                        position.y, 
                        gameConfig.POKEMON_SIZE, 
                        newPokemons
                    ) && attempts < 50
                );
                
                const pokemon = await pokemonService.generatePokemon(position);
                newPokemons.push(pokemon);
            }
            
            pokemons = newPokemons;
            targetPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];

            selectedBerries = getRandomItems(berryData, 5).map(berry => ({
                ...berry,
                position: {
                    x: Math.random() * (window.innerWidth - 60),
                    y: Math.random() * (window.innerHeight - 60)
                }
            }));
            
            targetBerries = getRandomItems(selectedBerries, 3);
            
            isLoading = false;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            isLoading = false;
        }
    }

    function handleClick(item: Pokemon | Berry) {
        const isPokemon = 'id' in item;
        
        if (isPokemon) {
            selectedPokemonForDetails = item;
            
            const allBerriesFound = targetBerries.every(targetBerry => 
                foundItems.some(item => !('id' in item) && item.index === targetBerry.index)
            );
            
            if (allBerriesFound && item.id === targetPokemon?.id) {
                foundItems = [...foundItems, item];
                showWinMessage = true;
            }
        } else {
            harvestedBerries.add(item.index);
            if (targetBerries.some(berry => berry.index === item.index)) {
                foundItems = [...foundItems, item];
                foundBerryCount++;
            }
        }

        harvestedBerries = harvestedBerries;
    }

    function closeDetails() {
        selectedPokemonForDetails = null;
    }
</script>

<main>
    {#if isLoading}
        <div class="loading">Loading...</div>
    {:else}
        <div class="game-container">
            <div class="background-container">
                <img src="/backgrounds/woods.png" alt="Forest background" class="background-image" />
                
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
                        on:click={() => handleClick(pokemon)}
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

            {#if selectedPokemonForDetails && !showWinMessage}
                <PokemonDetails 
                    pokemon={selectedPokemonForDetails} 
                    onClose={closeDetails}
                />
            {/if}

            {#if showWinMessage}
                <WinMessage 
                    onNewGame={initializeGame} 
                    foundPokemon={targetPokemon}
                />
            {/if}
        </div>
    {/if}
</main>

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

    .berry {
        position: absolute;
        cursor: pointer;
        transition: transform 0.2s;
        z-index: 1;
    }

    .berry img {
        width: 40px;
        height: 40px;
    }

    .berry:hover {
        transform: scale(1.1);
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

    .berry-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
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
</style>
