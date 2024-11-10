<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import Modal from './Modal.svelte';
    import TypeBadge from './TypeBadge.svelte';

    export let pokemon: Pokemon;
    export let show = false;
</script>

<Modal {show} on:close>
    <div class="pokedex-entry">
        <h2>#{pokemon.id.toString().padStart(4, '0')} - {pokemon.name}</h2>
        
        <div class="pokemon-image-container">
            <img src={pokemon.image} alt={pokemon.name} />
        </div>
        
        <div class="pokemon-types">
            {#each pokemon.types as type}
                <TypeBadge {type} />
            {/each}
        </div>

        <div class="pokemon-info">
            <p class="note">
                Die PokéWiki-Seite kann nicht direkt eingebettet werden.
                Klicken Sie unten, um sie in einem neuen Tab zu öffnen:
            </p>
            <a 
                href={pokemon.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="wiki-link"
            >
                Auf PokéWiki öffnen
                <span class="external-link-icon">↗</span>
            </a>
        </div>
    </div>
</Modal>

<style>
    .pokedex-entry {
        text-align: center;
        min-width: 300px;
        padding: 1rem;
    }

    .pokemon-image-container {
        margin: 1.5rem 0;
    }

    .pokemon-image-container img {
        width: 200px;
        height: 200px;
        object-fit: contain;
    }

    .pokemon-types {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin: 1rem 0;
    }

    .pokemon-info {
        margin-top: 1.5rem;
    }

    .note {
        color: #666;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .wiki-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        background-color: #4a90e2;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-weight: bold;
    }

    .wiki-link:hover {
        background-color: #357abd;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .external-link-icon {
        font-size: 1.2em;
    }

    h2 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
    }
</style> 