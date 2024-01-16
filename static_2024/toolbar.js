/**********************
RAIN SOUND
      __   _
    _(  )_( )_
   (_   _    _)
  / /(_) (__)
 / / / / / /
/ / / / / /
 ****************/
let audioContext;
let source;
let gainNode;
let rainSound = null;
let isRainFadingIn = false;
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

  soundButton.innerHTML = `<span>Stop sound</span>`
}

const fadeOutTime = 2
function fadeOut() {
  isRainFadingIn = false;
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutTime ); // Fade-out over 2 seconds

  soundButton.innerHTML = `<span>Rain Sound</span>`

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

/**********************
GET TIME
.'`~~~~~~~~~~~`'.
(  .'11 12 1'.  )
|  :10 \|   2:  |
|  :9   @   3:  |
|  :8       4;  |
'. '..7 6 5..' .'
 ~-------------~ 
 ********************/
function updateCurrentTime() {
  var currentTimeElement = document.getElementById('current-time');
  var nyTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
  currentTimeElement.textContent = nyTime;
}
// Update the time every second
setInterval(updateCurrentTime, 1000);

// Initial update
updateCurrentTime();



/**********************
GET WEATHER
      ;   :   ;
   .   \_,!,_/   ,
    `.,'     `.,'
     /         \
~ -- :         : -- ~
     \         /
    ,'`._   _.'`.
   '   / `!` \   `
      ;   :   ; 
 ****************/
function fetchWeather() {
  return fetch('http://api.weatherapi.com/v1/current.json?key=6ab000ae26124b1a8ea52406241601&q=10009&aqi=no')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      });
}

fetchWeather()
  .then(data => {
      console.log(data);
      let temp = data.current.temp_f
      let condition = data.current.condition.text
      document.getElementById('current-weather').innerHTML = `${condition}, ${temp}°F`
  })
  .catch(error => {
      console.error('Error fetching data:', error.message);
  });


/**********************
GET POINTER STATS
   b.
   88b
   888b.
   88888b
   888888b.
   8888P"
   P" `8.
       `8.   
        `8
 ****************/
let startX, startY;
let totalDistance = 0;

function calculateDistance(x1, y1, x2, y2) {
  // Assuming standard DPI of 96
  const dpi = 96;
  const distanceX = Math.abs((x2 - x1) / dpi);
  const distanceY = Math.abs((y2 - y1) / dpi);
  return Math.sqrt(distanceX ** 2 + distanceY ** 2);
}

function updateDistance(x, y) {
  if (startX !== undefined && startY !== undefined) {
    const distance = calculateDistance(startX, startY, x, y);
    totalDistance += distance;
    document.getElementById('cursor-stats').innerHTML = `<span>Inches traveled: ${totalDistance.toFixed(2)} in</span>`
  }
  startX = x;
  startY = y;
}

document.addEventListener('mousemove', (e) => {
    updateDistance(e.pageX, e.pageY);
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) {
        updateDistance(touch.pageX, touch.pageY);
    }
});