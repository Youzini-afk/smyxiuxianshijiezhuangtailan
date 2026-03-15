import { defineMvuDataStore } from '@util/mvu';
import { Schema } from './schema';

const resolveMessageId = (): number | 'latest' => {
  if (typeof getCurrentMessageId !== 'function') {
    return 'latest';
  }

  try {
    return getCurrentMessageId();
  } catch {
    return 'latest';
  }
};

export const useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: resolveMessageId() });
