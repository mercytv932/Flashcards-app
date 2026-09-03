import { useEffect, useState } from "react";
import "./App.css";

type Card = {
  front: string;
  back: string;
};

type SavedAppData = {
  decks: string[];
  cardsByDeck: Record<string, Card[]>;
  activeDeck: string;
};

const STORAGE_KEY = "flashcards-app-data";

function loadSavedData(): SavedAppData {
  const defaultData: SavedAppData = {
    decks: ["JavaScript", "React", "TypeScript"],
    cardsByDeck: {
      JavaScript: [],
      React: [],
      TypeScript: [],
    },
    activeDeck: "JavaScript",
  };

  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return defaultData;

    const parsedData = JSON.parse(savedData);
    if (
      !Array.isArray(parsedData.decks) ||
      !parsedData.decks.every((deck: unknown) => typeof deck === "string") ||
      !parsedData.cardsByDeck ||
      typeof parsedData.cardsByDeck !== "object"
    ) {
      return defaultData;
    }

    const decks = parsedData.decks as string[];
    const cardsByDeck: Record<string, Card[]> = {};

    for (const deck of decks) {
      const cards = parsedData.cardsByDeck[deck];
      cardsByDeck[deck] = Array.isArray(cards)
        ? cards.filter(
            (card: unknown): card is Card =>
              Boolean(card) &&
              typeof card === "object" &&
              typeof (card as Card).front === "string" &&
              typeof (card as Card).back === "string",
          )
        : [];
    }

    return {
      decks,
      cardsByDeck,
      activeDeck:
        typeof parsedData.activeDeck === "string" &&
        decks.includes(parsedData.activeDeck)
          ? parsedData.activeDeck
          : (decks[0] ?? ""),
    };
  } catch {
    return defaultData;
  }
}

const initialData = loadSavedData();

