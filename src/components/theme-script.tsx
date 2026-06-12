import Script from "next/script";

export function ThemeScript() {
  const script = `
(function () {
  try {
    var key = 'flat_theme';
    var stored = localStorage.getItem(key);
    var theme = (stored === 'light' || stored === 'dark') ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

  return (
    <Script
      id="theme-initializer"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
