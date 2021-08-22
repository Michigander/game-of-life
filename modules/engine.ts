interface Sensor {
  type: string;
}

export interface Snapshot {
  state: any;
  sensors: Sensor[];
}

function fulfillSenses(
  generation: Snapshot[],
  senses: Record<string, Function>
): any[] {
  return generation.map(({ sensors }, agentIndex) =>
    sensors.map(({ type }) => {
      return senses[type](generation, agentIndex);
    })
  );
}

async function* createEngine<T>(
  agents: Array<AsyncGenerator<T>>,
  tickMs: number = 2000
): AsyncGenerator<Array<T>> {
  let feedback: any = [];
  while (true) {
    const agentPromises = agents.map((agent, i) =>
      agent.next(feedback[i]).then(({ value }) => value)
    );
    feedback = yield await Promise.all(agentPromises);
    await new Promise((resolve) => setTimeout(resolve, tickMs));
  }
}

async function* createEnvironment(
  engine: AsyncGenerator<Array<Snapshot>>,
  senses: Record<string, any>
) {
  let feedback: any[] = [];
  let isDone = false;
  while (!isDone) {
    const { value, done } = await engine.next(feedback);
    yield value;
    isDone = done ?? false;
    feedback = fulfillSenses(value, senses);
  }
}

export function createWorld(
  population: Array<AsyncGenerator<Snapshot>>,
  senses: Record<string, any>
): AsyncGenerator<Array<Snapshot>> {
  return createEnvironment(createEngine(population), senses);
}
