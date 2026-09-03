import { useState } from "react";
import "./App.css";
export default function App() {
  const [decks, setDecks] = useState(["JavaScript", "React", "TypeScript"]);
  const [activeDeck, setActiveDeck] = useState("JavaScript");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  function handleDeleteDeck() {
    const remainingDecks = decks.filter((deck) => deck !== activeDeck);
    setDecks(remainingDecks);
    setActiveDeck(remainingDecks[0] ?? "");
    setIsDeleteModalOpen(false);
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
          {decks.length > 0 ? (
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
          ) : (
            <p className="empty-state">No decks yet.</p>
          )}
        </aside>

        <main>
          {activeDeck ? (
            <>
              <section>
                <div className="deck-title-row">
                  <h2>{activeDeck}</h2>
                  <button onClick={openEditDeckModal}>Edit Deck</button>
                  <button
                    className="delete-button"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete Deck
                  </button>
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
            </>
          ) : (
            <p className="main-empty-state">Create a deck to start studying.</p>
          )}
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

      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-deck-title"
            aria-describedby="delete-deck-message"
          >
            <h2 id="delete-deck-title">Delete Deck?</h2>
            <p id="delete-deck-message" className="delete-modal-message">
              Are you sure you want to delete &quot;{activeDeck}&quot;?
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleDeleteDeck}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
