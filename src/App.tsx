import "./App.css";

export default function App() {
  return (
    <div>
      <header>
        <h1>Flashcards Study App</h1>
        <button>New Deck</button>
      </header>

      <div>
        <aside>
          <h2>Decks</h2>
          <ul>
            <li>JavaScript</li>
            <li>React</li>
            <li>TypeScript</li>
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
    </div>
  );
}
