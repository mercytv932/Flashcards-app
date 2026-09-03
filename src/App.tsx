import { useState } from "react";
import "./App.css";
export default function App() {
  const [decks, setDecks] = useState(["JavaScript", "React", "TypeScript"]);
  const [activeDeck, setActiveDeck] = useState("JavaScript");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [newDeckName, setNewDeckName] = useState("");

  function openNewDeckModal() {
    setModalMode("new");
    setNewDeckName("");
    setIsModalOpen(true);
  }

  function openEditDeckModal() {
    setModalMode("edit");
    setNewDeckName(activeDeck);
    setIsModalOpen(true);
  }

  function handleSaveDeck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const deckName = newDeckName.trim();
    if (!deckName) return;

    if (modalMode === "new") {
      setDecks([...decks, deckName]);
    } else {
      setDecks(decks.map((deck) => (deck === activeDeck ? deckName : deck)));
      setActiveDeck(deckName);
    }

    setNewDeckName("");
    setIsModalOpen(false);
  }

  return (
    <div className="App">
      <header>
        <h1>Flashcards Study App</h1>
        <button onClick={openNewDeckModal}>New Deck</button>
      </header>

      <div className="app-layout">
        <aside>
          <h2>Decks</h2>
          <ul>
            {decks.map((deck) => (
              <li
                key={deck}
                className={deck === activeDeck ? "active" : ""}
                onClick={() => setActiveDeck(deck)}
              >
                {deck}
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <section>
            <div className="deck-title-row">
              <h2>{activeDeck}</h2>
              <button onClick={openEditDeckModal}>Edit Deck</button>
            </div>

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
            aria-labelledby="deck-modal-title"
          >
            <h2 id="deck-modal-title">
              {modalMode === "edit" ? "Edit Deck" : "Create New Deck"}
            </h2>
            <form onSubmit={handleSaveDeck}>
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
                <button type="submit">
                  {modalMode === "edit" ? "Save Deck" : "Add Deck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
