import DealFile from '../models/DealFile.js';
import { r2Service } from './r2Service.js';
import { getParser } from './parsers/index.js';
import { chunkText } from './chunkingService.js';
import { pineconeService } from './pineconeService.js';
import { logger } from '../utils/logger.js';
import { getIO } from '../plugins/socket.js';

export async function parseFileInBackground(fileId: string): Promise<void> {
  const file = await DealFile.findById(fileId);
  if (!file) return;

  try {
    // Update status to parsing
    file.parsingStatus = 'parsing';
    await file.save();
    emitParsingUpdate(file.dealId.toString(), file._id.toString(), 'parsing');

    // Download from R2
    const buffer = await r2Service.downloadFile(file.r2Key);

    // Parse
    const parser = getParser(file.fileType);
    if (!parser) {
      throw new Error(`No parser for file type: ${file.fileType}`);
    }
    const parseResult = await parser(buffer);

    // Chunk
    const chunks = chunkText(parseResult.text, {
      fileId: file._id.toString(),
      fileName: file.fileName,
      dealId: file.dealId.toString(),
    });

    // Upsert to Pinecone (non-blocking — file is still "ready" even if Pinecone fails)
    const namespace = `deal-${file.dealId.toString()}`;
    try {
      await pineconeService.upsertChunks(namespace, chunks);
      logger.info({ fileId: file._id, namespace, chunks: chunks.length }, 'Chunks upserted to Pinecone');
    } catch (pineconeError) {
      logger.warn({ err: pineconeError, fileId: file._id }, 'Pinecone upsert failed — file parsed but not indexed');
    }

    // Update status
    file.parsingStatus = 'ready';
    file.chunkCount = chunks.length;
    await file.save();
    emitParsingUpdate(file.dealId.toString(), file._id.toString(), 'ready');

    logger.info({ fileId: file._id, chunks: chunks.length }, 'File parsed successfully');
  } catch (error) {
    logger.error({ err: error, fileId: file._id }, 'File parsing failed');
    file.parsingStatus = 'failed';
    file.parsingError = error instanceof Error ? error.message : 'Unknown error';
    await file.save();
    emitParsingUpdate(file.dealId.toString(), file._id.toString(), 'failed');
  }
}

function emitParsingUpdate(dealId: string, fileId: string, status: string): void {
  try {
    const io = getIO();
    io.to(`deal-${dealId}`).emit('file:parsing-update', { dealId, fileId, status });
  } catch {
    // Socket.IO might not be initialized in tests
  }
}
