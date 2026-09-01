import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, ButtonType } from '../constants/theme';
import {
  getInitialState,
  handleDigit,
  handleDecimal,
  handleOperator,
  handleEquals,
  handleClear,
  handleToggleSign,
  handlePercent,
  getDisplayText,
} from '../utils/calculator';
import { CalculatorState } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_SIZE = (SCREEN_WIDTH - 5 * 12) / 4;
const BUTTON_SPACING = 12;

type ButtonDef = {
  label: string;
  type: (typeof ButtonType)[keyof typeof ButtonType];
  wide?: boolean;
  action: () => void;
};

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>(getInitialState());

  const press = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  }, []);

  const onDigit = useCallback(
    (d: string) => press(() => setState((s) => handleDigit(s, d))),
    [press],
  );
  const onDecimal = useCallback(
    () => press(() => setState((s) => handleDecimal(s))),
    [press],
  );
  const onOperator = useCallback(
    (op: string) => press(() => setState((s) => handleOperator(s, op))),
    [press],
  );
  const onEquals = useCallback(
    () => press(() => setState((s) => handleEquals(s))),
    [press],
  );
  const onClear = useCallback(
    () => press(() => setState((s) => handleClear(s))),
    [press],
  );
  const onToggleSign = useCallback(
    () => press(() => setState((s) => handleToggleSign(s))),
    [press],
  );
  const onPercent = useCallback(
    () => press(() => setState((s) => handlePercent(s))),
    [press],
  );

  const buttons: ButtonDef[][] = [
    [
      { label: state.display !== '0' && state.display !== 'Error' ? 'C' : 'AC', type: ButtonType.function, action: onClear },
      { label: '⁺⁄₋', type: ButtonType.function, action: onToggleSign },
      { label: '%', type: ButtonType.function, action: onPercent },
      { label: '÷', type: ButtonType.operator, action: () => onOperator('÷') },
    ],
    [
      { label: '7', type: ButtonType.number, action: () => onDigit('7') },
      { label: '8', type: ButtonType.number, action: () => onDigit('8') },
      { label: '9', type: ButtonType.number, action: () => onDigit('9') },
      { label: '×', type: ButtonType.operator, action: () => onOperator('×') },
    ],
    [
      { label: '4', type: ButtonType.number, action: () => onDigit('4') },
      { label: '5', type: ButtonType.number, action: () => onDigit('5') },
      { label: '6', type: ButtonType.number, action: () => onDigit('6') },
      { label: '-', type: ButtonType.operator, action: () => onOperator('-') },
    ],
    [
      { label: '1', type: ButtonType.number, action: () => onDigit('1') },
      { label: '2', type: ButtonType.number, action: () => onDigit('2') },
      { label: '3', type: ButtonType.number, action: () => onDigit('3') },
      { label: '+', type: ButtonType.operator, action: () => onOperator('+') },
    ],
    [
      { label: '0', type: ButtonType.zero, wide: true, action: () => onDigit('0') },
      { label: '.', type: ButtonType.number, action: onDecimal },
      { label: '=', type: ButtonType.operator, action: onEquals },
    ],
  ];

  const displayFontSize = state.display.length > 7 ? 40 : state.display.length > 5 ? 52 : 72;

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={[styles.displayText, { fontSize: displayFontSize }]} numberOfLines={1} adjustsFontSizeToFit>
          {getDisplayText(state.display)}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((btn) => {
              const style =
                btn.type === ButtonType.operator
                  ? state.operator === btn.label && state.waitingForOperand
                    ? styles.operatorActive
                    : styles.operator
                  : btn.type === ButtonType.function
                  ? styles.function
                  : btn.wide
                  ? styles.zero
                  : styles.number;

              const textColor =
                btn.type === ButtonType.function ? Colors.black : Colors.white;

              return (
                <Pressable
                  key={btn.label}
                  style={[
                    btn.wide ? styles.wideButton : styles.button,
                    style,
                  ]}
                  onPress={btn.action}
                  android_ripple={{ borderless: false, radius: 0 }}>
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    {btn.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.calculatorBg,
    justifyContent: 'flex-end',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  displayText: {
    color: Colors.white,
    fontWeight: '300',
    letterSpacing: -1,
  },
  buttonsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: BUTTON_SPACING,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: BUTTON_SPACING,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideButton: {
    width: BUTTON_SIZE * 2 + BUTTON_SPACING,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 28,
  },
  number: {
    backgroundColor: Colors.darkGray,
  },
  function: {
    backgroundColor: Colors.lightGray,
  },
  operator: {
    backgroundColor: Colors.orange,
  },
  operatorActive: {
    backgroundColor: Colors.white,
  },
  zero: {
    backgroundColor: Colors.darkGray,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '400',
  },
});
