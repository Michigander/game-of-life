import { html, render } from "lit-html";
import { asyncReplace } from "lit-html/directives/async-replace";
import gameOfLife from "./gameOfLife";

// world(seed.map((row) => row.map((isAlive) => GOLAgent(isAlive))));

// We can also render the state of the world
async function* renderer() {
  for await (const state of gameOfLife()) {
    // console.log(`Rendering with ${JSON.stringify(state, null, 2)}`);
    yield html`
      <div
        id="gol-grid"
        style="grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr);"
      >
        ${state.map(
          ({ state, coords: [x, y] }) => html`
            <div
              class="cell"
              style="grid-column: ${x + 1}; grid-row: ${y + 1};"
            >
              ${state ? html`<div class="being"></div>` : undefined}
            </div>
          `
        )}
      </div>
    `;
  }
}

render(asyncReplace(renderer()), document.body);
