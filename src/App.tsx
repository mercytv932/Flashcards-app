import { useEffect, useState } from "react";
import "./App.css";

type Card = {
  front: string;
  back: string;
};

export default function App() {
  const [decks, setDecks] = useState(["JavaScript", "React", "TypeScript"]);
  const [cardsByDeck, setCardsByDeck] = useState<Record<string, Card[]>>({
    JavaScript: [],
    React: [],
    TypeScript: [],
  });
  const [activeDeck, setActiveDeck] = useState("JavaScript");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardDeleteModalOpen, setIsCardDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [cardModalMode, setCardModalMode] = useState<"new" | "edit">("new");
  const [newDeckName, setNewDeckName] = useState("");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [cardDirection, setCardDirection] = useState<
    "next" | "previous" | "empty" | ""
  >("");

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
      setCardsByDeck({ ...cardsByDeck, [deckName]: [] });
    } else {
      setDecks(decks.map((deck) => (deck === activeDeck ? deckName : deck)));
      const updatedCardsByDeck = { ...cardsByDeck };
      updatedCardsByDeck[deckName] = cardsByDeck[activeDeck] ?? [];
      delete updatedCardsByDeck[activeDeck];
      setCardsByDeck(updatedCardsByDeck);
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

  function openNewCardModal() {
    setCardModalMode("new");
    setCardFront("");
    setCardBack("");
    setIsCardModalOpen(true);
  }

  function openEditCardModal() {
    if (!currentCard) return;

    setCardModalMode("edit");
    setCardFront(currentCard.front);
    setCardBack(currentCard.back);
    setIsCardModalOpen(true);
  }

  function handleSaveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const front = cardFront.trim();
    const back = cardBack.trim();
    if (!front || !back) return;

    const updatedCards = [...(cardsByDeck[activeDeck] ?? [])];
    if (cardModalMode === "new") {
      updatedCards.push({ front, back });
    } else {
      updatedCards[currentCardIndex] = { front, back };
    }

    setCardsByDeck({ ...cardsByDeck, [activeDeck]: updatedCards });
    setCardFront("");
    setCardBack("");
    setIsFlipped(false);
    setIsCardModalOpen(false);
  }

  function removeCurrentCard() {
    const updatedCards = activeCards.filter(
      (_card, index) => index !== currentCardIndex,
    );
    const nextCardIndex = Math.min(currentCardIndex, updatedCards.length - 1);
    const nextDirection =
      updatedCards.length === 0
        ? "empty"
        : currentCardIndex < activeCards.length - 1
          ? "next"
          : "previous";

    setCardsByDeck({ ...cardsByDeck, [activeDeck]: updatedCards });
    setCurrentCardIndex(Math.max(0, nextCardIndex));
    setIsFlipped(false);
    setCardDirection(nextDirection);
    setIsDeletingCard(false);
  }

  function handleDeleteCard() {
    setIsCardDeleteModalOpen(false);
    setIsDeletingCard(true);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      removeCurrentCard();
      return;
    }

    window.setTimeout(removeCurrentCard, 280);
  }

  const activeCards = cardsByDeck[activeDeck] ?? [];
  const currentCard = activeCards[currentCardIndex];

  function handleSelectDeck(deck: string) {
    if (isDeletingCard) return;

    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCardDirection("");
  }

  function handlePreviousCard() {
    if (isDeletingCard || currentCardIndex === 0) return;

    setCurrentCardIndex((index) => index - 1);
    setIsFlipped(false);
    setCardDirection("previous");
  }

  function handleNextCard() {
    if (isDeletingCard || currentCardIndex >= activeCards.length - 1) return;

    setCurrentCardIndex((index) => index + 1);
    setIsFlipped(false);
    setCardDirection("next");
  }

  function handleFlipCard() {
    if (!currentCard || isDeletingCard) return;

    setIsFlipped((flipped) => !flipped);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleFlipCard();
  }

  useEffect(() => {
    setIsFlipped(false);
    setCurrentCardIndex(0);
    setCardDirection("");
  }, [activeDeck]);

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
                  onClick={() => handleSelectDeck(deck)}
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
                <button onClick={openNewCardModal}>New Card</button>
              </section>

              <section>
                <div
                  key={`${activeDeck}-${currentCardIndex}-${cardDirection}`}
                  className={`flashcard ${
                    isFlipped ? "is-flipped" : ""
                  } card-slide-${cardDirection} ${
                    isDeletingCard ? "is-deleting" : ""
                  }`}
                  role="button"
                  tabIndex={currentCard ? 0 : -1}
                  aria-label={isFlipped ? "Show card front" : "Show card back"}
                  aria-disabled={!currentCard}
                  onClick={handleFlipCard}
                  onKeyDown={handleCardKeyDown}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-face flashcard-front">
                      <p>{currentCard?.front ?? "No cards yet."}</p>
                    </div>
                    <div className="flashcard-face flashcard-back">
                      <p>{currentCard?.back ?? "No cards yet."}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="card-actions">
                <button onClick={openEditCardModal} disabled={!currentCard}>
                  Edit Card
                </button>
                <button
                  className="delete-button"
                  onClick={() => setIsCardDeleteModalOpen(true)}
                  disabled={!currentCard}
                >
                  Delete Card
                </button>
              </div>

              <nav>
                <button
                  onClick={handlePreviousCard}
                  disabled={currentCardIndex === 0}
                >
                  Previous
                </button>
                <button
                  onClick={handleFlipCard}
                  disabled={!currentCard}
                  aria-pressed={isFlipped}
                >
                  Flip
                </button>
                <button
                  onClick={handleNextCard}
                  disabled={
                    !currentCard || currentCardIndex === activeCards.length - 1
                  }
                >
                  Next
                </button>
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

      {isCardModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-card-title"
          >
            <h2 id="new-card-title">
              {cardModalMode === "edit" ? "Edit Card" : "Create New Card"}
            </h2>
            <form onSubmit={handleSaveCard}>
              <label htmlFor="card-front">Front</label>
              <input
                id="card-front"
                type="text"
                value={cardFront}
                onChange={(event) => setCardFront(event.target.value)}
                required
                autoFocus
              />

              <label htmlFor="card-back">Back</label>
              <textarea
                id="card-back"
                value={cardBack}
                onChange={(event) => setCardBack(event.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="button" onClick={() => setIsCardModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">
                  {cardModalMode === "edit" ? "Save Card" : "Add Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCardDeleteModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-card-title"
            aria-describedby="delete-card-message"
          >
            <h2 id="delete-card-title">Delete Card?</h2>
            <p id="delete-card-message" className="delete-modal-message">
              Are you sure you want to delete &quot;{currentCard?.front}&quot;?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsCardDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleDeleteCard}
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
