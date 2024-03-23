const toggleSwitch = document.querySelector('input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
console.log(currentTheme);
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'purple') {
        toggleSwitch.checked = true;
    }
}

let switchTheme = (e) => {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'purple');
    localStorage.setItem('theme', 'purple');
  }
  else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }    
}

toggleSwitch.addEventListener('change', switchTheme, false);
