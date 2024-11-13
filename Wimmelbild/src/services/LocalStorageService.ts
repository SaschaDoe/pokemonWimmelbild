export class LocalStorageService {
    private readonly APP_PREFIX = 'pokemon_game_';

    private getKey(key: string): string {
        return `${this.APP_PREFIX}${key}`;
    }

    public save(key: string, data: any): void {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    public load<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    public resetAll(): void {
        try {
            const keysToRemove: string[] = [];
            
            // Find all keys that belong to our app
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.APP_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all found keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            console.log('Reset all localStorage entries for the app');
        } catch (error) {
            console.error('Failed to reset localStorage:', error);
        }
    }
} 