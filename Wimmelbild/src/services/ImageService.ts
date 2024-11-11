export class ImageService {
    async testImageExists(imagePath: string, itemData: { name: string, id: string, types: string[] }): Promise<void> {
        try {
            const response = await fetch(imagePath);
            if (!response.ok) {
                console.error(`Failed to load image:`, {
                    name: itemData.name,
                    id: itemData.id,
                    types: itemData.types,
                    path: imagePath,
                    status: response.status,
                    statusText: response.statusText
                });
            }
        } catch (error) {
            console.error(`Error testing image existence:`, {
                name: itemData.name,
                id: itemData.id,
                types: itemData.types,
                path: imagePath,
                error
            });
        }
    }

    getPokemonImagePath(id: number, pokemonData: { name: string, types: string[] }): string {
        try {
            const idStr = id.toString();
            const paddedId = idStr.length >= 4 ? idStr : idStr.padStart(4, '0');
            const nameWithId = `${paddedId}${pokemonData.name}`;
            
            const filename = pokemonData.types.length === 0 
                ? nameWithId 
                : `${nameWithId}-${pokemonData.types.join('-')}`;
            
            const path = `/pokemon_images/${filename}.png`;
            
            console.log(`Constructed image path:`, {
                id: paddedId,
                name: pokemonData.name,
                types: pokemonData.types,
                path
            });
            
            return path;
        } catch (error) {
            console.error(`Error creating image path for Pokemon ${id}:`, {
                error,
                pokemonData
            });
            return '/pokemon_images/missing.png';
        }
    }
} 