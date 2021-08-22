import { Snapshot, createWorld } from "./engine";

/*

The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, live or dead, (or populated and unpopulated, respectively). Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:

Any live cell with fewer than two live neighbours dies, as if by underpopulation.
Any live cell with two or three live neighbours lives on to the next generation.
Any live cell with more than three live neighbours dies, as if by overpopulation.
Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
These rules, which compare the behavior of the automaton to real life, can be condensed into the following:

Any live cell with two or three live neighbours survives.
Any dead cell with three live neighbours becomes a live cell.
All other live cells die in the next generation. Similarly, all other dead cells stay dead.
The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed, live or dead; births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick. Each generation is a pure function of the preceding one. The rules continue to be applied repeatedly to create further generations.

*/

const getIndex2d = (i: number, rowCount: number, colCount: number) => [
  i % rowCount,
  Math.floor(i / colCount),
];

const neighborDeltas1d = (rowCount: number) => [
  -(rowCount + 1),
  -rowCount,
  -(rowCount - 1),
  -1,
  1,
  rowCount - 1,
  rowCount,
  rowCount + 1,
];

type Seed = Array<Array<boolean>>;

const barSeed: Seed = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, true, true, true, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
];

const willSurvive = (aliveCount: number): boolean => {
  switch (aliveCount) {
    case 2:
    case 3:
      return true;
    default:
      return false;
  }
};

const willEmerge = (aliveCount: number): boolean => aliveCount === 3;

async function* gameOfLifeAgent(
  isAlive: boolean
): AsyncGenerator<Snapshot, any, any> {
  while (true) {
    const [aliveCount] = yield {
      state: isAlive,
      sensors: [{ type: "alive-neighbors" }],
    };
    const next = isAlive ? willSurvive(aliveCount) : willEmerge(aliveCount);
    isAlive = next;
  }
}

export default async function* gameOfLife(seed: Seed = barSeed) {
  const effects = {
    "alive-neighbors": (generation: Snapshot[], i: number) =>
      neighborDeltas1d(seed[0].length)
        .map((delta) => generation[i + delta])
        .filter((agent) => agent?.state).length,
  };

  const agents = seed.flatMap((row) =>
    row.flatMap((isAlive) => gameOfLifeAgent(isAlive))
  );

  for await (const generation of createWorld(agents, effects)) {
    yield generation.map(({ state }, i) => ({
      state,
      coords: getIndex2d(i, seed[0].length, seed.length),
    }));
  }
}
