import { html, render } from 'lit-html';
import { multi_trader_backend } from 'declarations/multi-trader-backend';
import logo from './logo2.svg';

class App {
  greeting = '';

  constructor() {
    this.#render();
  }

  #handleSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    this.greeting = await multi_trader_backend.greet(name);
    this.#render();
  };

  #render() {
  let body = html`
    <main class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <img src="${logo}" alt="DFINITY logo" class="w-32 h-32 mb-6" />
      <form class="flex flex-col gap-4 w-full max-w-sm" action="#">
        <label for="name" class="text-lg font-medium text-gray-700">Enter your name:</label>
        <input
          id="name"
          type="text"
          class="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your name"
        />
        <button
          type="submit"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Click Me!
        </button>
      </form>
      <section id="greeting" class="mt-6 text-xl font-semibold text-indigo-800">
        ${this.greeting}
      </section>
    </main>
  `;
  render(body, document.getElementById('root'));
  document.querySelector('form').addEventListener('submit', this.#handleSubmit);
}

}

export default App;
