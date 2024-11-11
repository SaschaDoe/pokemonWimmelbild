import type { GameConfig } from '../types/interfaces';

interface BackgroundInfo {
    image: string;
    mask: string;
}

interface TerrainTypeMapping {
    color: string;
    types: string[];
}

export class BackgroundService {
    private backgrounds: string[] = [];
    public dataLoaded: Promise<void>;
    private currentMaskContext: CanvasRenderingContext2D | null = null;
    private maskCanvas: HTMLCanvasElement;

    // Define terrain colors and their corresponding Pokemon types
    private readonly TERRAIN_TYPES: TerrainTypeMapping[] = [
        {
            color: '#3f48cc',  // Blue for water
            types: ['Wasser', 'Water']
        },
        {
            color: '#7f7f7f',  // Gray for flying
            types: ['Flug', 'Flying']
        },
        {
            color: '#22b14c',  // Green for bug and grass
            types: ['Kaefer', 'Bug', 'Pflanze', 'Grass']
        },
        {
            color: '#880015',  // Dark red for normal and electric
            types: ['Normal', 'Elektro', 'Electric']
        },
        {
            color: '#00a2e8',  // Light blue for ice
            types: ['Eis', 'Ice']
        }
    ];

    constructor(private config: GameConfig) {
        this.maskCanvas = document.createElement('canvas');
        this.dataLoaded = this.loadBackgrounds();
    }

    private async loadBackgrounds(): Promise<void> {
        try {
            console.log('Loading background list from JSON...');
            const response = await fetch('/backgrounds/list.json');
            this.backgrounds = await response.json();
            console.log('Available backgrounds:', this.backgrounds);
        } catch (error) {
            console.error('Failed to load backgrounds:', error);
            console.log('Falling back to default background: woods.png');
            this.backgrounds = ['woods.png'];
        }
    }

    async getRandomBackground(): Promise<BackgroundInfo> {
        await this.dataLoaded;
        
        if (this.backgrounds.length === 0) {
            console.warn('No backgrounds available, using default');
            return {
                image: '/backgrounds/woods.png',
                mask: '/backgrounds/woods_mask.png'
            };
        }

        const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
        const bgName = this.backgrounds[randomIndex];
        const maskName = bgName.replace('.png', '_mask.png');

        const backgroundInfo = {
            image: `/backgrounds/${bgName}`,
            mask: `/backgrounds/${maskName}`
        };

        console.log('Selected background:', {
            backgroundName: bgName,
            maskName: maskName,
            fullPaths: backgroundInfo
        });

        return backgroundInfo;
    }

    async loadMask(maskUrl: string): Promise<void> {
        console.log('Loading mask image:', maskUrl);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log('Mask image loaded successfully:', {
                    width: img.width,
                    height: img.height,
                    src: maskUrl
                });

                this.maskCanvas.width = img.width;
                this.maskCanvas.height = img.height;
                this.currentMaskContext = this.maskCanvas.getContext('2d');
                
                if (this.currentMaskContext) {
                    this.currentMaskContext.drawImage(img, 0, 0);
                    console.log('Mask drawn to canvas successfully');
                    resolve();
                } else {
                    const error = new Error('Failed to get canvas context');
                    console.error(error);
                    reject(error);
                }
            };

            img.onerror = (error) => {
                console.error('Failed to load mask image:', {
                    url: maskUrl,
                    error: error
                });
                reject(new Error(`Failed to load mask: ${maskUrl}`));
            };

            img.src = maskUrl;
            console.log('Started loading mask image:', maskUrl);
        });
    }

    getTerrainTypeAtPosition(x: number, y: number): string[] | null {
        if (!this.currentMaskContext) {
            console.warn('No mask context available for terrain check');
            return null;
        }

        // Convert screen coordinates to mask coordinates
        const maskX = Math.floor((x / window.innerWidth) * this.maskCanvas.width);
        const maskY = Math.floor((y / window.innerHeight) * this.maskCanvas.height);

        const pixel = this.currentMaskContext.getImageData(maskX, maskY, 1, 1).data;
        const color = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;

        // Find matching terrain type
        const terrain = this.TERRAIN_TYPES.find(t => 
            t.color.toLowerCase() === color.toLowerCase()
        );

        console.log('Terrain check:', {
            screenPosition: { x, y },
            maskPosition: { x: maskX, y: maskY },
            color: color,
            matchedTerrain: terrain?.types || 'any'
        });

        return terrain ? terrain.types : null;
    }
} 