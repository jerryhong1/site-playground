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


 var audioContext = new (window.AudioContext || window.webkitAudioContext)();
 const rainSound = new Audio('assets/rain.mp3');
 var source = audioContext.createMediaElementSource(rainSound);
 var gainNode = audioContext.createGain();
 source.connect(gainNode);
 gainNode.connect(audioContext.destination);
 gainNode.gain.value = 0;
 const playRain = () => {
  rainSound.play();
  gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 2);
}
playRain()
