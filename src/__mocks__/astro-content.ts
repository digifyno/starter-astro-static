import { z } from 'zod';

export function defineCollection(config: { loader?: unknown; schema?: (helpers: { image: () => unknown }) => unknown }) {
  // Execute schema to get coverage on content.config.ts schema callback
  if (typeof config.schema === 'function') {
    config.schema({ image: () => z.string().optional() });
  }
  return config;
}

export async function getCollection(_name: string, _filter?: (entry: unknown) => boolean): Promise<unknown[]> {
  return [];
}
