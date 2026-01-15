import { useState } from 'react';

function Game() {
  const [joueurActuel, setJoueurActuel] = useState<1 | 2>(1);

  const gererClicColonne = (indexColonne: number) => {
    console.log(`Colonne: ${indexColonne + 1}`);
  };

  // Créer la grille 6 lignes x 7 colonnes
  const afficherPlateau = () => {
    const lignes = [];
    for (let ligne = 0; ligne < 6; ligne++) {
      for (let colonne = 0; colonne < 7; colonne++) {
        lignes.push(
          <button
            key={`${ligne}-${colonne}`}
            onClick={() => gererClicColonne(colonne)}
            className="w-12 h-12 bg-white rounded-full hover:bg-gray-100"
          />
        );
      }
    }
    return lignes;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Puissance 4</h1>
        
        <div className="bg-blue-600 p-4 rounded-lg inline-block">
          <div className="grid grid-cols-7 gap-2">
            {afficherPlateau()}
          </div>
        </div>

        <h2 className={`text-xl mt-4 ${joueurActuel === 1 ? 'text-red-500' : 'text-yellow-500'}`}>
          Joueur {joueurActuel} ({joueurActuel === 1 ? 'Rouge' : 'Jaune'})
        </h2>
      </div>
    </div>
  );
}

export default Game

