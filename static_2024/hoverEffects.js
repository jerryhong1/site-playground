const hoverSound = new Audio('assets/hover.ogg')
hoverSound.volume = .6;

// var links = document.querySelectorAll('.hover-link');
var links = document.querySelectorAll('a');
const playSound = () => {
  hoverSound.play();
}

links.forEach((link) => {
  link.addEventListener('click', playSound);
});