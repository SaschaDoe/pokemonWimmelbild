export interface GameSettings {
    CHEAT_MODE: boolean;
    FILL_BACKGROUNDS: boolean;
    DEBUG_MODE: boolean;
    LAST_BADGE_MODE: boolean;
}

export class ConfigService {
    private static instance: ConfigService;
    private settings: GameSettings = {
        CHEAT_MODE: false,      // Skip to last background
        FILL_BACKGROUNDS: false, // Fill all backgrounds when resetting
        DEBUG_MODE: false,      // Enable debug logging
        LAST_BADGE_MODE: false  // Skip to last badge of last region
    };

    private constructor() {}

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    public getSettings(): GameSettings {
        return { ...this.settings };
    }

    public updateSettings(newSettings: Partial<GameSettings>): void {
        this.settings = {
            ...this.settings,
            ...newSettings
        };

        if (this.settings.DEBUG_MODE) {
            console.log('Settings updated:', this.settings);
        }
    }
} 