export default function App() {
  const [decks, setDecks] = useState(initialData.decks);
  const [cardsByDeck, setCardsByDeck] = useState<Record<string, Card[]>>(
    initialData.cardsByDeck,
  );
  const [activeDeck, setActiveDeck] = useState(initialData.activeDeck);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardDeleteModalOpen, setIsCardDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit">("new");
  const [cardModalMode, setCardModalMode] = useState<"new" | "edit">("new");
  const [newDeckName, setNewDeckName] = useState("");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isShufflingCards, setIsShufflingCards] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<"out" | "in" | "">("");
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

  function resetStudyView() {
    setIsFlipped(false);
    setCurrentCardIndex(0);
    setCardDirection("");
    setShufflePhase("");
    setIsShufflingCards(false);
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
      resetStudyView();
    }

    setNewDeckName("");
    setIsModalOpen(false);
  }

  function handleDeleteDeck() {
    const remainingDecks = decks.filter((deck) => deck !== activeDeck);
    const updatedCardsByDeck = { ...cardsByDeck };
    delete updatedCardsByDeck[activeDeck];

    setDecks(remainingDecks);
    setCardsByDeck(updatedCardsByDeck);
    setActiveDeck(remainingDecks[0] ?? "");
    resetStudyView();
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
      const originalCardIndex = activeCards.indexOf(currentCard);
      if (originalCardIndex === -1) return;
      updatedCards[originalCardIndex] = { front, back };
    }

    setCardsByDeck({ ...cardsByDeck, [activeDeck]: updatedCards });
    setCardFront("");
    setCardBack("");
    setIsFlipped(false);
    setIsCardModalOpen(false);
  }

  function removeCurrentCard() {
    const updatedCards = activeCards.filter((card) => card !== currentCard);
    const nextCardIndex = Math.min(currentCardIndex, filteredCards.length - 2);
    const nextDirection =
      filteredCards.length === 1
        ? "empty"
        : currentCardIndex < filteredCards.length - 1
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
  const searchText = searchQuery.trim().toLowerCase();
  const filteredCards = activeCards.filter(
    (card) =>
      !searchText ||
      card.front.toLowerCase().includes(searchText) ||
      card.back.toLowerCase().includes(searchText),
  );
  const currentCard = filteredCards[currentCardIndex];

  function handleSelectDeck(deck: string) {
    if (isDeletingCard || isShufflingCards) return;

    setActiveDeck(deck);
    resetStudyView();
  }

  function handlePreviousCard() {
    if (isDeletingCard || isShufflingCards || currentCardIndex === 0) return;

    setCurrentCardIndex((index) => index - 1);
    setIsFlipped(false);
    setCardDirection("previous");
  }

  function handleNextCard() {
    if (
      isDeletingCard ||
      isShufflingCards ||
      currentCardIndex >= filteredCards.length - 1
    )
      return;

    setCurrentCardIndex((index) => index + 1);
    setIsFlipped(false);
    setCardDirection("next");
  }

  function handleShuffleCards() {
    if (isDeletingCard || isShufflingCards || activeCards.length === 0) return;

    function applyShuffle() {
      const shuffledCards = [...activeCards];
      for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledCards[index], shuffledCards[randomIndex]] = [
          shuffledCards[randomIndex],
          shuffledCards[index],
        ];
      }

      setCardsByDeck({ ...cardsByDeck, [activeDeck]: shuffledCards });
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setCardDirection("");
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      applyShuffle();
      return;
    }

    setIsShufflingCards(true);
    setShufflePhase("out");
    window.setTimeout(() => {
      applyShuffle();
      setShufflePhase("in");
      window.setTimeout(() => {
        setShufflePhase("");
        setIsShufflingCards(false);
      }, 180);
    }, 180);
  }

  function handleFlipCard() {
    if (!currentCard || isDeletingCard || isShufflingCards) return;

    setIsFlipped((flipped) => !flipped);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleFlipCard();
  }

  useEffect(() => {
    if (
      !isModalOpen &&
      !isDeleteModalOpen &&
      !isCardModalOpen &&
      !isCardDeleteModalOpen
    ) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setIsModalOpen(false);
      setIsDeleteModalOpen(false);
      setIsCardModalOpen(false);
      setIsCardDeleteModalOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, isDeleteModalOpen, isCardModalOpen, isCardDeleteModalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ decks, cardsByDeck, activeDeck }),
      );
    } catch {
      return;
    }
  }, [decks, cardsByDeck, activeDeck]);

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
                <li key={deck}>
                  <button
                    className={deck === activeDeck ? "active" : ""}
                    onClick={() => handleSelectDeck(deck)}
                    aria-current={deck === activeDeck ? "true" : undefined}
                  >
                    {deck}
                  </button>
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

                <input
                  type="search"
                  placeholder="Search cards..."
                  aria-label="Search cards"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    resetStudyView();
                  }}
                />
                <button
                  onClick={handleShuffleCards}
                  disabled={!currentCard || isDeletingCard}
                >
                  Shuffle
                </button>
                <button onClick={openNewCardModal}>New Card</button>
              </section>

              <section>
                <div
                  key={`${activeDeck}-${currentCardIndex}-${cardDirection}`}
                  className={`flashcard ${
                    isFlipped ? "is-flipped" : ""
                  } card-slide-${cardDirection} ${
                    isDeletingCard ? "is-deleting" : ""
                  } card-shuffle-${shufflePhase} ${
                    isShufflingCards ? "is-shuffling" : ""
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
                      <p>
                        {currentCard?.front ??
                          (searchText ? "No cards found." : "No cards yet.")}
                      </p>
                    </div>
                    <div className="flashcard-face flashcard-back">
                      <p>
                        {currentCard?.back ??
                          (searchText ? "No cards found." : "No cards yet.")}
                      </p>
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
                    !currentCard ||
                    currentCardIndex === filteredCards.length - 1
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
                required
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
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                autoFocus
              >
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
                autoFocus
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
