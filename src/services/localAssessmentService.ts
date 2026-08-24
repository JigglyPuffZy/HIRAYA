import { STORAGE_KEYS } from '@/constants/storageKeys';
import { LOCAL_ASSESSMENT_HISTORY_LIMIT } from '@/constants/liveRefresh';
import { storageService } from '@/services/storageService';
import { RiskResultPayload } from '@/types/prediction';
export interface StoredAssessmentRecord {
  id: string;
  userId: string;
  payload: RiskResultPayload;
}

function buildRecordsKey(userId: string): string {
  return `${STORAGE_KEYS.LOCAL_ASSESSMENTS}/${userId}`;
}

export const localAssessmentService = {
  async saveAssessment(
    userId: string,
    payload: RiskResultPayload,
    recordId?: string,
  ): Promise<StoredAssessmentRecord> {
    const record: StoredAssessmentRecord = {
      id: recordId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      payload,
    };

    const existing = await this.listAssessments(userId);
    const next = [record, ...existing].slice(0, LOCAL_ASSESSMENT_HISTORY_LIMIT);
    await storageService.setItem(
      buildRecordsKey(userId),
      JSON.stringify(next),
    );

    return record;
  },

  async refreshLatestAssessment(
    userId: string,
    payload: RiskResultPayload,
  ): Promise<StoredAssessmentRecord> {
    const existing = await this.listAssessments(userId);

    if (existing.length === 0) {
      return this.saveAssessment(userId, payload);
    }

    const [latest, ...rest] = existing;
    const updated: StoredAssessmentRecord = {
      ...latest,
      payload,
    };

    await storageService.setItem(
      buildRecordsKey(userId),
      JSON.stringify([updated, ...rest]),
    );

    return updated;
  },

  async listAssessments(userId: string): Promise<StoredAssessmentRecord[]> {
    const raw = await storageService.getItem(buildRecordsKey(userId));

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as StoredAssessmentRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async getLatestAssessment(
    userId: string,
  ): Promise<StoredAssessmentRecord | null> {
    const records = await this.listAssessments(userId);
    return records[0] ?? null;
  },

  async getAssessmentById(
    userId: string,
    id: string,
  ): Promise<StoredAssessmentRecord | null> {
    const records = await this.listAssessments(userId);
    return records.find((record) => record.id === id) ?? null;
  },
};
