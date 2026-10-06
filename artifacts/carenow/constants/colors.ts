/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#123733',
    tint: '#087E76',
    background: '#F4F8F6',
    foreground: '#123733',
    card: '#FFFFFF',
    cardForeground: '#123733',
    primary: '#087E76',
    primaryForeground: '#FFFFFF',
    primarySoft: '#E3F3EE',
    secondary: '#EAF1EE',
    secondaryForeground: '#27534B',
    muted: '#EDF2EF',
    mutedForeground: '#678079',
    accent: '#F4E9D9',
    accentForeground: '#65452A',
    destructive: '#C8433E',
    destructiveForeground: '#FFFFFF',
    dangerSoft: '#FCE9E5',
    success: '#2F765A',
    warning: '#A96C22',
    border: '#DCE8E2',
    input: '#DCE8E2',
  },
  dark: {
    text: '#E8F2EE',
    tint: '#77D1B1',
    background: '#10211F',
    foreground: '#E8F2EE',
    card: '#18302C',
    cardForeground: '#E8F2EE',
    primary: '#77D1B1',
    primaryForeground: '#10211F',
    primarySoft: '#23443D',
    secondary: '#203A35',
    secondaryForeground: '#D9EBE4',
    muted: '#203A35',
    mutedForeground: '#A1B9B0',
    accent: '#473A2B',
    accentForeground: '#F0D6B5',
    destructive: '#F0786C',
    destructiveForeground: '#251311',
    dangerSoft: '#482C29',
    success: '#92D4B0',
    warning: '#E5B16F',
    border: '#2A4640',
    input: '#2A4640',
  },
  radius: 20,
};

export default colors;
