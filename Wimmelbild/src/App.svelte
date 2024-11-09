<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pokemon } from './types/interfaces';
    import { gameConfig } from './config/gameConfig';
    import { PositionService } from './services/PositionService';
    import { PokemonService } from './services/PokemonService';
    import TargetDisplay from './components/TargetDisplay.svelte';
    import WinMessage from './components/WinMessage.svelte';

    const positionService = new PositionService(gameConfig);
    const pokemonService = new PokemonService(gameConfig);

    let pokemons: Pokemon[] = [];
    let targetPokemon: Pokemon | null = null;
    let showWinMessage = false;

    async function initializeGame() {
        showWinMessage = false;
        pokemons = [];
        
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
                    pokemons
                ) && attempts < 50
            );
            
            const pokemon = pokemonService.generatePokemon(position);
            pokemons = [...pokemons, pokemon];
        }
        
        targetPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    }

    function handlePokemonClick(pokemon: Pokemon) {
        if (pokemon.id === targetPokemon?.id) {
            showWinMessage = true;
        }
    }

    onMount(initializeGame);
</script>

<main>
    <div class="game-container">
        <div class="background-container">
            <img src="/backgrounds/woods.png" alt="Forest background" class="background-image" />
            
            {#if targetPokemon}
                <TargetDisplay {targetPokemon} />
            {/if}

            {#each pokemons as pokemon (pokemon.id + pokemon.x + pokemon.y)}
                <button
                    class="pokemon-button"
                    style="
                        left: {pokemon.x}px;
                        top: {pokemon.y}px;
                        width: {pokemon.size}px;
                        height: {pokemon.size}px;
                    "
                    on:click={() => handlePokemonClick(pokemon)}
                >
                    <img
                        src={pokemon.image}
                        alt="Pokemon"
                        class="pokemon-image"
                    />
                </button>
            {/each}
        </div>

        {#if showWinMessage}
            <WinMessage onNewGame={initializeGame} />
        {/if}
    </div>
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

    .target-display {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 130px;  /* Explicit width */
        background: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 100;
    }

    .target-image {
        width: 100px;
        height: 100px;
        object-fit: contain;
    }

    .win-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .play-again-btn {
        padding: 10px 20px;
        font-size: 1.1em;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
    }

    .play-again-btn:hover {
        background: #45a049;
    }

    .confetti-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
    }

    .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: linear-gradient(
            45deg,
            #ff0000,
            #00ff00,
            #0000ff,
            #ffff00,
            #ff00ff
        );
        top: -10px;
        left: var(--left);
        animation: fall 3s linear infinite;
        animation-delay: var(--delay);
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

    h3 {
        margin: 0 0 10px 0;
        font-size: 1.2rem;
    }
</style>
