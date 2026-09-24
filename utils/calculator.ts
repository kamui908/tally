import { CalculatorState } from '../types';

const MAX_DISPLAY_LENGTH = 9;

export function formatDisplay(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  if (value.includes('.') && value.endsWith('.')) return value;

  const str = num.toString();
  if (str.length > MAX_DISPLAY_LENGTH) {
    const exp = num.toExponential(4);
    if (exp.length > MAX_DISPLAY_LENGTH) {
      return num.toExponential(2).replace('e+', '×10^').replace('e-', '×10^-');
    }
    return exp.replace('e+', '×10^').replace('e-', '×10^-');
  }
  return value;
}

function addCommas(value: string): string {
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function getDisplayText(display: string): string {
  if (display === '-' || display === '-0' || display === '-0.') return display;
  if (display.endsWith('.')) return addCommas(display.slice(0, -1)) + '.';
  if (display.includes('.')) {
    const [intPart, decPart] = display.split('.');
    return addCommas(intPart) + '.' + decPart;
  }
  return addCommas(display);
}

function isOperator(token: number | string): token is string {
  return typeof token === 'string';
}

function formatTokenNumber(n: number): string {
  return formatDisplay(n.toString());
}

/** Build "12 + 7 ×" style string from committed tokens. */
function formatTokens(tokens: Array<number | string>): string {
  return tokens
    .map((t) => (isOperator(t) ? t : formatTokenNumber(t)))
    .join(' ');
}

/** Full expression including the number currently being typed. */
function buildExpression(tokens: Array<number | string>, currentDisplay: string): string {
  const base = formatTokens(tokens);
  const current = formatDisplay(currentDisplay);
  if (tokens.length === 0) return current;
  // Tokens always end with an operator when waiting/typing, so append current entry.
  if (base.length === 0) return current;
  return `${base} ${current}`;
}

function evaluateTokens(tokens: Array<number | string>): number {
  // First pass: × and ÷ (left to right)
  const firstPass: Array<number | string> = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === '×' || token === '÷') {
      const left = firstPass.pop() as number;
      const right = tokens[i + 1] as number;
      if (typeof left !== 'number' || typeof right !== 'number') return NaN;
      if (token === '×') {
        firstPass.push(left * right);
      } else {
        if (right === 0) return NaN;
        firstPass.push(left / right);
      }
      i += 2;
    } else {
      firstPass.push(token);
      i += 1;
    }
  }
  // Second pass: + and -
  let result = firstPass[0] as number;
  if (typeof result !== 'number') return NaN;
  for (let j = 1; j < firstPass.length; j += 2) {
    const op = firstPass[j] as string;
    const val = firstPass[j + 1] as number;
    if (typeof val !== 'number') return NaN;
    if (op === '+') result += val;
    else if (op === '-') result -= val;
    else return NaN;
  }
  return result;
}

export function handleDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.display === 'Error') {
    return { display: digit, expression: digit, tokens: [], waitingForOperand: false, justEvaluated: false };
  }
  // Fresh entry after equals starts a brand-new chain.
  if (state.justEvaluated) {
    return { display: digit, expression: digit, tokens: [], waitingForOperand: false, justEvaluated: false };
  }
  if (state.waitingForOperand) {
    const tokens = state.tokens;
    return {
      display: digit,
      expression: buildExpression(tokens, digit),
      tokens,
      waitingForOperand: false,
      justEvaluated: false,
    };
  }

  const newDisplay = state.display === '0' ? digit : state.display === '-0' ? '-' + digit : state.display + digit;
  if (newDisplay.replace('.', '').replace('-', '').length > MAX_DISPLAY_LENGTH) {
    return state;
  }
  return {
    ...state,
    display: newDisplay,
    expression: buildExpression(state.tokens, newDisplay),
    justEvaluated: false,
  };
}

export function handleDecimal(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') {
    return { display: '0.', expression: '0.', tokens: [], waitingForOperand: false, justEvaluated: false };
  }
  if (state.justEvaluated) {
    return { display: '0.', expression: '0.', tokens: [], waitingForOperand: false, justEvaluated: false };
  }
  if (state.waitingForOperand) {
    const tokens = state.tokens;
    return {
      display: '0.',
      expression: buildExpression(tokens, '0.'),
      tokens,
      waitingForOperand: false,
      justEvaluated: false,
    };
  }
  if (state.display.includes('.')) return state;
  const newDisplay = state.display + '.';
  return {
    ...state,
    display: newDisplay,
    expression: buildExpression(state.tokens, newDisplay),
    justEvaluated: false,
  };
}

