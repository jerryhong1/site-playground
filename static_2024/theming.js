const THEMES = ['ocean', 'purple']
const themeToggle = document.getElementById('theme-toggle');
let currentThemeIndex = parseInt(localStorage.getItem('theme-index') ? localStorage.getItem('theme-index') : '0');
document.documentElement.setAttribute('data-theme', THEMES[currentThemeIndex]);

let switchTheme = (e) => {
  currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
  document.documentElement.setAttribute('data-theme', THEMES[currentThemeIndex]);
  localStorage.setItem('theme-index', currentThemeIndex.toString());
}

themeToggle.addEventListener('click', switchTheme, false);
