import { Pinecone } from '@pinecone-database/pinecone';
import { TextChunk } from './chunkingService.js';
import { logger } from '../utils/logger.js';

let pc: Pinecone | null = null;

function getClient(): Pinecone {
  if (!pc) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY not set');
    }
    pc = new Pinecone({ apiKey });
  }
  return pc;
}

export const pineconeService = {
  async upsertChunks(namespace: string, chunks: TextChunk[]): Promise<void> {
    try {
      const client = getClient();
      const index = client.index('sentryai-docs');

      const records = chunks.map((chunk, i) => ({
        id: `${chunk.metadata.fileId}-chunk-${i}`,
        text: chunk.text,
        fileName: chunk.metadata.fileName,
        fileId: chunk.metadata.fileId,
        dealId: chunk.metadata.dealId,
        pageNumber: chunk.metadata.pageNumber ?? 0,
        chunkIndex: chunk.metadata.chunkIndex,
      }));

      // upsertRecords for integrated indexes (Pinecone handles embedding)
      const ns = index.namespace(namespace);
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100);
        await ns.upsertRecords({ records: batch });
      }

      logger.info({ namespace, count: chunks.length }, 'Upserted chunks to Pinecone');
    } catch (error) {
      logger.error({ err: error, namespace }, 'Failed to upsert to Pinecone');
      throw error;
    }
  },

  async deleteNamespace(namespace: string): Promise<void> {
    try {
      const client = getClient();
      const index = client.index('sentryai-docs');
      await index.namespace(namespace).deleteAll();
      logger.info({ namespace }, 'Deleted Pinecone namespace');
    } catch (error) {
      logger.error({ err: error, namespace }, 'Failed to delete Pinecone namespace');
    }
  },

  async deleteFileChunks(namespace: string, fileId: string): Promise<void> {
    try {
      const client = getClient();
      const index = client.index('sentryai-docs');
      const ids: string[] = [];
      for (let i = 0; i < 500; i++) {
        ids.push(`${fileId}-chunk-${i}`);
      }
      await index.namespace(namespace).deleteMany(ids);
      logger.info({ namespace, fileId }, 'Deleted file chunks from Pinecone');
    } catch (error) {
      logger.error({ err: error, namespace, fileId }, 'Failed to delete file chunks from Pinecone');
    }
  },
};
