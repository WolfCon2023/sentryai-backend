import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import DealFile from '../models/DealFile.js';
import { r2Service } from '../services/r2Service.js';
import { pineconeService } from '../services/pineconeService.js';
import { parseFileInBackground } from '../services/parsingService.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const ALLOWED_TYPES = ['pdf', 'xlsx', 'csv', 'pptx', 'docx'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function fileRoutes(app: FastifyInstance): Promise<void> {
  await app.register(multipart, { limits: { fileSize: MAX_FILE_SIZE } });

  // GET /api/deals/:dealId/files
  app.get<{
    Params: { dealId: string };
  }>('/:dealId/files', { preHandler: [authenticate] }, async (request, reply) => {
    const files = await DealFile.find({ dealId: request.params.dealId }).sort({ createdAt: -1 });
    return reply.send(files.map((f) => f.toJSON()));
  });

  // POST /api/deals/:dealId/files
  app.post<{
    Params: { dealId: string };
  }>('/:dealId/files', { preHandler: [authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    const ext = data.filename.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_TYPES.includes(ext)) {
      return reply.status(400).send({ error: `Invalid file type: ${ext}. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }

    const buffer = await data.toBuffer();
    const fileDoc = await DealFile.create({
      dealId: request.params.dealId,
      fileName: data.filename,
      fileType: ext,
      fileSize: buffer.length,
      r2Key: '', // Set after upload
      uploadedBy: request.user.userId,
      uploadedById: request.user.userId,
      parsingStatus: 'queued',
    });

    // Upload to R2
    const r2Key = await r2Service.uploadFile(
      request.params.dealId,
      fileDoc._id.toString(),
      data.filename,
      buffer,
      data.mimetype,
    );

    // Look up user name for uploadedBy
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(request.user.userId);
    fileDoc.r2Key = r2Key;
    fileDoc.uploadedBy = user?.name || 'Unknown';
    await fileDoc.save();

    // Parse in background
    parseFileInBackground(fileDoc._id.toString()).catch(() => {});

    return reply.status(201).send(fileDoc.toJSON());
  });

  // DELETE /api/deals/:dealId/files/:fileId
  app.delete<{
    Params: { dealId: string; fileId: string };
  }>('/:dealId/files/:fileId', { preHandler: [requireAdmin] }, async (request, reply) => {
    const file = await DealFile.findOne({
      _id: request.params.fileId,
      dealId: request.params.dealId,
    });

    if (!file) {
      return reply.status(404).send({ error: 'File not found' });
    }

    // Delete from R2
    await r2Service.deleteFile(file.r2Key);

    // Delete from Pinecone
    const namespace = `deal-${request.params.dealId}`;
    await pineconeService.deleteFileChunks(namespace, file._id.toString());

    // Delete from MongoDB
    await file.deleteOne();

    return reply.status(204).send();
  });
}
