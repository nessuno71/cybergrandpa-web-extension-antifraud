import { convertReadableStreamToString, createStore, decompressReadableStream, getArrayFromString } from '@/utils';
import { logger } from '@/utils/logger';
import type { UrlService } from '@/utils/types';
import { defineProxyService } from '@webext-core/proxy-service';

const createUrlService = (storageKey: StorageItemKey): UrlService => {
  const urlsDb = createStore<string | null>(null, storageKey);

  let arr: string[] = [];

  const v = async (base64stringParam?: string) => {
    const base64string = base64stringParam || (await urlsDb.ready());

    if (!base64string) {
      return [];
    }

    const stream = decompressReadableStream(base64string);
    const streamToText = await convertReadableStreamToString(stream);

    return getArrayFromString(streamToText, (x) => x.startsWith('0.0.0.0'), '0.0.0.0');
  };

  urlsDb.ready().then(async (value: string | null) => {
    if (value) {
      arr = await v(value);
    }

    urlsDb.subscribe(async (value) => {
      if (value) {
        arr = await v(value);
      }
    });
  });

  return {
    count: () => {
      return arr.length;
    },
    getRows: (limit, offset = 0) => {
      return arr.slice(offset, offset + limit).join('\n');
    },
    seek: (url) => {
      return arr.filter((x) => url.includes(x)).length > 0;
    },
    upsert: async (base64string: string) => {
      try {
        await urlsDb.set(base64string);
      } catch (error) {
        logger.error('Failed to upsert URL data:', error);

        return false;
      }

      return true;
    },
  };
};

export const [registerUrlService, getUrlService] = defineProxyService('url-service', createUrlService);
