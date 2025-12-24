
export interface ComparisonResult {
  summary: string;
  matches: {
    category: string;
    description: string;
  }[];
  differences: {
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  verdict: string;
  confidenceScore: number;
}

export interface FileData {
  file: File;
  preview: string;
  mimeType: string;
}
