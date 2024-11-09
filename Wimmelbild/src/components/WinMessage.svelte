<script lang="ts">
    import { scale } from 'svelte/transition';
    import { elasticOut } from 'svelte/easing';
    export let onNewGame: () => void;

    // Add confetti on mount
    import confetti from 'canvas-confetti';
    import { onMount } from 'svelte';

    onMount(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        // Fire another burst after a small delay
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 150);
    });
</script>

<div class="win-message" 
    transition:scale={{
        duration: 400,
        easing: elasticOut,
        start: 0.3
    }}>
    <h2 class="victory-text">You found it!</h2>
    <button class="play-again-btn" on:click={onNewGame}>
        Play Again
    </button>
</div>

<style>
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
        animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
        from {
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
        to {
            box-shadow: 0 0 30px rgba(76, 175, 80, 0.4);
        }
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

    .victory-text {
        animation: bounce 1s ease-in-out infinite alternate;
        margin: 0 0 1rem 0;
    }

    @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-10px); }
    }

    @keyframes spin {
        0% { transform: scale(1) rotate(0); }
        50% { transform: scale(1.5) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
</style> 