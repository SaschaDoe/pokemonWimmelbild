import { useState } from 'react';
import confetti from 'canvas-confetti';
import { PokemonList } from './PokemonList';
import WinMessage from './WinMessage';

function Game() {
  const [showingWinningPokemon, setShowingWinningPokemon] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);

  const handleCorrectGuess = async () => {
    setShowingWinningPokemon(true);
    
    // Wait for the PokemonList to open and scroll
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Close pokemon list and show win message after celebration
    setTimeout(() => {
      setShowingWinningPokemon(false);
      setShowWinMessage(true);
    }, 3000);
  };

  return (
    <div className="game-container">
      {/* ... other game components */}

      {showingWinningPokemon && (
        <div className="pokemon-list-overlay">
          <PokemonList 
            isOpen={true}
            pokemonToHighlight={currentPokemon}
            celebrationMode={true}
          />
        </div>
      )}
      
      {showWinMessage && !showingWinningPokemon && <WinMessage />}
    </div>
  );
} 