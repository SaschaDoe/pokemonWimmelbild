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
    } as const;

    function getTypeColor(type: string): string {
        const normalizedType = type.toLowerCase() as keyof typeof typeColors;
        return typeColors[normalizedType] || '#A8A878';
    }
</script>

<div class="pokedex-container">
    <div class="pokedex-frame">
        <!-- Top section with lights -->
        <div class="top-lights">
            <div class="light-container" class:speaking={isPlaying}>
                <div class="light-glow" class:active={isPlaying}></div>
                <div class="big-light" class:active={isPlaying}>
                    <div class="light-reflection"></div>
                </div>
            </div>
            <div class="small-lights">
                <div class="small-light red"></div>
                <div class="small-light yellow"></div>
                <div class="small-light green"></div>
            </div>
        </div>

        <!-- Main content area -->
        <div class="content-area">
            <!-- Left side with image -->
            <div class="pokedex-left">
                <div class="screen-container">
                    <div class="screen-border">
                        <div class="screen-frame">
                            <img 
                                src={pokemon.local_image || pokemon.image} 
                                alt={pokemon.name} 
                                class="pokemon-image clickable"
                                on:click={openWikiPage}
                            />
                        </div>
                        <div class="screen-bottom">
                            <div class="bottom-light"></div>
                            <div class="bottom-buttons">
                                <div class="round-button red"></div>
                                <div class="hamburger-button">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right side with info -->
            <div class="pokedex-right">
                <div class="info-screen">
                    <div class="pokemon-info-header clickable" on:click={openWikiPage}>
                        <div class="title-line">
                            <h3>{pokemon.name}</h3>
                            <span class="pokemon-id">#{pokemon.pokemon_id || pokemon.id.toString().padStart(4, '0')}</span>
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
                <div class="control-pad">
                    <div class="d-pad">
                        <div class="d-pad-vertical"></div>
                        <div class="d-pad-horizontal"></div>
                    </div>
                    <div class="action-buttons">
                        <div class="action-button">A</div>
                        <div class="action-button">B</div>
                    </div>
                </div>
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
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        box-shadow: 
            -5px 5px 15px rgba(0,0,0,0.3),
            inset -2px -2px 10px rgba(0,0,0,0.3),
            inset 2px 2px 10px rgba(255,255,255,0.2);
        min-width: 650px;
        max-width: 650px;
    }

    .top-lights {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 20px;
    }

    .light-container {
        position: relative;
        width: 70px;
        height: 70px;
    }

    .light-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle, 
            rgba(157, 217, 255, 0.9) 0%, 
            rgba(157, 217, 255, 0.6) 30%,
            rgba(157, 217, 255, 0) 70%
        );
        filter: blur(3px);
        transform: scale(1.5);
        opacity: 0;
        pointer-events: none;
        box-shadow: 
            0 0 30px rgba(157, 217, 255, 0.8),
            0 0 50px rgba(157, 217, 255, 0.6);
    }

    .light-glow.active {
        animation: glowPulse 0.75s steps(2, end) infinite;
    }

    @keyframes glowPulse {
        0% {
            opacity: 0.3;
            transform: scale(1.5);
            filter: blur(3px);
            box-shadow: 
                0 0 30px rgba(157, 217, 255, 0.8),
                0 0 50px rgba(157, 217, 255, 0.6);
        }
        100% {
            opacity: 1;
            transform: scale(3);
            filter: blur(5px);
            box-shadow: 
                0 0 40px rgba(157, 217, 255, 1),
                0 0 60px rgba(157, 217, 255, 0.8),
                0 0 80px rgba(157, 217, 255, 0.6),
                0 0 100px rgba(157, 217, 255, 0.4);
        }
    }

    .big-light {
        width: 60px;
        height: 60px;
        background: #5b9bd5;
        border-radius: 50%;
        border: 5px solid white;
        position: relative;
        overflow: hidden;
        z-index: 1;
        box-shadow: 
            0 0 20px rgba(91, 155, 213, 0.6),
            inset 0 0 15px rgba(255, 255, 255, 0.4);
    }

    .big-light.active {
        animation: speakingPulse 0.75s steps(2, end) infinite;
    }

    @keyframes speakingPulse {
        0% {
            background: #5b9bd5;
            box-shadow: 
                0 0 20px rgba(91, 155, 213, 0.6),
                inset 0 0 15px rgba(255, 255, 255, 0.4);
        }
        100% {
            background: #9ed2ff;
            box-shadow: 
                0 0 30px rgba(158, 210, 255, 0.9),
                0 0 45px rgba(158, 210, 255, 0.7),
                inset 0 0 20px rgba(255, 255, 255, 0.6);
        }
    }

    .light-reflection {
        position: absolute;
        width: 15px;
        height: 15px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        top: 5px;
        left: 5px;
        opacity: 0.9;
        filter: blur(1px);
    }

    .big-light.active .light-reflection {
        animation: reflectionPulse 0.15s steps(2, end) infinite;
    }

    @keyframes reflectionPulse {
        0% {
            opacity: 0.6;
            transform: scale(0.8);
            filter: blur(1px);
        }
        100% {
            opacity: 1;
            transform: scale(1.2);
            filter: blur(2px);
        }
    }

    .small-lights {
        display: flex;
        gap: 10px;
    }

    .small-light {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2px solid rgba(0,0,0,0.2);
    }

    .small-light.red { background: #ff0000; }
    .small-light.yellow { background: #ffff00; }
    .small-light.green { background: #00ff00; }

    .content-area {
        display: flex;
        gap: 20px;
        padding: 0 10px;
    }

    .screen-container {
        background: #dedede;
        border-radius: 15px;
        padding: 20px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
    }

    .screen-border {
        background: #1a1a1a;
        border-radius: 10px;
        padding: 20px;
    }

    .screen-frame {
        background: white;
        border-radius: 5px;
        padding: 15px;
        height: 200px;
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
    }

    .screen-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .bottom-light {
        width: 30px;
        height: 30px;
        background: #ff0000;
        border-radius: 50%;
        border: 2px solid #cc0000;
    }

    .bottom-buttons {
        display: flex;
        gap: 10px;
    }

    .round-button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #ff0000;
        border: 2px solid #cc0000;
    }

    .hamburger-button {
        display: flex;
        flex-direction: column;
        gap: 3px;
        width: 30px;
    }

    .hamburger-button div {
        height: 4px;
        background: #1a1a1a;
        border-radius: 2px;
    }

    .pokedex-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .info-screen {
        background: #43B047;
        border-radius: 10px;
        padding: 15px;
        color: black;
        font-family: monospace;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
        min-height: 150px;
    }

    .control-pad {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
    }

    .d-pad {
        position: relative;
        width: 70px;
        height: 70px;
    }

    .d-pad-vertical,
    .d-pad-horizontal {
        position: absolute;
        background: #1a1a1a;
        border-radius: 5px;
    }

    .d-pad-vertical {
        width: 25px;
        height: 70px;
        left: 50%;
        transform: translateX(-50%);
    }

    .d-pad-horizontal {
        width: 70px;
        height: 25px;
        top: 50%;
        transform: translateY(-50%);
    }

    .action-buttons {
        display: flex;
        gap: 15px;
    }

    .action-button {
        width: 35px;
        height: 35px;
        background: #1a1a1a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
    }

    .pokemon-image {
        width: 80%;
        height: 80%;
        object-fit: contain;
        transition: transform 0.2s;
    }

    .type {
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        font-size: 0.85rem;
        color: white;
        text-transform: capitalize;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
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

    .pokemon-info-header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        margin-bottom: 1rem;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    .title-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .types-container {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    h3 {
        margin: 0;
        color: #333;
        font-size: 1.2rem;
        transition: color 0.2s;
    }

    .pokemon-id {
        color: #666;
        font-family: monospace;
        font-size: 1rem;
    }

</style> 