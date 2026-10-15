import { expect } from "vitest";

/**
 * Fakes database replies by matching each query's SQL text, not call order.
 * Throws if a query matches no key or more than one key.
 * After the callback runs, checks that every listed query was called, and nothing else.
 */
export const withMockedQueries = async <T>(
  client: { query: any },
  responses: Record<string, unknown>,
  callback: () => Promise<T>,
): Promise<T> => {
  client.query.mockImplementation(async (sql: string) => {
    const keys = Object.keys(responses).filter((k) => sql.includes(k));
    const key = keys[0];

    if (keys.length === 0 || key === undefined) {
      throw new Error(`Unexpected query: ${sql}`);
    }
    if (keys.length > 1) {
      throw new Error(`Ambiguous query, matched [${keys.join(", ")}]: ${sql}`);
    }

    const result = responses[key];
    if (result instanceof Error) throw result;
    return result;
  });

  const callbackResult = await callback();

  for (const key of Object.keys(responses)) {
    const wasCalled = client.query.mock.calls.some((c: unknown[]) =>
      String(c[0]).includes(key),
    );
    expect(wasCalled, `Expected a query containing "${key}" to be called`).toBe(
      true,
    );
  }

  expect(client.query.mock.calls.length).toBe(Object.keys(responses).length);

  return callbackResult;
};
