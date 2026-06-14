export const colors = {
  // Fondos
  background:   '#101218',
  surface:      '#181B23',
  surfaceRaise: '#20242E',
  surfaceMuted: '#242834',

  // Texto
  ink:     '#F4F2EA',
  inkSoft: '#B4B8C6',
  muted:   '#777D90',

  // Bordes
  line: '#303442',

  // Acento principal – violeta/índigo
  primary:     '#8E7CFF',
  primaryDark: '#C8BEFF',
  primarySoft: '#26233A',

  // Secundario – cyan
  blue:     '#38BDF8',
  blueSoft: '#0C2A3A',

  // Amber
  amber:     '#FBBF24',
  amberSoft: '#2A2010',

  // Estados
  danger:     '#F87171',
  dangerSoft: '#2D1515',
  success:    '#4ADE80',
  successSoft:'#102510',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 5,
};

export const type = {
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSoft,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
};
