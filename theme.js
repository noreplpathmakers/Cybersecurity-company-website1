// Theme initialization logic - RUNS IMMEDIATELY
(function () {
  const currentTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  if (currentTheme == 'dark') {
    document.body.classList.add('dark-theme');
  } else if (currentTheme == 'light') {
    document.body.classList.remove('dark-theme');
  } else if (prefersDarkScheme.matches) {
    document.body.classList.add('dark-theme');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Select all theme toggle buttons (using reusable class)
  const themeToggleBtns = document.querySelectorAll('.js-theme-toggle, #theme-toggle');

  const updateIcons = () => {
    const isDark = document.body.classList.contains('dark-theme');

    themeToggleBtns.forEach(btn => {
      // Logic to determine if it's an icon-only button or text button
      // We assume shorter text or specific class indicates icon-only
      if (btn.classList.contains('btn-icon') || btn.textContent.trim().length <= 4) {
        btn.textContent = isDark ? '☀️' : '🌙';
      } else {
        btn.textContent = isDark ? 'Change Theme ☀️' : 'Change Theme 🌙';
      }
    });
  };

  // Initial icon set
  updateIcons();

  // Add click listeners to all buttons
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      var theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      updateIcons();
      // Dispatch custom event for charts to listen to
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
    });
  });
});

