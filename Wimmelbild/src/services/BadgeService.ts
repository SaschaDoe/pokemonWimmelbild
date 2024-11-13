import type { Badge, BadgesByRegion } from '../types/interfaces';

export class BadgeService {
    private badges: Badge[] = [];
    private _dataLoaded: Promise<void>;

    constructor() {
        this._dataLoaded = this.loadBadges();
    }

    get dataLoaded(): Promise<void> {
        return this._dataLoaded;
    }

    private async loadBadges(): Promise<void> {
        try {
            // Load badges data from JSON
            const response = await fetch('/badges.json');
            const badgesByRegion: BadgesByRegion = await response.json();

            // Convert the data structure into Badge objects
            this.badges = Object.entries(badgesByRegion).flatMap(([region, badgeNames]) =>
                badgeNames.map(name => ({
                    name,
                    region,
                    image: this.getBadgeImagePath(region, name)
                }))
            );

            // Preload images
            await this.preloadBadgeImages();

            console.log(`Loaded ${this.badges.length} badges from ${Object.keys(badgesByRegion).length} regions`);
        } catch (error) {
            console.error('Failed to load badges:', error);
            this.badges = [];
        }
    }

    private getBadgeImagePath(region: string, badgeName: string): string {
        // Capitalize first letter of the badge name
        const formattedName = badgeName.charAt(0).toUpperCase() + 
            badgeName.slice(1).toLowerCase() + 'orden';

        // Format: Region_Nameorden.png
        return `/badge_images/${region}_${formattedName}.png`;
    }

    private async preloadBadgeImages(): Promise<void> {
        const imageLoadPromises = this.badges.map(badge => {
            return new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Successfully loaded badge image: ${badge.image}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load badge image: ${badge.image}`);
                    resolve(); // Resolve anyway to continue loading other images
                };
                img.src = badge.image;
            });
        });

        await Promise.all(imageLoadPromises);
    }

    public getAllBadges(): Badge[] {
        return [...this.badges];
    }

    public getBadgesByRegion(region: string): Badge[] {
        return this.badges.filter(badge => badge.region === region);
    }

    public getBadge(region: string, name: string): Badge | undefined {
        return this.badges.find(badge => 
            badge.region === region && badge.name === name
        );
    }
} 