<script lang="ts">
    export let currentRegion: string;
    export let totalBadges: number;
    export let collectedBadges: number;
    export let onClick: () => void;
    
    $: progress = (collectedBadges / totalBadges) * 100;
</script>

<div class="progress-container" on:click={onClick} role="button" tabindex="0">
    <div class="progress-bar">
        <div class="progress" style="width: {progress}%">
            <img src="ash.png" alt="Ash" class="progress-marker" />
        </div>
    </div>
    <div class="progress-text">
        {currentRegion}: {collectedBadges}/{totalBadges} Orden
    </div>
</div>

<style>
    .progress-container {
        position: fixed;
        top: 20px;
        left: calc(50% + 230px);
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 15px;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .progress-container:hover {
        transform: translateX(-50%) scale(1.05);
    }

    .progress-bar {
        width: 200px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        overflow: hidden;
        border: 2px solid #333;
    }

    .progress {
        height: 100%;
        background: rgba(78, 159, 61, 0.7);
        position: relative;
        transition: width 0.3s ease;
    }

    .progress-marker {
        position: absolute;
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
        width: 25px;
        height: 25px;
        object-fit: contain;
    }

    .progress-text {
        color: white;
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
        font-weight: bold;
        font-size: 14px;
    }
</style> 