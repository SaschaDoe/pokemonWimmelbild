import type { GameConfig } from '../types/interfaces';
import { LocalStorageService } from './LocalStorageService';
import { ConfigService } from '../config/ConfigService';

interface BackgroundInfo {
    image: string;
    mask: string;
    isArena?: boolean;
}

interface TerrainTypeMapping {
    color: string;
    types: string[];
}

export class BackgroundService {
    private backgrounds: string[] = [];
    private unusedBackgrounds: string[] = [];
    private readonly ARENA_BACKGROUND = 'arena.png';
    public dataLoaded: Promise<void>;
    private currentMaskContext: CanvasRenderingContext2D | null = null;
    private maskCanvas: HTMLCanvasElement;
    private localStorageService: LocalStorageService;
    private configService: ConfigService;
    private currentBackgroundInfo: BackgroundInfo | null = null;
    private needsNewBackground: boolean = false;
    private currentBackgroundNumber: number = 0;
    
    // Define terrain colors and their corresponding Pokemon types
    private readonly TERRAIN_TYPES: TerrainTypeMapping[] = [
        {
            color: '##000000',  // Black
            types: ['Nichts', 'Nothing']
        },
        {
            color: '#3f48cc',  // Blue for water
            types: ['Wasser', 'Water']
        },
        {
            color: '#7f7f7f',  // Gray for flying
            types: ['Flug', 'Flying']
        },
        {
            color: '#22b14c',  // Green 
            types: ['Kaefer', 'Bug', 'Pflanze', 'Grass']
        },
        {
            color: '#880015',  // Dark red 
            types: ['Normal', 'Elektro', 'Electric', "Gift", "Poison"]
        },
        {
            color: '#00a2e8',  // Light blue for ice
            types: ['Eis', 'Ice']
        },
        {
            color: '#a349a4',  // magenta
            types: ['Boden', 'Ground', 'Gestein', 'Rock', 'Stahl', 'Steel']
        },
        {
            color: '#ed1c24',  // red
            types: ['Feuer', 'Fire', 'Gestein', 'Rock', 'Stahl', 'Steel']
        },
        {
            color: '#ff7f27',  // orange
            types: ['Kampf', 'Fighting']
        }
    ];

    constructor(private config: GameConfig) {
        this.maskCanvas = document.createElement('canvas');
        this.localStorageService = new LocalStorageService();
        this.configService = ConfigService.getInstance();
        this.dataLoaded = this.loadBackgrounds();
    }

    private async loadBackgrounds(): Promise<void> {
        try {
            console.log('Loading background list from JSON...');
            const response = await fetch('./backgrounds/list.json');
            let allBackgrounds: string[] = await response.json();
            
            // Remove arena from both lists - it should only be used for final battle
            this.backgrounds = allBackgrounds.filter(bg => bg !== this.ARENA_BACKGROUND);
            
            const settings = this.configService.getSettings();
            
            if (settings.CHEAT_MODE) {
                // In cheat mode, set current background to total number
                this.currentBackgroundNumber = this.backgrounds.length;
                this.unusedBackgrounds = [this.backgrounds[0]];
                console.log('CHEAT MODE: Set to last background');
            } else {
                // Load current background number from localStorage
                this.currentBackgroundNumber = this.localStorageService.load<number>(
                    'current_background_number',
                    0
                );
                this.unusedBackgrounds = this.localStorageService.load<string[]>(
                    'unused_backgrounds',
                    [...this.backgrounds]
                );
            }
            
            console.log('Backgrounds loaded:', {
                total: this.backgrounds.length,
                current: this.currentBackgroundNumber,
                unused: this.unusedBackgrounds.length,
                cheatMode: settings.CHEAT_MODE
            });
        } catch (error) {
            console.error('Failed to load backgrounds:', error);
            this.backgrounds = ['woods.png'];
            this.unusedBackgrounds = ['woods.png'];
            this.currentBackgroundNumber = 0;
        }
    }

    private shuffleBackgrounds(): void {
        if (this.unusedBackgrounds.length === 0) {
            console.log('All backgrounds used, resetting pool');
            this.unusedBackgrounds = [...this.backgrounds];
        }
        
        // Fisher-Yates shuffle
        for (let i = this.unusedBackgrounds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.unusedBackgrounds[i], this.unusedBackgrounds[j]] = 
            [this.unusedBackgrounds[j], this.unusedBackgrounds[i]];
        }

