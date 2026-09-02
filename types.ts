export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type Note = {
  id: string;
  title: string;
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
