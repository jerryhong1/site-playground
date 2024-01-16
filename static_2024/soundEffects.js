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


let audioContext;
let source;
let gainNode;
let rainSound = null;
let isRainFadingIn = false;
let buttonDisabled = false;
const soundButton = document.getElementById('sound-button');

function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  rainSound = new Audio('assets/rain.mp3');
  source = audioContext.createMediaElementSource(rainSound);
  gainNode = audioContext.createGain();
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0; // Initial volume is 0 (mute)
}

function fadeIn() {
  if (rainSound !== null) {
    // stop the fadeout process
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
  } else {
    initAudio();
    rainSound.play();
  }
  isRainFadingIn = true;
  gainNode.gain.linearRampToValueAtTime(.5, audioContext.currentTime + 5); // Fade-in over 5 seconds

  // soundButton.innerHTML = `<span>Collecting water...</span>`
  // soundButton.classList.add('disabled');
  // setTimeout(function() {
  //   soundButton.innerHTML = `<span>Rain</span>`
  //   soundButton.classList.remove('disabled');
  // }, 1000);
}

const fadeOutTime = 2
function fadeOut() {
  console.log("Fading out")
  isRainFadingIn = false;
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutTime ); // Fade-out over 2 seconds

  // soundButton.innerHTML = `<span>Clearing gutters...</span>`
  // soundButton.classList.add('disabled');
  // setTimeout(function() {
  //   soundButton.innerHTML = `<span>Rain</span>`
  //   soundButton.classList.remove('disabled');
  // }, 1000);

  setTimeout(function() {
      if (!isRainFadingIn) {
        rainSound.pause();
        rainSound.currentTime = 0;
        rainSound = null; // TODO: is this necessary?
      }
  }, fadeOutTime  * 1000);
}

soundButton.addEventListener('click', () => {
  if (soundButton.classList.contains('disabled')) { return; }  
  if (isRainFadingIn) {
    fadeOut()
  } else {
    fadeIn()
  }
});