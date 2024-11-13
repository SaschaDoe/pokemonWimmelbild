<script lang="ts">
    import confetti from 'canvas-confetti';
    import { onMount } from 'svelte';

    export let onReset: () => void;

    function celebrateWin() {
        // Create multiple confetti bursts
        const duration = 5 * 1000;
        const end = Date.now() + duration;

        const interval = setInterval(function() {
            if (Date.now() > end) {
                return clearInterval(interval);
            }

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6, x: Math.random() },
                colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'],
            });
        }, 250);
    }

    onMount(() => {
        celebrateWin();
    });
</script>

<div class="win-screen-overlay">
    <div class="win-content">
        <img src="win.png" alt="Victory!" class="win-image" />
        <h1>Herzlichen Glückwunsch!</h1>
        <p>Du hast alle Badges aus allen Regionen gesammelt!</p>
        <button class="reset-button" on:click={onReset}>
            Neue Reise beginnen
        </button>
    </div>
</div>

<style>
    .win-screen-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    }

    .win-content {
        background: rgba(255, 255, 255, 0.95);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        max-width: 600px;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
        animation: appear 1s ease-out;
    }

    .win-image {
        width: 300px;
        height: auto;
        margin-bottom: 1rem;
        animation: bounce 2s infinite;
    }

    h1 {
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1.2rem;
        color: #333;
        margin-bottom: 2rem;
    }

    .reset-button {
        background: linear-gradient(45deg, #FFD700, #FFA500);
        border: none;
        padding: 1rem 2rem;
        border-radius: 30px;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        transition: transform 0.2s;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .reset-button:hover {
        transform: scale(1.05);
    }

    @keyframes appear {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
</style> 