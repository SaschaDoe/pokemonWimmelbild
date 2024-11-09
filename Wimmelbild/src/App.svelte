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
    let isLoading = true;

    async function initializeGame() {
        showWinMessage = false;
        pokemons = [];
        isLoading = true;
        
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
            isLoading = false;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            isLoading = false;
        }
    }

    function handlePokemonClick(pokemon: Pokemon) {
        if (pokemon.id === targetPokemon?.id) {
            showWinMessage = true;
        }
    }

    onMount(initializeGame);
</script>

<main>
    {#if isLoading}
        <div class="loading">Loading...</div>
    {:else}
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
                        title="ID: {pokemon.id} - {pokemon.name}"
                    >
                        <img
                            src={pokemon.image}
                            alt="{pokemon.name}"
                            class="pokemon-image"
                        />
                    </button>
                {/each}
            </div>

            {#if showWinMessage}
                <WinMessage onNewGame={initializeGame} />
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
</style>
