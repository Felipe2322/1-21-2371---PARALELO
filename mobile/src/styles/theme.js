export const colors = {
  // Fondos
  background:   '#0F1117',
  surface:      '#1A1D27',
  surfaceRaise: '#232736',
  surfaceMuted: '#2A2D3E',

  // Texto
  ink:     '#F0F2FF',
  inkSoft: '#9CA3C4',
  muted:   '#5C607A',

  // Bordes
  line: '#2E3148',

  // Acento principal – violeta/índigo
  primary:     '#7C6AF4',
  primaryDark: '#A89BF7',
  primarySoft: '#2C2848',

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
  md: 14,
  lg: 20,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
};

export const type = {
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
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
