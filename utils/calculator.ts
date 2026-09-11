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
  if (display.endsWith('.')) return addCommas(display.slice(0, -1)) + '.';
  if (display.includes('.')) {
    const [intPart, decPart] = display.split('.');
    return addCommas(intPart) + '.' + decPart;
  }
  return addCommas(display);
}

function calculate(left: number, right: number, op: string): number {
  switch (op) {
    case '+': return left + right;
    case '-': return left - right;
    case '×': return left * right;
    case '÷': return right !== 0 ? left / right : NaN;
    default: return right;
  }
}

export function handleDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
      expression: state.previousValue != null && state.operator
        ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${digit}`
        : digit,
    };
  }

  const newDisplay = state.display === '0' ? digit : state.display + digit;
  if (newDisplay.replace('.', '').replace('-', '').length > MAX_DISPLAY_LENGTH) {
    return state;
  }
  return {
    ...state,
    display: newDisplay,
    expression: state.previousValue != null && state.operator
      ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${newDisplay}`
      : newDisplay,
  };
}

export function handleDecimal(state: CalculatorState): CalculatorState {
  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
      expression: state.previousValue != null && state.operator
        ? `${formatDisplay(state.previousValue.toString())} ${state.operator} 0.`
        : '0.',
    };
  }
  if (state.display.includes('.')) return state;
  const newDisplay = state.display + '.';
  return {
    ...state,
    display: newDisplay,
    expression: state.previousValue != null && state.operator
      ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${newDisplay}`
      : newDisplay,
  };
}

export function handleOperator(state: CalculatorState, nextOperator: string): CalculatorState {
  const currentValue = parseFloat(state.display);

  if (state.previousValue !== null && state.operator && !state.waitingForOperand) {
    const result = calculate(state.previousValue, currentValue, state.operator);
    if (isNaN(result)) {
      return { display: 'Error', previousValue: null, operator: null, waitingForOperand: true, expression: '' };
    }
    const resultStr = formatDisplay(result.toString());
    return {
      display: resultStr,
      previousValue: result,
      operator: nextOperator,
      waitingForOperand: true,
      expression: `${resultStr} ${nextOperator}`,
    };
  }

  return {
    ...state,
    previousValue: currentValue,
    operator: nextOperator,
    waitingForOperand: true,
    expression: `${formatDisplay(state.display)} ${nextOperator}`,
  };
}

export function handleEquals(state: CalculatorState): CalculatorState {
  if (state.previousValue === null || state.operator === null) return state;

  const currentValue = parseFloat(state.display);
  const result = calculate(state.previousValue, currentValue, state.operator);
  if (isNaN(result)) {
    return { display: 'Error', previousValue: null, operator: null, waitingForOperand: true, expression: '' };
  }

  const resultStr = formatDisplay(result.toString());
  const fullExpression = `${formatDisplay(state.previousValue.toString())} ${state.operator} ${formatDisplay(state.display)} =`;
  return {
    display: resultStr,
    previousValue: null,
    operator: null,
    waitingForOperand: true,
    expression: fullExpression,
  };
}

export function handleClear(_state: CalculatorState): CalculatorState {
  return { display: '0', previousValue: null, operator: null, waitingForOperand: false, expression: '' };
}

export function handleBackspace(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) return state;
  const newDisplay = state.display.length > 1 ? state.display.slice(0, -1) : '0';
  return {
    ...state,
    display: newDisplay,
    expression: state.previousValue != null && state.operator
      ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${formatDisplay(newDisplay)}`
      : formatDisplay(newDisplay),
  };
}

export function handleToggleSign(state: CalculatorState): CalculatorState {
  if (state.display === '0' || state.display === 'Error') return state;
  const toggled = state.display.startsWith('-')
    ? state.display.slice(1)
    : '-' + state.display;
  return {
    ...state,
    display: toggled,
    expression: state.previousValue != null && state.operator
      ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${formatDisplay(toggled)}`
      : formatDisplay(toggled),
  };
}

export function handlePercent(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.display);
  if (isNaN(value)) return state;
  const result = value / 100;
  const resultStr = formatDisplay(result.toString());
  return {
    ...state,
    display: resultStr,
    expression: state.previousValue != null && state.operator
      ? `${formatDisplay(state.previousValue.toString())} ${state.operator} ${resultStr}`
      : resultStr,
  };
}

export function getInitialState(): CalculatorState {
  return { display: '0', previousValue: null, operator: null, waitingForOperand: false, expression: '' };
}
