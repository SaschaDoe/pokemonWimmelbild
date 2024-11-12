<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import PokemonDetails from './PokemonDetails.svelte';
    import confetti from 'canvas-confetti';

    export let discoveredPokemon: Set<number>;
    export let allPokemon: Pokemon[];
    export let onClose: () => void;
    export let resetProgress: () => void;
    export let celebratePokemonId: number | null = null;

    let selectedPokemon: Pokemon | null = null;
    let pokemonListElement: HTMLElement;

    // Sort Pokemon by ID
    $: sortedPokemon = [...allPokemon].sort((a, b) => a.id - b.id);

    function handlePokemonClick(pokemon: Pokemon) {
        if (discoveredPokemon.has(pokemon.id)) {
            selectedPokemon = pokemon;
        }
    }

    function closeDetails() {
        selectedPokemon = null;
    }

    let readyToReveal = false;

    let isAnimating = false;

    let oldCount = 0;
    let isCounterAnimating = false;

    async function handleCelebration(pokemonId: number) {
        if (!pokemonListElement) return;
        
        // Set animating states
        isAnimating = true;
        isCounterAnimating = true;
        
        // Store old count before increment
        oldCount = discoveredPokemon.size;
        
        // Wait for counter animation to complete (2.5s for full animation)
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Update counter and wait for fade transition
        isCounterAnimating = false;
        
        // Small pause after counter animation before starting scroll
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Rest of the celebration (scroll, reveal, etc.)
        readyToReveal = false;
        
        // Find the pokemon element
        const pokemonElement = pokemonListElement.querySelector(`[data-pokemon-id="${pokemonId}"]`);
        if (!pokemonElement) {
            console.log('Pokemon element not found:', pokemonId);
            return;
        }

        const container = pokemonListElement;
        
        // Calculate scroll position to center the Pokemon
        const elementRect = pokemonElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const scrollTop = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
        
        // Much slower smooth scroll (5 seconds)
        container.scrollTo({
            top: container.scrollTop + scrollTop,
            behavior: 'smooth'
        });

        // Wait for scroll to complete (reduced from 5000 to 2000)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Now we're ready to reveal
        readyToReveal = true;

        // Add celebrating class
        pokemonElement.classList.add('celebrating');

        // Wait for the reveal animation (reduced from 3000 to 2000)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get updated position for confetti
        const updatedRect = pokemonElement.getBoundingClientRect();
        
        // Calculate position relative to viewport
        const x = (updatedRect.left + updatedRect.width / 2) / window.innerWidth;
        const y = (updatedRect.top + updatedRect.height / 2) / window.innerHeight;

        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 50,
            origin: { x, y },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'],
            ticks: 200,
            startVelocity: 20,
            gravity: 0.7,
            shapes: ['circle', 'square'],
            zIndex: 2500,
            scalar: 0.7,
            disableForReducedMotion: true
        });

        // Second burst after a short delay
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 45,
                origin: { x, y },
                colors: ['#FFD700', '#FFA500'],
                ticks: 150,
                startVelocity: 15,
                gravity: 0.6,
                shapes: ['circle'],
                zIndex: 2500,
                scalar: 0.5,
                disableForReducedMotion: true
            });
        }, 200);

        // Wait for all animations to complete
        await new Promise(resolve => setTimeout(resolve, 4200)); // 2000 (scroll) + 2000 (reveal) + 200 (buffer)
        
        // Set animating state back to false
        isAnimating = false;
    }

    $: if (celebratePokemonId && pokemonListElement) {
        handleCelebration(celebratePokemonId);
    }
</script>

