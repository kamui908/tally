import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calculator from '../../components/Calculator';
import { Colors } from '../../constants/theme';

export default function CalculatorScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.calculatorWrapper}>
        <Calculator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.calculatorBg,
  },
  calculatorWrapper: {
    flex: 1,
  },
});
