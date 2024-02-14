console.log(
  `                                 

                                             *************                                        
                                         ********************                                        
                                     ***************************                                    
                                  *********************************                                 
                                *************************************                               
                               ****************************************                             
                             *******************************************                            
                            **********************************************                          
                           ************************************************                         
                          *****************=-----------------+*************#                        
                         ******************:                 =**************                        
                         ******************:                 =***************                       
                        ****************************:        =***************                       
                        **************************-          =****************                      
                        ************************-      ==    =****************                      
                        **********************=      -**=    =****************                      
                        ********************=      -****=    =****************                      
                        ******************+.     :******=    =***************                       
                         ***************+:     .+*******=    =***************                       
                         ***************:    .=**********++++***************                        
                          ***************+..=*******************************                        
                           ************************************************                         
                            **********************************************                          
                             ********************************************                           
                              *****************************************                             
                                *************************************                               
                                   ********************************                                 
                                     ***************************                                    
                                         ********************                                       
                                             ************            
                                                                         
                              eek! don\'t peek too hard behind the curtains!


`
)

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

  soundButton.innerHTML = `<i class="ph-bold ph-pause"></i> <span>Pause</span>`
}

const fadeOutTime = 2
function fadeOut() {
  isRainFadingIn = false;
  gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutTime ); // Fade-out over 2 seconds

  soundButton.innerHTML = `<i class="ph-bold ph-play"></i> <span>Play</span>`

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

// ok terrible idea, i'm going to hard map all the phosphor icons to weather conditions
// this is taken from https://www.weatherapi.com/docs/weather_conditions.json
const weatherIconMap = [
	{
		"name" : "Sunny",
		"icon" : "sun"
	},
	{
		"name" : "Clear",
		"icon" : "moon"
	},
	{
		"name" : "Partly cloudy",
    "is_day": 1,
		"icon" : "cloud-sun"
	},
  {
		"name" : "Partly cloudy",
    "is_day": 0,
		"icon" : "cloud-moon"
	},
	{
		"name" : "Cloudy",
		"icon" : "cloud"
	},
	{
		"name" : "Overcast",
		"icon" : "cloud-fog"
	},
	{
		"name" : "Mist",
		"icon" : "waves"
	},
	{
		"name" : "Patchy rain possible",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Patchy snow possible",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy sleet possible",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy freezing drizzle possible",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Thundery outbreaks possible",
		"icon" : "cloud-lightning"
	},
	{
		"name" : "Blowing snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Blizzard",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Fog",
		"icon" : "waves"
	},
	{
		"name" : "Freezing fog",
		"icon" : "waves"
	},
	{
		"name" : "Patchy light drizzle",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Light drizzle",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Freezing drizzle",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Heavy freezing drizzle",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Patchy light rain",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Light rain",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Moderate rain at times",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Moderate rain",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Heavy rain at times",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Heavy rain",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Light freezing rain",
		"icon" : "cloud-rain"
	},
  {
		"name" : "Moderate or heavy freezing rain",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Light sleet",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Moderate or heavy sleet",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy light snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Light snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy moderate snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Moderate snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy heavy snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Heavy snow",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Ice pellets",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Light rain shower",
		"icon" : "cloud-rain"
	},
	{
		"name" : "Moderate or heavy rain shower",
		"icon" : " cloud-rain"
	},
	{
		"name" : "Torrential rain shower",
		"icon" : " cloud-rain"
	},
	{
		"name" : "Light sleet showers",
		"icon" : " cloud-rain"
	},
	{
		"name" : "Moderate or heavy sleet showers",
		"icon" : " cloud-rain"
	},
	{
		"name" : "Light snow showers",
		"icon" : " cloud-snow"
	},
	{
		"name" : "Moderate or heavy snow showers",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Light showers of ice pellets",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Moderate or heavy showers of ice pellets",
		"icon" : "cloud-snow"
	},
	{
		"name" : "Patchy light rain with thunder",
		"icon" : "cloud-lightning"
	},
	{
		"name" : "Moderate or heavy rain with thunder",
		"icon" : "cloud-lightning"
	},
	{
		"name" : "Patchy light snow with thunder",
		"icon" : "cloud-lightning"
	},
	{
		"name" : "Moderate or heavy snow with thunder",
		"icon" : "cloud-lightning"
	}
]

