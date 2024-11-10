import type { GameConfig } from '../types/interfaces';

interface BackgroundInfo {
    image: string;
    mask: string;
}

export class BackgroundService {
    private backgrounds: string[] = [];
    public dataLoaded: Promise<void>;
    private currentMaskContext: CanvasRenderingContext2D | null = null;
    private maskCanvas: HTMLCanvasElement;

    readonly WATER_COLOR = '#3f48cc';

    constructor(private config: GameConfig) {
        this.maskCanvas = document.createElement('canvas');
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

    async getRandomBackground(): Promise<BackgroundInfo> {
        await this.dataLoaded;
        
        if (this.backgrounds.length === 0) {
            return {
                image: '/backgrounds/woods.png',
                mask: '/backgrounds/woods_mask.png'
            };
        }

        const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
        const bgName = this.backgrounds[randomIndex];
        const maskName = bgName.replace('.png', '_mask.png');

        return {
            image: `/backgrounds/${bgName}`,
            mask: `/backgrounds/${maskName}`
        };
    }

    async loadMask(maskUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.maskCanvas.width = img.width;
                this.maskCanvas.height = img.height;
                this.currentMaskContext = this.maskCanvas.getContext('2d');
                if (this.currentMaskContext) {
                    this.currentMaskContext.drawImage(img, 0, 0);
                    resolve();
                } else {
                    reject(new Error('Failed to get canvas context'));
                }
            };
            img.onerror = () => reject(new Error(`Failed to load mask: ${maskUrl}`));
            img.src = maskUrl;
        });
    }

    getTerrainTypeAtPosition(x: number, y: number): string | null {
        if (!this.currentMaskContext) return null;

        // Convert screen coordinates to mask coordinates
        const maskX = Math.floor((x / window.innerWidth) * this.maskCanvas.width);
        const maskY = Math.floor((y / window.innerHeight) * this.maskCanvas.height);

        const pixel = this.currentMaskContext.getImageData(maskX, maskY, 1, 1).data;
        const color = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;

        if (color.toLowerCase() === this.WATER_COLOR.toLowerCase()) {
            return 'water';
        }

        return null;
    }
} 