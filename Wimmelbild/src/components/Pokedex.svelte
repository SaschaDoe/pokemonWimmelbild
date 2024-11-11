<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import { SpeechService } from '../services/SpeechService';
    
    export let pokemon: Pokemon;

    const speechService = new SpeechService();
    let isPlaying = false;
    let isLoading = false;
    let audioElement: HTMLAudioElement | null = null;
    let progress = 0;

    function normalizeTypeName(type: string): string {
        return type.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/-/g, '')
            .trim();
    }

    function openWikiPage() {
        if (pokemon.url) {
            window.open(pokemon.url, '_blank');
        }
    }

    function updateProgress() {
        if (audioElement) {
            progress = (audioElement.currentTime / audioElement.duration) * 100;
        }
    }

    async function toggleAudio() {
        if (isLoading) return;

        if (audioElement && isPlaying) {
            // Pause current audio
            audioElement.pause();
            isPlaying = false;
            return;
        }

        if (audioElement && !isPlaying) {
            // Resume paused audio
            audioElement.play();
            isPlaying = true;
            return;
        }

        // Start new audio
        try {
            isLoading = true;
            let textToSpeak = `${pokemon.name}. `;

            if (pokemon.appearance) {
                textToSpeak += `Aussehen. ${pokemon.appearance}. `;
            }
            if (pokemon.habitat) {
                textToSpeak += `Lebensraum. [pause] ${pokemon.habitat}. `;
            }
            if (pokemon.species) {
                textToSpeak += `${pokemon.species}`;
            }

            const audioUrl = await speechService.generateSpeech(textToSpeak);
            
            if (audioElement) {
                audioElement.pause();
                URL.revokeObjectURL(audioElement.src);
                audioElement.remove();
            }

            audioElement = new Audio();
            audioElement.src = audioUrl;

            audioElement.ontimeupdate = updateProgress;
            
            audioElement.onended = () => {
                isPlaying = false;
                progress = 0;
                URL.revokeObjectURL(audioUrl);
            };

            audioElement.oncanplaythrough = () => {
                isLoading = false;
                isPlaying = true;
                audioElement?.play();
            };

            audioElement.onerror = (e) => {
                console.error('Audio playback error:', e);
                isPlaying = false;
                isLoading = false;
            };

            audioElement.load();
        } catch (error) {
            console.error('Error playing audio:', error);
            isPlaying = false;
            isLoading = false;
        }
    }

    // Function to stop and cleanup audio
    function stopAudio() {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            isPlaying = false;
            progress = 0;
            if (audioElement.src) {
                URL.revokeObjectURL(audioElement.src);
            }
            audioElement.remove();
            audioElement = null;
        }
    }

    // Update onDestroy to use the stopAudio function
    import { onDestroy } from 'svelte';
    onDestroy(() => {
        stopAudio();
    });

    // Export stopAudio for parent components to use
    export function cleanup() {
        stopAudio();
    }

    // Updated type color mapping for German type names
    const typeColors = {
        normal: '#A8A878',
        kampf: '#C03028',    // Fighting
        flug: '#A890F0',     // Flying
        gift: '#A040A0',     // Poison
        boden: '#E0C068',    // Ground
        gestein: '#B8A038',  // Rock
        kaefer: '#A8B820',   // Bug
        geist: '#705898',    // Ghost
        stahl: '#B8B8D0',    // Steel
        feuer: '#F08030',    // Fire
        wasser: '#6890F0',   // Water
        pflanze: '#78C850',  // Grass
        elektro: '#F8D030',  // Electric
        psycho: '#F85888',   // Psychic
        eis: '#98D8D8',      // Ice
        drache: '#7038F8',   // Dragon
        unlicht: '#705848',  // Dark
        fee: '#EE99AC'       // Fairy
    };

    function getTypeColor(type: string): string {
        const normalizedType = type.toLowerCase();
        return typeColors[normalizedType] || '#A8A878'; // Default to normal type color
    }
</script>