<!-- Add overlay when animating -->
{#if isAnimating}
    <div class="celebration-overlay"></div>
{/if}

<div class="pokemon-list-overlay" on:click|self={!isAnimating && onClose}>
    <div class="pokemon-list-content" bind:this={pokemonListElement}>
        <button 
            class="close-button" 
            on:click={() => !isAnimating && onClose()}
            disabled={isAnimating}
        >×</button>
        <div class="sticky-header">
            <h2>
                <span class="pokedex-title">
                    Pokédex (
                    {#if isCounterAnimating}
                        <span class="counter-wrapper">
                            <span class="old-count">{oldCount}</span>
                            <span class="increment-animation">+1</span>
                        </span>
                    {:else}
                        <span class="counter-number">{discoveredPokemon.size}</span>
                    {/if}
                    /{allPokemon.length})
                </span>
            </h2>
        </div>
        <div class="pokemon-grid">
            {#each sortedPokemon as pokemon (pokemon.id)}
                <button 
                    class="pokemon-item"
                    class:undiscovered={!discoveredPokemon.has(pokemon.id)}
                    class:celebrating={pokemon.id === celebratePokemonId}
                    class:found-pokemon={pokemon.id === celebratePokemonId}
                    data-pokemon-id={pokemon.id}
                    on:click={() => !isAnimating && handlePokemonClick(pokemon)}
                    disabled={isAnimating}
                >
                    <div class="pokemon-number">#{pokemon.id.toString().padStart(4, '0')}</div>
                    {#if discoveredPokemon.has(pokemon.id) || (pokemon.id === celebratePokemonId && readyToReveal)}
                        <img 
                            src={pokemon.image} 
                            alt={pokemon.name} 
                        />
                        <span class="pokemon-name">{pokemon.name}</span>
                    {:else}
                        <div class="undiscovered">
                            <img 
                                src={pokemon.image} 
                                alt="Unknown Pokemon" 
                                class="silhouette"
                            />
                            <span class="pokemon-name">???</span>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="reset-button-container">
            <button 
                class="reset-button"
                on:click={() => {
                    if (!isAnimating && confirm('Are you sure you want to reset your Pokédex progress?')) {
                        resetProgress();
                    }
                }}
                disabled={isAnimating}
            >
                🔄 Reset Progress
            </button>
        </div>
    </div>
</div>

{#if selectedPokemon}
    <div class="pokemon-details-wrapper">
        <PokemonDetails pokemon={selectedPokemon} onClose={closeDetails} />
    </div>
{/if}

<style>
    .pokemon-list-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1800;
    }

    .pokemon-list-content {
        background: white;
        padding: 0;
        border-radius: 1rem;
        position: relative;
        width: 80%;
        height: 80%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .close-button {
        position: fixed;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 5px 10px;
        border-radius: 50%;
        z-index: 2100;
    }

    .close-button:hover {
        background: #f0f0f0;
    }

    .pokemon-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .pokemon-item {
        background: none;
        border: 2px solid #eee;
        border-radius: 8px;
        padding: 0.5rem;
        cursor: pointer;
        transition: transform 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .pokemon-item:hover {
        transform: scale(1.05);
        border-color: #4CAF50;
    }

    .pokemon-item img {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }

    .pokemon-name {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        text-align: center;
    }

    .undiscovered {
        opacity: 0.7;
        cursor: default;
    }

    .silhouette {
        filter: brightness(0);
        transition: filter 2s ease-in-out;
    }

    h2 {
        text-align: center;
        color: #333;
        margin-bottom: 1rem;
    }

    .pokemon-number {
        position: absolute;
        top: 5px;
        left: 5px;
        font-size: 0.8rem;
        color: #666;
    }

    .pokemon-details-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
    }

    .reset-button-container {
        display: flex;
        justify-content: center;
        padding: 1rem;
        margin-top: auto;
    }

    .reset-button {
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
    }

    .reset-button:hover {
        transform: scale(1.05);
        background: rgba(255, 0, 0, 0.9);
    }

    .pokemon-item.celebrating img {
        animation: revealPokemon 2s ease-in-out forwards;
    }

    .pokemon-item.celebrating .pokemon-name {
        animation: revealName 1s ease-in-out forwards;
    }

    .pokemon-item.celebrating {
        border-color: gold;
        box-shadow: 0 0 20px gold;
        position: relative;
        z-index: 2000;
        animation: celebrateItem 1s ease-in-out;
    }

    @keyframes revealPokemon {
        0% {
            filter: brightness(0);
            transform: scale(1);
        }
        25% {
            filter: brightness(0.25);
            transform: scale(1.05);
        }
        50% {
            filter: brightness(0.5);
            transform: scale(1.1);
        }
        75% {
            filter: brightness(0.75);
            transform: scale(1.05);
        }
        100% {
            filter: brightness(1);
            transform: scale(1);
        }
    }

    @keyframes celebrateItem {
        0% {
            transform: scale(1);
        }
        10% {
            transform: scale(1.1) rotate(-5deg);
        }
        20% {
            transform: scale(1.1) rotate(5deg);
        }
        30% {
            transform: scale(1.1) rotate(-3deg);
        }
        40% {
            transform: scale(1.1) rotate(3deg);
        }
        50% {
            transform: scale(1.1) rotate(0);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes revealName {
        0%, 50% {
            opacity: 0;
            transform: translateY(10px);
        }
        70% {
            opacity: 0.5;
            transform: translateY(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Add a glowing effect */
    .pokemon-item.celebrating::after {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%);
        border-radius: 12px;
        animation: glowPulse 3s ease-in-out infinite;
        z-index: -1;
    }

    @keyframes glowPulse {
        0%, 100% {
            opacity: 0.5;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.1);
        }
    }

    .celebration-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: 2500;
        cursor: not-allowed;
    }

    /* Add disabled styles */
    .pokemon-item:disabled,
    .close-button:disabled,
    .reset-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    /* Override hover effects when disabled */
    .pokemon-item:disabled:hover {
        transform: none;
        border-color: #eee;
    }

    .close-button:disabled:hover {
        background: none;
    }

    .reset-button:disabled:hover {
        transform: none;
        background: rgba(255, 0, 0, 0.8);
    }

    .found-pokemon {
        border: 3px solid gold !important;
        box-shadow: 0 0 15px gold, inset 0 0 10px gold;
        animation: goldPulse 2s infinite;
    }

    @keyframes goldPulse {
        0% {
            border-color: gold;
            box-shadow: 0 0 15px gold, inset 0 0 10px gold;
        }
        50% {
            border-color: #ffd700;
            box-shadow: 0 0 25px #ffd700, inset 0 0 20px #ffd700;
        }
        100% {
            border-color: gold;
            box-shadow: 0 0 15px gold, inset 0 0 10px gold;
        }
    }

    /* Make sure the found Pokemon stands out more */
    .pokemon-item.found-pokemon {
        transform: scale(1.05);
        z-index: 2000;
    }

    .pokemon-item.found-pokemon:hover {
        transform: scale(1.05);
    }

    .sticky-header {
        position: sticky;
        top: 0;
        background: white;
        padding: 1rem;
        z-index: 2000;
        border-bottom: 1px solid #eee;
        margin-bottom: 1rem;
        text-align: center;
    }

    .pokedex-title {
        position: relative;
        display: inline-block;
        font-size: 1.5em;
        animation: titleAnimation 2.5s ease-in-out;
    }

    @keyframes titleAnimation {
        0%, 80% {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        100% {
            background: none;
            -webkit-background-clip: initial;
            -webkit-text-fill-color: initial;
            text-shadow: none;
            color: #333;
        }
    }

    .counter-wrapper {
        display: inline-block;
        position: relative;
        min-width: 2em;
        text-align: center;
    }

    .old-count {
        display: inline-block;
        color: #333;
        animation: countExit 2s ease-in-out forwards;
        font-weight: bold;
        -webkit-text-fill-color: initial;
    }

    .increment-animation {
        display: inline-block;
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        color: #4CAF50;
        font-weight: bold;
        animation: incrementPopNew 2s ease-in-out forwards;
        font-size: 1.2em;
        text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        -webkit-text-fill-color: initial;
    }

    .counter-number {
        display: inline-block;
        font-weight: bold;
        color: #333;
        animation: numberAppear 0.5s ease-in-out;
    }

    @keyframes numberAppear {
        0% {
            opacity: 0;
            transform: scale(0.8);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes countExit {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        20% {
            transform: scale(1.5);
            color: #FFD700;
        }
        40% {
            transform: scale(1.2) rotate(-10deg);
            color: #FFA500;
        }
        60% {
            transform: scale(1.3) rotate(10deg);
            color: #FF8C00;
        }
        80% {
            transform: scale(1.1);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }

    @keyframes incrementPopNew {
        0% {
            transform: translate(0, -50%) scale(0);
            opacity: 0;
            color: #4CAF50;
        }
        20% {
            transform: translate(0, -50%) scale(2);
            opacity: 1;
            color: #45a049;
        }
        40% {
            transform: translate(20px, -50%) scale(1.5);
            color: #388E3C;
        }
        60% {
            transform: translate(-20px, -50%) scale(1.8);
            color: #2E7D32;
        }
        80% {
            transform: translate(0, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(0, -50%) scale(1);
            opacity: 0;
        }
    }

    h2 {
        text-align: center;
        margin: 0;
        padding: 0.5rem;
        font-size: 1.8rem;
        font-weight: bold;
    }

    /* Add a shine effect to the title */
    .pokedex-title::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
        );
        animation: shine 4s infinite;
    }

    @keyframes shine {
        0% {
            transform: translateX(-100%);
        }
        20%, 100% {
            transform: translateX(100%);
        }
    }
</style> 