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
const BUTTON_SPACING = 10;
const BUTTON_SIZE = (SCREEN_WIDTH - 20 - 3 * BUTTON_SPACING) / 4;
const BUTTON_RADIUS = BUTTON_SIZE / 2 + 4;

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
              const isActive =
                btn.type === ButtonType.operator &&
                state.operator === btn.label &&
                state.waitingForOperand;

              const style =
                btn.type === ButtonType.operator
                  ? styles.operator
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
                    isActive && styles.operatorActive,
                  ]}
                  onPress={btn.action}
                  android_ripple={{ borderless: false, radius: 0 }}>
                  <View
                    pointerEvents="none"
                    style={[
                      styles.coinHighlightTop,
                      btn.type === ButtonType.operator
                        ? isActive
                          ? styles.coinTopOperatorActive
                          : styles.coinTopOperator
                        : btn.type === ButtonType.function
                        ? styles.coinTopFunction
                        : styles.coinTopNumber,
                    ]}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      styles.coinHighlightRim,
                      btn.type === ButtonType.operator
                        ? styles.coinRimOperator
                        : btn.type === ButtonType.function
                        ? styles.coinRimFunction
                        : styles.coinRimNumber,
                    ]}
                  />
                  <Text style={[styles.buttonText, { color: textColor, zIndex: 1 }]}>
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
    paddingHorizontal: 14,
    paddingBottom: 24,
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
    borderRadius: BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wideButton: {
    width: BUTTON_SIZE * 2 + BUTTON_SPACING,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 28,
    overflow: 'hidden',
  },
  coinHighlightTop: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: '55%',
    borderRadius: BUTTON_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  coinTopNumber: {
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  coinTopFunction: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  coinTopOperator: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  coinTopOperatorActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  coinHighlightRim: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: BUTTON_RADIUS,
    borderWidth: 0.5,
  },
  coinRimNumber: {
    borderColor: 'rgba(255,255,255,0.06)',
  },
  coinRimFunction: {
    borderColor: 'rgba(0,0,0,0.08)',
  },
  coinRimOperator: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  number: {
    backgroundColor: Colors.darkGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  function: {
    backgroundColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  operator: {
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  operatorActive: {
    backgroundColor: Colors.orangeLight,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  zero: {
    backgroundColor: Colors.darkGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: '400',
  },
});
