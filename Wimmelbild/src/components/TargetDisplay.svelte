<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    
    export let targetPokemon: Pokemon;
</script>

<div class="target-display">
    <h3>Find this Pokémon:</h3>
    <img 
        src={targetPokemon.image} 
        alt="Target Pokemon" 
        class="target-image"
    />
</div>

<style>
    .target-display {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 130px;
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

    h3 {
        margin: 0 0 10px 0;
        font-size: 1.2rem;
    }
</style> 