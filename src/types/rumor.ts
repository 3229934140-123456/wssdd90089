export type RiskLevel = 'low' | 'medium' | 'high';

export type ChannelType = 'group' | 'video' | 'article' | 'moment' | 'other';

export interface ChannelInfo {
  type: ChannelType;
  name: string;
  color: string;
}

export interface SpreadNode {
  id: string;
  channel: ChannelType;
  name: string;
  description: string;
  count: number;
  timestamp: string;
}

export interface SpreadPath {
  origin: SpreadNode;
  mainNodes: SpreadNode[];
  hasOfficialResponse: boolean;
  officialResponse?: string;
  officialSource?: string;
}

export interface Rumor {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  riskLevel: RiskLevel;
  category: string;
  createdAt: string;
  summary: string;
  truth: string;
  spreadPath: SpreadPath;
  relatedRumors: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  coverImage: string;
  content: string;
  official: boolean;
  source: string;
  publishedAt: string;
  readCount: number;
}

export interface ReportRecord {
  id: string;
  content: string;
  channel: ChannelType;
  channelLabel: string;
  channelDetail: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface HistoryItem {
  id: string;
  inputText?: string;
  inputType: 'text' | 'image' | 'link';
  matchedRumor?: string;
  riskLevel: RiskLevel;
  checkedAt: string;
}
