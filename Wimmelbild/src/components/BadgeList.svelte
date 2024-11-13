<script lang="ts">
    import type { Badge } from '../types/interfaces';
    import { BadgeService } from '../services/BadgeService';
    
    export let badgeService: BadgeService;
    export let collectedBadges: Set<string>;
    export let onClose: () => void;
    export let currentRegion: string;
    export let celebratingBadgeId: string | null = null;
    export let showingCelebration = false;

    let badgeListElement: HTMLElement;
    let isAnimating = false;

    function getBadgeId(badge: Badge): string {
        return `${badge.region}_${badge.name}`;
    }

    let regionBadges: { region: string; badges: Badge[] }[] = [];
    
    $: {
        const allRegions = [...new Set(badgeService.getAllBadges().map(b => b.region))];
        regionBadges = allRegions.map(region => ({
            region,
            badges: badgeService.getBadgesByRegion(region)
        }));
    }

    $: if (celebratingBadgeId && !collectedBadges.has(celebratingBadgeId)) {
        collectedBadges = new Set([...collectedBadges, celebratingBadgeId]);
    }

    async function handleCelebration(badgeId: string) {
        if (!badgeListElement || isAnimating) return;
        
        isAnimating = true;
        
        const badgeElement = badgeListElement.querySelector(`[data-badge-id="${badgeId}"]`);
        if (!badgeElement) {
            isAnimating = false;
            return;
        }

        badgeElement.classList.add('celebrating');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        isAnimating = false;
        onClose();
    }

    $: if (celebratingBadgeId && badgeListElement && !isAnimating) {
        const badgeElement = badgeListElement.querySelector(`[data-badge-id="${celebratingBadgeId}"]`);
        if (badgeElement) {
            setTimeout(() => {
                const container = badgeListElement;
                const elementRect = badgeElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const scrollTop = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
                
                container.scrollTo({
                    top: container.scrollTop + scrollTop,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    if (!isAnimating) {
                        handleCelebration(celebratingBadgeId);
                    }
                }, 1000);
            }, 100);
        }
    }
</script>

<div class="badge-list-overlay" on:click|self={() => !isAnimating && onClose()}>
    <div class="badge-list-content" bind:this={badgeListElement}>
        <div class="sticky-header">
            <h2>
                <span class="badges-title">
                    Orden Sammlung
                </span>
            </h2>
        </div>
        
        {#each regionBadges as { region, badges }}
            <div class="region-section" class:current-region={region === currentRegion}>
                <h3 class="region-title">
                    {region}
                    {#if region === currentRegion}
                        <img src="ash.png" alt="Current Region" class="current-marker" />
                    {/if}
                </h3>
                <div class="badge-grid">
                    {#each badges as badge (getBadgeId(badge))}
                        <div 
                            class="badge-item"
                            class:uncollected={!collectedBadges.has(getBadgeId(badge))}
                            class:celebrating={getBadgeId(badge) === celebratingBadgeId}
                            data-badge-id={getBadgeId(badge)}
                        >
                            <img 
                                src={badge.image} 
                                alt={badge.name} 
                                class="badge-image"
                            />
                            <span class="badge-name">{badge.name}orden</span>
                            {#if getBadgeId(badge) === celebratingBadgeId}
                                <div class="celebration-effect"></div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .badge-list-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1800;
        cursor: pointer;
    }

    .badge-list-content {
        cursor: default;
        background: white;
        padding: 0;
        border-radius: 1rem;
        position: relative;
        width: 80%;
        height: 80%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .region-section {
        padding: 1rem 2rem;
        border-bottom: 1px solid #eee;
    }

    .current-region {
        background: rgba(76, 175, 80, 0.1);
        border-left: 4px solid #4CAF50;
    }

    .region-title {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .current-marker {
        width: 30px;
        height: 30px;
        object-fit: contain;
        animation: bounce 1s ease-in-out infinite;
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }

    .badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1.5rem;
    }

    .sticky-header {
        position: sticky;
        top: 0;
        background: white;
        padding: 1rem;
        z-index: 2000;
        border-bottom: 1px solid #eee;
        text-align: center;
    }

    .badges-title {
        font-size: 1.8em;
        font-weight: bold;
        color: #333;
    }

    .badge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem;
        border-radius: 8px;
        transition: transform 0.2s;
        cursor: pointer;
    }

    .badge-item:hover {
        transform: scale(1.05);
    }

    .badge-image {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }

    .badge-name {
        text-align: center;
        font-size: 0.9rem;
        color: #333;
    }

    .uncollected {
        opacity: 0.5;
        filter: grayscale(100%);
    }

    .uncollected .badge-name {
        color: #666;
    }

    .badge-item.celebrating {
        transform: scale(1.2);
        z-index: 100;
        position: relative;
        animation: celebratePulse 2s infinite;
    }

    .badge-item.celebrating .badge-image {
        animation: revealAndSpin 2s forwards;
    }

    .celebration-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, 
            rgba(255, 215, 0, 0.6) 0%,
            rgba(255, 215, 0, 0) 70%
        );
        animation: pulseGlow 2s infinite;
        pointer-events: none;
    }

    @keyframes celebratePulse {
        0%, 100% { transform: scale(1.2); }
        50% { transform: scale(1.3); }
    }

    @keyframes revealAndSpin {
        0% {
            filter: grayscale(100%);
            transform: scale(0.8) rotate(0deg);
        }
        50% {
            filter: grayscale(50%);
            transform: scale(1.2) rotate(180deg);
        }
        100% {
            filter: grayscale(0%);
            transform: scale(1) rotate(360deg);
        }
    }

    @keyframes pulseGlow {
        0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
    }
</style> 