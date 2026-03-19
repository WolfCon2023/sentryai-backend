// Domain types — mirrors frontend types for API contract consistency

export type UserRole = 'admin' | 'viewer';

export type AgentStatus = 'pending' | 'running' | 'complete' | 'error';

export type DealStage = 'preliminary' | 'diligence' | 'ic-prep' | 'closed' | 'passed';

export type DealStatus = 'idle' | 'running' | 'memo-ready' | 'needs-review';

export type RunType = 'quick' | 'full';

export type RunStatus = 'running' | 'completed' | 'failed';

export type FileParsingStatus = 'queued' | 'parsing' | 'ready' | 'failed';

export type ProvenanceType = 'public' | 'vdr' | 'estimate';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  progress: number;
  error?: string;
}

export interface Citation {
  id: string;
  source: string;
  type: ProvenanceType;
  excerpt?: string;
  fileId?: string;
  pageNumber?: number;
}

export interface MemoSectionData {
  id: string;
  title: string;
  content: string;
  provenance: ProvenanceType;
  citations?: Citation[];
}

export interface InvestmentMemoOutput {
  id: string;
  runId: string;
  dealId: string;
  companyName: string;
  type: 'full';
  generatedAt: string;
  sections: MemoSectionData[];
  overallConfidence: number;
}

export interface QuickSnapshotOutput {
  id: string;
  runId: string;
  dealId: string;
  companyName: string;
  generatedAt: string;
  summary: string;
  marketBullets: { text: string; provenance: ProvenanceType; citation?: Citation }[];
  keyMetrics: { label: string; value: string; isEstimate: boolean; citation?: Citation }[];
  topRisks: { text: string; provenance: ProvenanceType }[];
  diligenceQuestions: string[];
  overallConfidence: number;
}

export type RunOutput = InvestmentMemoOutput | QuickSnapshotOutput;

// Fastify augmentation for JWT user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: UserRole; [key: string]: unknown };
    user: { userId: string; role: UserRole };
  }
}
