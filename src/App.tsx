import { useState } from "react";
import "./App.css";
export default function App() {
  const [decks, setDecks] = useState(["JavaScript", "React", "TypeScript"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  function handleAddDeck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const deckName = newDeckName.trim();
    if (!deckName) return;

    setDecks([...decks, deckName]);
    setNewDeckName("");
    setIsModalOpen(false);
  }

  return (
    <div className="App">
      <header>
        <h1>Flashcards Study App</h1>
        <button onClick={() => setIsModalOpen(true)}>New Deck</button>
      </header>

      <div className="app-layout">
        <aside>
          <h2>Decks</h2>
          <ul>
            {decks.map((deck) => (
              <li key={deck}>{deck}</li>
            ))}
          </ul>
        </aside>

        <main>
          <section>
            <h2>JavaScript</h2>

            <input type="search" placeholder="Search cards..." />
            <button>Shuffle</button>
            <button>New Card</button>
          </section>

          <section>
            <div>
              <p>Flashcard question goes here.</p>
            </div>
          </section>

          <nav>
            <button>Previous</button>
            <button>Flip</button>
            <button>Next</button>
          </nav>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-deck-title"
          >
            <h2 id="new-deck-title">Create New Deck</h2>
            <form onSubmit={handleAddDeck}>
              <label htmlFor="deck-name">Deck name</label>
              <input
                id="deck-name"
                type="text"
                value={newDeckName}
                onChange={(event) => setNewDeckName(event.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Add Deck</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