        // Save to localStorage after shuffle
        this.localStorageService.save('unused_backgrounds', this.unusedBackgrounds);
    }

    public resetProgress(): void {
        const settings = this.configService.getSettings();
        
        if (settings.CHEAT_MODE) {
            // In cheat mode, set to last background to trigger arena
            this.currentBackgroundNumber = this.backgrounds.length;
            this.unusedBackgrounds = [];
        } else {
            // Normal reset - start from beginning
            this.unusedBackgrounds = [...this.backgrounds];
            this.currentBackgroundNumber = 0;
        }
        
        this.needsNewBackground = true;
        this.currentBackgroundInfo = null;
        this.localStorageService.save('current_background_number', this.currentBackgroundNumber);
        this.localStorageService.save('current_background', null);
        this.localStorageService.save('unused_backgrounds', this.unusedBackgrounds);
    }

    public completeArenaCycle(): void {
        // Reset everything to start a new cycle
        this.unusedBackgrounds = [...this.backgrounds];
        this.currentBackgroundNumber = 0;
        this.needsNewBackground = true;
        this.currentBackgroundInfo = null;
        
        // Save the reset state
        this.localStorageService.save('current_background_number', this.currentBackgroundNumber);
        this.localStorageService.save('current_background', null);
        this.localStorageService.save('unused_backgrounds', this.unusedBackgrounds);
        
        console.log('Arena cycle completed, starting new cycle');
    }

    private getMaskName(bgName: string): string {
        return bgName.endsWith('.jpg') ? 
            bgName.replace('.jpg', '_mask.png') : 
            bgName.replace('.png', '_mask.png');
    }

    async getRandomBackground(): Promise<BackgroundInfo> {
        await this.dataLoaded;

        if (!this.needsNewBackground && this.currentBackgroundInfo) {
            return this.currentBackgroundInfo;
        }

        this.needsNewBackground = false;

        if (this.backgrounds.length === 0) {
            return {
                image: '/backgrounds/woods.png',
                mask: '/backgrounds/woods_mask.png',
                isArena: false
            };
        }

        // If all backgrounds are used, show arena
        if (this.unusedBackgrounds.length === 0) {
            const bgName = this.ARENA_BACKGROUND;
            const maskName = this.getMaskName(bgName);
            
            const backgroundInfo = {
                image: `/backgrounds/${bgName}`,
                mask: `/backgrounds/${maskName}`,
                isArena: true
            };
            
            this.currentBackgroundInfo = backgroundInfo;
            this.localStorageService.save('current_background', bgName);
            
            return backgroundInfo;
        }

        // Get random background from unused pool without removing it
        const randomIndex = Math.floor(Math.random() * this.unusedBackgrounds.length);
        const bgName = this.unusedBackgrounds[randomIndex];
        const maskName = this.getMaskName(bgName);
        
        const backgroundInfo = {
            image: `/backgrounds/${bgName}`,
            mask: `/backgrounds/${maskName}`,
            isArena: false
        };

        // Save current background info but don't remove from unused list yet
        this.currentBackgroundInfo = backgroundInfo;
        this.localStorageService.save('current_background', bgName);

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

        // For other colors, use the existing exact matching
        const color = `#${[pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('')}`;

        // Find matching terrain type
        const terrain = this.TERRAIN_TYPES.find(t => 
            t.color.toLowerCase() === color.toLowerCase()
        );

        if(color === '#a349a4'){
            console.log("found");
        }

        console.log('Terrain check:', {
            screenPosition: { x, y },
            maskPosition: { x: maskX, y: maskY },
            rgbValues: [pixel[0], pixel[1], pixel[2]],
            color: color,
            matchedTerrain: terrain?.types || 'any'
        });

        return terrain ? terrain.types : null;
    }

    public getTotalBackgrounds(): number {
        return this.backgrounds.length;
    }

    public getRemainingBackgrounds(): number {
        return this.unusedBackgrounds.length;
    }

    // Add method to force next background
    public prepareNextBackground(): void {
        this.needsNewBackground = true;
        this.currentBackgroundInfo = null;
        this.localStorageService.save('current_background', null);
    }

    public getCurrentBackgroundNumber(): number {
        return this.currentBackgroundNumber;
    }

    public incrementBackgroundNumber(): void {
        if (this.currentBackgroundNumber < this.backgrounds.length) {
            this.currentBackgroundNumber++;
            this.localStorageService.save('current_background_number', this.currentBackgroundNumber);
            this.needsNewBackground = true;
        }
    }

    // Add method to remove current background from unused list
    public removeCurrentBackground(): void {
        if (this.currentBackgroundInfo && !this.currentBackgroundInfo.isArena) {
            const currentBgName = this.currentBackgroundInfo.image.split('/').pop()!;
            const index = this.unusedBackgrounds.indexOf(currentBgName);
            if (index > -1) {
                this.unusedBackgrounds.splice(index, 1);
                this.localStorageService.save('unused_backgrounds', this.unusedBackgrounds);
                console.log('Removed background:', {
                    removed: currentBgName,
                    remaining: this.unusedBackgrounds.length
                });
            }
        }
    }
} 