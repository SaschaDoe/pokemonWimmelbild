<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    
    export let targetPokemon: Pokemon;
</script>

<div class="target-display">
    <h2>Find this Pokemon:</h2>
    <img src={targetPokemon.image} alt={targetPokemon.name} />
    <div class="pokemon-info">
        <p class="pokemon-name">{targetPokemon.name}</p>
        <div class="pokemon-types">
            {#each targetPokemon.types as type}
                <span class="type-badge">{type}</span>
            {/each}
        </div>
    </div>
</div>

<style>
    .target-display {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .pokemon-info {
        text-align: center;
    }

    .pokemon-name {
        margin: 0.5rem 0;
        font-weight: bold;
    }

    .pokemon-types {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .type-badge {
        background: #4a90e2;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
    }

    img {
        width: 100px;
        height: 100px;
        object-fit: contain;
    }
</style> 