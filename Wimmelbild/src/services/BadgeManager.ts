import { LocalStorageService } from './LocalStorageService';
import type { Badge } from '../types/interfaces';
import { writable } from 'svelte/store';

export class BadgeManager {
    private localStorageService: LocalStorageService;
    private collectedBadges: Set<string>;
    private currentRegionIndex: number = 0;
    private regions: string[];
    private badgesByRegion: { [region: string]: string[] };
    private currentBadgeIndex: number = 0;

    public badgeProgressStore = writable({
        currentBadgeIndex: 0,
        currentRegionIndex: 0,
        currentRegion: '',
        totalBadgesInRegion: 0
    });

    constructor() {
        this.localStorageService = new LocalStorageService();
        this.collectedBadges = new Set(
            this.localStorageService.load<string[]>('collected_badges', [])
        );
        this.regions = [];
        this.badgesByRegion = {};
        this.currentRegionIndex = this.localStorageService.load<number>('current_region_index', 0);
        this.currentBadgeIndex = this.localStorageService.load<number>('current_badge_index', 0);
        
        this.updateBadgeProgressStore();
    }

    private updateBadgeProgressStore(): void {
        const currentRegion = this.getCurrentRegion();
        const totalBadgesInRegion = this.getCurrentRegionTotalBadges();
        
        this.badgeProgressStore.set({
            currentBadgeIndex: this.currentBadgeIndex,
            currentRegionIndex: this.currentRegionIndex,
            currentRegion,
            totalBadgesInRegion
        });
    }

    public async initialize(): Promise<void> {
        try {
            const response = await fetch('/badges.json');
            this.badgesByRegion = await response.json();
            this.regions = Object.keys(this.badgesByRegion);
            this.localStorageService.save('badge_regions', this.regions);
            this.updateBadgeProgressStore();
        } catch (error) {
            console.error('Failed to load badge data:', error);
        }
    }

    public addCurrentBadge(): string {
        const currentRegion = this.getCurrentRegion();
        const currentBadge = this.getCurrentBadgeName();
        const badgeId = `${currentRegion}_${currentBadge}`;
        
        this.collectedBadges.add(badgeId);
        this.moveToNextBadge();
        
        this.localStorageService.save('collected_badges', Array.from(this.collectedBadges));
        this.localStorageService.save('current_region_index', this.currentRegionIndex);
        this.localStorageService.save('current_badge_index', this.currentBadgeIndex);
        
        this.updateBadgeProgressStore();
        
        return badgeId;
    }

    private moveToNextBadge(): void {
        const currentRegion = this.getCurrentRegion();
        const badgesInRegion = this.badgesByRegion[currentRegion];

        if (this.currentBadgeIndex >= badgesInRegion.length - 1) {
            if (this.currentRegionIndex >= this.regions.length - 1) {
                this.currentRegionIndex = 0;
                this.currentBadgeIndex = 0;
            } else {
                this.currentRegionIndex++;
                this.currentBadgeIndex = 0;
            }
        } else {
            this.currentBadgeIndex++;
        }

        this.updateBadgeProgressStore();
    }

    public getCurrentBadge(): string {
        const currentRegion = this.getCurrentRegion();
        const currentBadge = this.getCurrentBadgeName();
        return `${currentRegion}_${currentBadge}`;
    }

    public getCurrentRegion(): string {
        return this.regions[this.currentRegionIndex];
    }

    public getCurrentBadgeName(): string {
        const currentRegion = this.getCurrentRegion();
        return this.badgesByRegion[currentRegion][this.currentBadgeIndex];
    }

    public getCollectedBadges(): Set<string> {
        return new Set(this.collectedBadges);
    }

    public getCurrentBadgeProgress(): { current: number; total: number } {
        const currentRegion = this.getCurrentRegion();
        const totalBadges = this.badgesByRegion[currentRegion]?.length || 0;
        return {
            current: this.currentBadgeIndex,
            total: totalBadges
        };
    }

    public resetProgress(): void {
        this.collectedBadges.clear();
        this.currentRegionIndex = 0;
        this.currentBadgeIndex = 0;
        this.localStorageService.save('collected_badges', []);
        this.localStorageService.save('current_region_index', 0);
        this.localStorageService.save('current_badge_index', 0);
    }

    public getCurrentBadgeCount(): number {
        const currentRegion = this.getCurrentRegion();
        return Array.from(this.collectedBadges)
            .filter(badgeId => badgeId.startsWith(currentRegion))
            .length;
    }

    public getCurrentRegionTotalBadges(): number {
        const currentRegion = this.getCurrentRegion();
        return this.badgesByRegion[currentRegion]?.length || 0;
    }
} 