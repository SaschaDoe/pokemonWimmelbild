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
  const TARGET_PANEL_WIDTH = 150;  // Width of target panel
  const TARGET_PANEL_HEIGHT = 150; // Height of target panel

  // Generate random position that ensures Pokemon is fully visible
  function getRandomPosition(size: number) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Try first position
    let x = SCREEN_PADDING + Math.random() * (viewportWidth - size - SCREEN_PADDING * 2);
    let y = SCREEN_PADDING + Math.random() * (viewportHeight - size - SCREEN_PADDING * 2);
    
    // Adjust if position overlaps with target panel
    if (x < TARGET_PANEL_WIDTH && y < TARGET_PANEL_HEIGHT) {
      // Move either below panel or to the right of panel
      if (Math.random() > 0.5) {
        y = TARGET_PANEL_HEIGHT + SCREEN_PADDING;
      } else {
        x = TARGET_PANEL_WIDTH + SCREEN_PADDING;
      }
    }
    
    return { x, y };
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
        <button class="play-again-btn" on:click={startNewGame}>Play Again</button>
        <div class="confetti-container">
          {#each Array(50) as _, i}
            <div 
              class="confetti" 
              style="
                --delay: {Math.random() * 2}s; 
                --left: {Math.random() * 100}%;
              "
            />
          {/each}
        </div>
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
