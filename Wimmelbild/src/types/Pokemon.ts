export interface Pokemon {
  pokemon_id: string;
  name: string;
  image_url: string;
  local_image: string;
  position?: {
    x: number;
    y: number;
  };
} 