<div class="pokedex-container">
    <div class="pokedex-frame">
        <!-- Left side with image -->
        <div class="pokedex-left">
            <div class="screen-container">
                <div class="screen-frame">
                    <img 
                        src={pokemon.local_image || pokemon.image} 
                        alt={pokemon.name} 
                        class="pokemon-image clickable"
                        on:click={openWikiPage}
                    />
                </div>
                <div class="screen-decorations">
                    <div class="led red"></div>
                    <div class="led yellow"></div>
                    <div class="led green"></div>
                </div>
            </div>
        </div>

        <!-- Right side with info -->
        <div class="pokedex-right">
            <div class="info-section">
                <div class="pokemon-header clickable" on:click={openWikiPage}>
                    <h3>{pokemon.name}</h3>
                    <p class="pokemon-id">#{pokemon.pokemon_id || pokemon.id.toString().padStart(4, '0')}</p>
                </div>
                
                <div class="types-container">
                    {#each pokemon.types as type}
                        <span 
                            class="type" 
                            style="background-color: {getTypeColor(type)}"
                        >
                            {type}
                        </span>
                    {/each}
                </div>
            </div>

            <div class="audio-section">
                <button 
                    class="tts-button" 
                    on:click={toggleAudio}
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <span class="loading-dots">Lade</span>
                    {:else if isPlaying}
                        <span>⏸️ Pause</span>
                    {:else}
                        <span>▶️ Vorlesen</span>
                    {/if}
                </button>

                {#if isPlaying || progress > 0}
                    <div class="progress-bar">
                        <div class="progress" style="width: {progress}%"></div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .pokedex-container {
        padding: 1rem;
    }

    .pokedex-frame {
        background: #dc0a2d;
        border-radius: 15px;
        padding: 25px;
        display: flex;
        gap: 25px;
        box-shadow: 
            inset -2px -2px 10px rgba(0,0,0,0.3),
            inset 2px 2px 10px rgba(255,255,255,0.2);
        min-width: 700px;
    }

    .pokedex-left {
        flex: 1.5;
        min-width: 330px;
    }

    .pokedex-right {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 250px;
    }

    .screen-container {
        background: #dedede;
        border-radius: 10px;
        padding: 20px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
    }

    .screen-frame {
        background: white;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 10px;
        height: 300px;
        width: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
    }

    .pokemon-image {
        width: 50%;
        height: 50%;
        object-fit: contain;
        transition: transform 0.2s;
        padding: 10px;
    }

    .pokemon-image:hover {
        transform: scale(1.05);
    }

    .screen-decorations {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .led {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.2);
    }

    .led.red { background: #ff0000; }
    .led.yellow { background: #ffff00; }
    .led.green { background: #00ff00; }

    .info-section {
        background: #f0f0f0;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
    }

    .pokemon-header {
        margin-bottom: 1rem;
        cursor: pointer;
    }

    .pokemon-header:hover h3 {
        color: #dc0a2d;
    }

    h3 {
        margin: 0;
        color: #333;
        font-size: 1.8rem;
        transition: color 0.2s;
        margin-bottom: 0.5rem;
    }

    .pokemon-id {
        margin: 0.2rem 0;
        color: #666;
        font-family: monospace;
        font-size: 1.2rem;
    }

    .types-container {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }

    .type {
        padding: 0.4rem 1rem;
        border-radius: 999px;
        font-size: 1rem;
        color: white;
        text-transform: capitalize;
        margin: 0.3rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .audio-section {
        background: #f0f0f0;
        border-radius: 10px;
        padding: 15px;
    }

    .tts-button {
        width: 100%;
        background: #4a90e2;
        color: white;
        border: none;
        padding: 0.8rem;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 0.5rem;
    }

    .tts-button:hover:not(:disabled) {
        background: #357abd;
    }

    .tts-button:disabled {
        background: #cccccc;
        cursor: not-allowed;
    }

    .progress-bar {
        width: 100%;
        height: 6px;
        background: #ddd;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress {
        height: 100%;
        background: #4a90e2;
        transition: width 0.1s linear;
    }

    @keyframes loadingDots {
        0% { content: ""; }
        25% { content: "."; }
        50% { content: ".."; }
        75% { content: "..."; }
        100% { content: ""; }
    }

    .loading-dots::after {
        content: "";
        animation: loadingDots 1.5s infinite;
        display: inline-block;
        width: 1em;
    }

</style> 