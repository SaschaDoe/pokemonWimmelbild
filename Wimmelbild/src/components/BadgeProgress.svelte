<script lang="ts">
    import type { BadgeManager } from '../services/BadgeManager';

    export let currentRegion: string;
    export let badgeManager: BadgeManager;
    export let onClick: () => void;
    
    // Subscribe to the store directly
    const badgeProgress = badgeManager.badgeProgressStore;
</script>

<div class="progress-container" on:click={onClick}>
    <div class="progress-bar">
        <div class="progress" style="width: {($badgeProgress.currentBadgeIndex / $badgeProgress.totalBadgesInRegion) * 100}%">
            <img src="ash.png" alt="Ash" class="progress-marker" />
        </div>
    </div>
    <div class="progress-text">
        {$badgeProgress.currentRegion}: {$badgeProgress.currentBadgeIndex}/{$badgeProgress.totalBadgesInRegion} Orden
    </div>
</div>

<style>
    .progress-container {
        position: fixed;
        top: 20px;
        left: calc(50% + 120px);
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