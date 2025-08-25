// Conditional font loading for CI/CD resilience
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';

// Fallback font classes for CI environments
const fallbackFonts = {
  inter: { className: 'font-sans' },
  unifraktur: { className: 'font-serif' }, 
  raleway: { className: 'font-sans' },
};

let inter: any, unifraktur: any, raleway: any;

if (isCI) {
  // Use system fonts in CI to avoid network issues
  inter = fallbackFonts.inter;
  unifraktur = fallbackFonts.unifraktur;
  raleway = fallbackFonts.raleway;
} else {
  // Use Google Fonts in development and production
  try {
    const { Inter, UnifrakturCook, Raleway } = require('next/font/google');
    
    inter = Inter({ 
      subsets: ['latin'],
      display: 'swap',
      fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    });
    
    unifraktur = UnifrakturCook({ 
      weight: '700', 
      subsets: ['latin'],
      display: 'swap',
      fallback: ['serif', 'Georgia', 'Times New Roman'],
    });
    
    raleway = Raleway({ 
      weight: ['300', '600'], 
      subsets: ['latin'],
      display: 'swap',
      fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    });
  } catch (error) {
    console.warn('Google Fonts loading failed, using system fallbacks');
    inter = fallbackFonts.inter;
    unifraktur = fallbackFonts.unifraktur;
    raleway = fallbackFonts.raleway;
  }
}

export { inter, unifraktur, raleway };