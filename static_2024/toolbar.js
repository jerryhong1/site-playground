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
  rainSound.loop = 'true';
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
function updateClockTime() {
  var currentTimeElement = document.getElementById('current-time');
  var nyTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
  currentTimeElement.textContent = nyTime;
}
// Update the time every second
setInterval(updateClockTime, 1000);

// Initial update
updateClockTime();



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
GET STATS
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
// LISTENERS AND STATS 
const STATS = 
[
  {
    'name': 'Inches traveled',
    'getValue': () => `${totalDistance.toFixed(2)} in`
  },
  {
    'name': 'Elapsed time',
    'getValue': () => `${timeElapsed.toFixed(1)} sec`
  },
  {
    'name': 'Pointer speed',
    'getValue': () => `${currentPointerSpeed.toFixed(2)} in/s`
  },
  {
    'name': 'Average pointer speed',
    'getValue': () => `${(totalDistance / timeElapsed).toFixed(1)} in/s`
  },
  {
    'name': 'Max pointer speed',
    'getValue': () => `${maxPointerSpeed.toFixed(2)} in/s`
  },
]
let statIndex = 0;
let statElement = document.getElementById('cursor-stats');
statElement.addEventListener('click', () => {
  statIndex = (statIndex + 1)  % STATS.length;
  console.log(statIndex)
})

document.addEventListener('mousemove', (e) => {
  // update all the variables
  updateDistance(e.pageX, e.pageY);
  // then update the relevant HTML canvas
  document.getElementById('cursor-stats').innerHTML = `<span>${STATS[statIndex].name}: ${STATS[statIndex].getValue()}</span>`
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) {
        updateDistance(touch.pageX, touch.pageY);
    }
});
// lower down, the HTML is also updated over time.


// POINTER DISTANCE
let lastX, lastY;
let totalDistance = 0;

function calculateDistance(x1, y1, x2, y2) {
  // Assuming standard DPI of 96
  const dpi = 96;
  const distanceX = Math.abs((x2 - x1) / dpi);
  const distanceY = Math.abs((y2 - y1) / dpi);
  return Math.sqrt(distanceX ** 2 + distanceY ** 2);
}

function updateDistance(x, y) {
  if (lastX !== undefined && lastY !== undefined) {
    const distance = calculateDistance(lastX, lastY, x, y);
    totalDistance += distance;
  }
  lastX = x;
  lastY = y;
}

// TIME
let startTime = performance.now();
let lastDistance = 0;
let lastXYTime;
let endTime;
let timeElapsed; // in seconds
let currentPointerSpeed = 0;
let maxPointerSpeed = 0;
function updateCurrentTime() {
  endTime = performance.now();
  timeElapsed = (endTime - startTime) / 1000;
  document.getElementById('cursor-stats').innerHTML = `<span>${STATS[statIndex].name}: ${STATS[statIndex].getValue()}</span>`
}

function updateSpeed() {
  let time = performance.now();
  currentPointerSpeed = (totalDistance - lastDistance) / (time - lastXYTime) * 1000;
  if (currentPointerSpeed) {
    maxPointerSpeed = Math.max(currentPointerSpeed, maxPointerSpeed);  
  }
  lastDistance = totalDistance;
  lastXYTime = time;
}

setInterval(updateCurrentTime, 100);
setInterval(updateSpeed, 100);
updateCurrentTime();
