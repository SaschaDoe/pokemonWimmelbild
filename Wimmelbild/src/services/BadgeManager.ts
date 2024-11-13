import { LocalStorageService } from './LocalStorageService';
import type { Badge } from '../types/interfaces';

export class BadgeManager {
    private localStorageService: LocalStorageService;
    private collectedBadges: Set<string>;
    private currentRegionIndex: number = 0;
    private regions: string[];
    private badgesByRegion: { [region: string]: string[] };
    private currentBadgeIndex: number = 0;

    constructor() {
        this.localStorageService = new LocalStorageService();
        this.collectedBadges = new Set(
            this.localStorageService.load<string[]>('collected_badges', [])
        );
        this.regions = [];
        this.badgesByRegion = {};
        this.currentRegionIndex = this.localStorageService.load<number>('current_region_index', 0);
        this.currentBadgeIndex = this.localStorageService.load<number>('current_badge_index', 0);
    }

    public async initialize(): Promise<void> {
        try {
            const response = await fetch('/badges.json');
            this.badgesByRegion = await response.json();
            this.regions = Object.keys(this.badgesByRegion);
            this.localStorageService.save('badge_regions', this.regions);
        } catch (error) {
            console.error('Failed to load badge data:', error);
        }
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

    public addCurrentBadge(): string {
        const currentRegion = this.getCurrentRegion();
        const currentBadge = this.getCurrentBadgeName();
        const badgeId = `${currentRegion}_${currentBadge}`;
        
        this.collectedBadges.add(badgeId);
        this.localStorageService.save('collected_badges', Array.from(this.collectedBadges));

        this.moveToNextBadge();
        return badgeId;
    }

    private moveToNextBadge(): void {
        const currentRegion = this.getCurrentRegion();
        const badgesInRegion = this.badgesByRegion[currentRegion];

        // If we've collected all badges in the current region
        if (this.currentBadgeIndex >= badgesInRegion.length - 1) {
            this.moveToNextRegion();
            this.currentBadgeIndex = 0;
        } else {
            this.currentBadgeIndex++;
        }

        this.localStorageService.save('current_badge_index', this.currentBadgeIndex);
    }

    public moveToNextRegion(): void {
        this.currentRegionIndex = (this.currentRegionIndex + 1) % this.regions.length;
        this.currentBadgeIndex = 0;
        this.localStorageService.save('current_region_index', this.currentRegionIndex);
        this.localStorageService.save('current_badge_index', this.currentBadgeIndex);
    }

    public resetProgress(): void {
        this.collectedBadges.clear();
        this.currentRegionIndex = 0;
        this.currentBadgeIndex = 0;
        this.localStorageService.save('collected_badges', []);
        this.localStorageService.save('current_region_index', 0);
        this.localStorageService.save('current_badge_index', 0);
    }
} 