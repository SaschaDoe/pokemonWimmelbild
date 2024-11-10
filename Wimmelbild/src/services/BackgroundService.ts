import type { GameConfig } from '../types/interfaces';

export class BackgroundService {
    private backgrounds: string[] = [];
    public dataLoaded: Promise<void>;

    constructor(private config: GameConfig) {
        this.dataLoaded = this.loadBackgrounds();
    }

    private async loadBackgrounds(): Promise<void> {
        try {
            const response = await fetch('/backgrounds/list.json');
            this.backgrounds = await response.json();
            console.log(`Loaded ${this.backgrounds.length} backgrounds`);
        } catch (error) {
            console.error('Failed to load backgrounds:', error);
            this.backgrounds = ['woods.png'];
        }
    }

    async getRandomBackground(): Promise<string> {
        await this.dataLoaded;
        
        if (this.backgrounds.length === 0) {
            return '/backgrounds/woods.png';
        }

        const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
        return `/backgrounds/${this.backgrounds[randomIndex]}`;
    }

    getAllBackgrounds(): string[] {
        return this.backgrounds;
    }
} 