fetch('https://api.weatherapi.com/v1/current.json?key=6ab000ae26124b1a8ea52406241601&q=10009&aqi=no&callback=?')
  .then(response => {
      if (!response.ok) {
          document.getElementById('current-weather').innerHTML = `Weather error`
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      let temp = data.current.temp_f
      let condition = data.current.condition.text
      let iconName = weatherIconMap.find((elt) => {
        return elt.name.toLowerCase() === condition.toLowerCase() && (elt.is_day === undefined || elt.is_day === data.current.is_day)
      }).icon;
      if (iconName === undefined) {
        iconName = "sun"
      }
      document.getElementById('current-weather').innerHTML = `<i class="ph-bold ph-${iconName}"></i> <span>${condition}, ${temp}°F</span>`
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
    'name': 'Pointer speed',
    'getValue': () => `${currentPointerSpeed.toFixed(2)} in/s`,
    'icon': `<i class="ph-bold ph-cursor-click"></i>`,
    'label': "",
    'over_time': true
  },
  {
    'name': 'Inches traveled',
    'getValue': () => `${totalDistance.toFixed(2)} in`,
    'icon': `<i class="ph-bold ph-ruler"></i>`,
    'label': "",
    'over_time': false // does this need to be updated every millisecond?
  },
  {
    'name': 'Elapsed time',
    'getValue': () => `${timeElapsed.toFixed(1)} sec`,
    'icon': `<i class="ph-bold ph-timer"></i>`,
    'label': "",
    'over_time': true 
  },
  {
    'name': 'Average pointer speed',
    'getValue': () => `${(totalDistance / timeElapsed).toFixed(1)} in/s`,
    'icon': `<i class="ph-bold ph-cursor-click"></i>`,
    'label': "Avg",
    'over_time': true
  },
  {
    'name': 'Max pointer speed',
    'getValue': () => `${maxPointerSpeed.toFixed(2)} in/s`,
    'icon': `<i class="ph-bold ph-cursor-click"></i>`,
    'label': "Max",
    'over_time': true
  },
  {
    'name': 'Clickable elements hovered',
    'getValue': () => `${nLinksHovered} hovered`,
    'icon': `<i class="ph-bold ph-link"></i>`,
    'label': "",
    'over_time': false
  },
  {
    'name': 'Clickable elements clicked',
    'getValue': () => `${nLinksClicked} clicked`,
    'icon': `<i class="ph-bold ph-link"></i>`,
    'label': "",
    'over_time': false
  }
]
let statIndex = 0;
let incrementStatIndex = () => {
  statIndex = (statIndex + 1)  % STATS.length;
  updateCursorStatsDiv()
}
document.getElementById('cursor-stats-clickable').addEventListener('click', incrementStatIndex);

let updateCursorStatsDiv = () => {
  document.getElementById('cursor-stats-content').innerHTML = `
    ${STATS[statIndex].icon}
    <span>${STATS[statIndex].label ? `${STATS[statIndex].label}:` : ""} ${STATS[statIndex].getValue()}</span>
  `
}

document.addEventListener('mousemove', (e) => {  
  updateDistance(e.pageX, e.pageY);
  updateCursorStatsDiv()
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

// TIME AND SPEED
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
  if (STATS[statIndex].over_time) {
    updateCursorStatsDiv();
  }
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

// NUMBER OF LINKS CLICKED/HOVERED
let nLinksHovered = 0;
let nLinksClicked = 0;
let linkList = document.querySelectorAll('a, .clickable');
linkList.forEach((link) => {
  link.addEventListener('mouseenter', (e) => {
    nLinksHovered += 1;
    updateCursorStatsDiv();
  });
  link.addEventListener('click', (e) => {
    nLinksClicked += 1;
    updateCursorStatsDiv();
  });
});

// initial run
updateCursorStatsDiv();