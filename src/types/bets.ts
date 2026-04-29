import type { ModalProps } from "./generic";

export interface BetTableRecord {
  id: string;
  addedBy: string;
  dateTime: string;
  refId: string;
  dummyBet: boolean;
  combination: string;
  hit?: string;
  prize?: string;
  drawDate: string;
  bet: string;
  agent: string;
}

export interface UploadDummyBetModalProps extends ModalProps {
  agentOptions: { label: string; value: string; id?: string; level?: number }[];
}
