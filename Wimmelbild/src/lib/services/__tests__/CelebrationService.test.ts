import { CelebrationService } from '../CelebrationService';

describe('CelebrationService', () => {
    it('should store the pokemon ID to celebrate', () => {
        const service = new CelebrationService();
        const pokemonId = 25;
        
        service.setCelebrationPokemon(pokemonId);
        
        expect(service.getCelebrationPokemon()).toBe(pokemonId);
    });
}); 