<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    
    export let targetPokemon: Pokemon;
</script>

<div class="target-display">
    <h2>Find this Pokémon:</h2>
    <div class="pokemon-target">
        <img 
            src={targetPokemon.imageUrl} 
            alt={targetPokemon.name}
            class="target-image"
        />
        <p class="pokemon-name">{targetPokemon.name}</p>
    </div>
</div>

<style>
    .target-display {
        background: rgba(255, 255, 255, 0.9);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .pokemon-target {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .target-image {
        width: 100px;
        height: 100px;
        object-fit: contain;
    }

    .pokemon-name {
        font-size: 1.2rem;
        font-weight: bold;
        margin: 0;
    }
</style> 