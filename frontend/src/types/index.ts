// frontend/src/types/index.ts
export interface Camera {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastActive?: string;
}

export interface Incident {
  id: number;
  title: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location: string;
  summary: string;
  objectsDetected: string[];
  suggestedAction: string;
}
