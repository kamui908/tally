export type NoteType = 'note' | 'checklist';

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Note = {
  id: string;
  title: string;
  type: NoteType;
  content: string;
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
};

export type CalculatorState = {
  display: string;
  previousValue: number | null;
  operator: string | null;
  waitingForOperand: boolean;
};
