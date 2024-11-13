<script lang="ts">
    export let totalBackgrounds: number;
    export let remainingBackgrounds: number;
    
    $: progress = totalBackgrounds > 0 
        ? ((totalBackgrounds - remainingBackgrounds) / totalBackgrounds) * 100 
        : 0;

    $: isVisible = totalBackgrounds > 0;
</script>

{#if isVisible}
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress" style="width: {progress}%">
                <img src="ash.png" alt="Ash" class="progress-marker" />
            </div>
        </div>
        <div class="progress-text">
            Backgrounds: {totalBackgrounds - remainingBackgrounds}/{totalBackgrounds}
        </div>
    </div>
{/if}

<style>
    .progress-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 15px;
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