export function handleOperator(state: CalculatorState, nextOperator: string): CalculatorState {
  if (state.display === 'Error') return state;

  // Continue chaining from a just-computed result: "result + ..."
  if (state.justEvaluated) {
    const value = parseFloat(state.display);
    if (isNaN(value)) return state;
    const tokens: Array<number | string> = [value, nextOperator];
    return {
      display: state.display,
      expression: `${formatDisplay(state.display)} ${nextOperator}`,
      tokens,
      waitingForOperand: true,
      justEvaluated: false,
    };
  }

  // Consecutive operators: replace the pending operator, don't compute.
  if (state.waitingForOperand) {
    if (state.tokens.length === 0) {
      // Edge: operator pressed first (display "0"): start chain from 0.
      const value = parseFloat(state.display);
      const tokens: Array<number | string> = [isNaN(value) ? 0 : value, nextOperator];
      return {
        display: state.display,
        expression: `${formatDisplay(state.display)} ${nextOperator}`,
        tokens,
        waitingForOperand: true,
        justEvaluated: false,
      };
    }
    const tokens = [...state.tokens];
    tokens[tokens.length - 1] = nextOperator;
    return {
      ...state,
      expression: formatTokens(tokens),
      tokens,
      waitingForOperand: true,
      justEvaluated: false,
    };
  }

  const currentValue = parseFloat(state.display);
  if (isNaN(currentValue)) return state;
  // Commit current entry + operator; do NOT evaluate yet.
  const tokens: Array<number | string> = [...state.tokens, currentValue, nextOperator];
  return {
    display: state.display,
    expression: formatTokens(tokens),
    tokens,
    waitingForOperand: true,
    justEvaluated: false,
  };
}

export function handleEquals(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') return state;
  // Nothing to compute (no pending chain, or operator with no second operand).
  if (state.tokens.length === 0 || state.waitingForOperand) return state;

  const currentValue = parseFloat(state.display);
  if (isNaN(currentValue)) return state;
  const fullTokens: Array<number | string> = [...state.tokens, currentValue];
  const result = evaluateTokens(fullTokens);
  if (isNaN(result) || !isFinite(result)) {
    return { display: 'Error', expression: '', tokens: [], waitingForOperand: true, justEvaluated: true };
  }

  const resultStr = formatDisplay(result.toString());
  const fullExpression = `${formatTokens(fullTokens)} =`;
  return {
    display: resultStr,
    expression: fullExpression,
    tokens: [],
    waitingForOperand: true,
    justEvaluated: true,
  };
}

export function handleClear(_state: CalculatorState): CalculatorState {
  return getInitialState();
}

export function handleBackspace(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) return state;
  const newDisplay = state.display.length > 1 ? state.display.slice(0, -1) : '0';
  // Guard against lone "-" left over.
  const safeDisplay = newDisplay === '-' || newDisplay === '' ? '0' : newDisplay;
  return {
    ...state,
    display: safeDisplay,
    expression: buildExpression(state.tokens, safeDisplay),
    justEvaluated: false,
  };
}

export function handleToggleSign(state: CalculatorState): CalculatorState {
  if (state.display === '0' || state.display === 'Error' || state.waitingForOperand) return state;
  const toggled = state.display.startsWith('-')
    ? state.display.slice(1)
    : '-' + state.display;
  return {
    ...state,
    display: toggled,
    expression: buildExpression(state.tokens, toggled),
    justEvaluated: false,
  };
}

export function handlePercent(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) return state;
  const value = parseFloat(state.display);
  if (isNaN(value)) return state;
  const result = value / 100;
  const resultStr = formatDisplay(result.toString());
  return {
    ...state,
    display: resultStr,
    expression: buildExpression(state.tokens, resultStr),
    justEvaluated: false,
  };
}

export function getInitialState(): CalculatorState {
  return { display: '0', expression: '', tokens: [], waitingForOperand: false, justEvaluated: false };
}
