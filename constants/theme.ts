export const Colors = {
  black: '#000000',
  darkGray: '#333333',
  mediumGray: '#636366',
  lightGray: '#A5A5A5',
  white: '#FFFFFF',
  orange: '#FF9500',
  orangeLight: '#FF9D0E',
  calculatorBg: '#000000',
  tabBg: '#1C1C1E',
  cardBg: '#2C2C2E',
  cardBgLight: '#3A3A3C',
  noteAccent: '#FF9500',
  checklistAccent: '#30D158',
  danger: '#FF453A',
  surfaceDark: '#1C1C1E',
  surfaceMid: '#2C2C2E',
};

export const ButtonType = {
  number: 'number' as const,
  function: 'function' as const,
  operator: 'operator' as const,
  zero: 'zero' as const,
};

export const buttonStyles = {
  [ButtonType.number]: {
    backgroundColor: Colors.darkGray,
    color: Colors.white,
  },
  [ButtonType.function]: {
    backgroundColor: Colors.lightGray,
    color: Colors.black,
  },
  [ButtonType.operator]: {
    backgroundColor: Colors.orange,
    color: Colors.white,
  },
  [ButtonType.zero]: {
    backgroundColor: Colors.darkGray,
    color: Colors.white,
  },
};
