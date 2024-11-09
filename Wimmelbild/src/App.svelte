<script lang="ts">
  import { onMount } from 'svelte';

  // Types
  interface Pokemon {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    image: string;
  }

  // State
  let pokemons: Pokemon[] = [];
  let targetPokemon: Pokemon | null = null;
  let showWinMessage = false;
  let gameContainer: HTMLElement;
  
  // Constants
  const POKEMON_COUNT = 25;
  const POKEMON_SIZE = 50;
  const SCREEN_PADDING = 50;
  const OVERLAP_THRESHOLD = 40;
  const BACKGROUND_WIDTH = 1920;  // adjust to actual width
  const BACKGROUND_HEIGHT = 1080; // adjust to actual height

  // Generate random position that ensures Pokemon is fully visible
  function getRandomPosition(size: number) {
    return {
      x: SCREEN_PADDING + Math.random() * (BACKGROUND_WIDTH - size - SCREEN_PADDING * 2),
      y: SCREEN_PADDING + Math.random() * (BACKGROUND_HEIGHT - size - SCREEN_PADDING * 2)
    };
  }

  // Check if a new position would overlap with existing Pokemon
  function checkOverlap(newX: number, newY: number, newSize: number) {
    return pokemons.some(pokemon => {
      const dx = newX - pokemon.x;
      const dy = newY - pokemon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (newSize + pokemon.size) / 2 + OVERLAP_THRESHOLD;
    });
  }

  // Initialize or reset the game
  async function initializeGame() {
    showWinMessage = false;
    pokemons = [];
    
    for (let i = 0; i < POKEMON_COUNT; i++) {
      const id = Math.floor(Math.random() * 151) + 1;
      let position;
      let attempts = 0;
      
      do {
        position = getRandomPosition(POKEMON_SIZE);
        attempts++;
      } while (checkOverlap(position.x, position.y, POKEMON_SIZE) && attempts < 50);
      
      const pokemon: Pokemon = {
        id,
        x: position.x,
        y: position.y,
        size: POKEMON_SIZE,
        rotation: 0,
        image: `/pokemon_images/Icon_${String(id).padStart(3, '0')}.png`
      };
      
      pokemons = [...pokemons, pokemon];
    }
    
    targetPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
  }

  // Handle Pokemon click
  function handlePokemonClick(pokemon: Pokemon) {
    if (pokemon.id === targetPokemon?.id) {
      showWinMessage = true;
    }
  }

  // Start new game
  function startNewGame() {
    initializeGame();
  }

  onMount(() => {
    initializeGame();
  });
</script>

<main bind:this={gameContainer}>
  <div class="game-container">
    <div class="target-display">
      <h3>Find this Pokemon:</h3>
      <img 
        src={targetPokemon?.image} 
        alt="Target Pokemon" 
        class="target-image"
      />
    </div>

    <div class="background-container">
      <img src="/backgrounds/woods.png" alt="Forest background" class="background-image" />
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
      <div class="win-message">
        <h2>Congratulations! You found the Pokemon!</h2>
        <button on:click={startNewGame}>Play Again</button>
      </div>
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
    width: 100%;
    height: 100%;
    position: relative;
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
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    text-align: center;
    z-index: 1000;
    animation: pop-in 0.5s ease-out;
  }

  .win-message button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .win-message button:hover {
    background: #45a049;
  }

  @keyframes pop-in {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
  }
</style>
