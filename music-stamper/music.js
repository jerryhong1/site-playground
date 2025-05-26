/**********************
MUSIC CONTROLLER
     ♪     ♫    ♪  
   ♫   ♪  ♫  ♪  
  ♪  ♫  ♪    ♫  ♪
 ♫  ♪  ♫  ♪    ♫
    ♪     ♫    ♪ 
****************/

import { WaveformVisualizer } from './waveformVisualizer.js';

export class MusicController {
  constructor() {
    this.svgInitialized = false;
    this.initAttempts = 0;

    // Get SVG element
    this.speakerSvg = document.getElementById('speaker-svg');
    this.nowPlayingElement = document.getElementById('now-playing-element');
    this.speakerContainer = document.getElementById('speaker-container');

    // Initialize visualizer
    this.visualizer = new WaveformVisualizer();

    // Configure audio properties
    this.fadeInTime = 2;
    this.fadeOutTime = 1;
    this.musicVolume = 0.6;

    // Music tracks info
    this.tracks = [
      { path: 'assets/music/rach.mp3', name: 'Rachmaninoff' },
      { path: 'assets/music/oh-happy-day.mp3', name: 'Oh Happy Day' },
      { path: 'assets/music/the-lamp-is-low.mp3', name: 'The Lamp Is Low' },
    ];
    this.currentTrackIndex = 0;

    // Initialize audio state
    this.AudioContext = null;
    this.source = null;
    this.gainNode = null;
    this.musicSound = null;
    this.isMusicFadingIn = false;

    // Create hover sound for button clicks
    this.hoverSound = new Audio('assets/hover.ogg');
    this.hoverSound.volume = 0.6;

    // Multiple approaches to ensure SVG loads correctly
    this.setupSvgLoadHandling();

    // Fallback approach using a completely different technique
    if (!this.speakerSvg.contentDocument) {
      console.log('Initial content document access failed - setting up fallback');
      this.setupFallbackSvgApproach();
    }

    // Handle window resize
    window.addEventListener('resize', () => this.visualizer.resize());
  }

  // If all else fails, reload the SVG completely
  setupFallbackSvgApproach() {
    // Create a new SVG object element
    const newSvg = document.createElement('object');
    newSvg.setAttribute('type', 'image/svg+xml');
    newSvg.setAttribute('data', 'assets/speaker.svg');
    newSvg.setAttribute('class', 'speaker-svg');
    newSvg.setAttribute('id', 'speaker-svg');
    newSvg.setAttribute('width', '200');
    newSvg.setAttribute('height', '200');

    // Set up the load event before adding to DOM
    newSvg.addEventListener('load', () => {
      console.log('Fallback SVG loaded successfully');
      this.speakerSvg = newSvg;
      this.initSvgElements();
    });

    // Check if container exists
    if (this.speakerContainer) {
      // Remove the old SVG
      if (this.speakerSvg) {
        this.speakerContainer.removeChild(this.speakerSvg);
      }

      // Add the new SVG
      this.speakerContainer.appendChild(newSvg);
      this.speakerSvg = newSvg;
    }
  }

  // Helper method to apply a function to an element and all its children
  applyToAllChildren(element, fn) {
    if (!element) return;

    // Apply to current element
    fn(element);

    // Apply to all children recursively
    if (element.children && element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        this.applyToAllChildren(element.children[i], fn);
      }
    }
  }

  initSvgElements() {
    // Prevent multiple initializations
    if (this.svgInitialized) {
      return;
    }

    // Get elements from the SVG document
    const svgDoc = this.speakerSvg.contentDocument;
    if (!svgDoc) {
      console.error('Failed to access SVG document');
      return;
    }

    this.playButton = svgDoc.getElementById('play');
    this.shuffleButton = svgDoc.getElementById('shuffle');
    this.musicLight = svgDoc.getElementById('Light');

    // Verify all elements were found
    if (!this.playButton || !this.shuffleButton || !this.musicLight) {
      console.error('Failed to find required SVG elements', {
        play: !!this.playButton,
        shuffle: !!this.shuffleButton,
        light: !!this.musicLight,
      });
      return;
    }

    // Hide light initially
    this.musicLight.style.opacity = '0';

    // Make buttons clickable
    this.playButton.style.cursor = 'pointer';
    this.shuffleButton.style.cursor = 'pointer';

    // Initialize button listeners
    this.initButtonListeners();

    // Mark as initialized to prevent duplicate setup
    this.svgInitialized = true;
    console.log('SVG music controls initialized successfully');
  }

  initButtonListeners() {
    // Add manual visual feedback for all button interactions
    this.addClickAnimation(this.playButton);
    this.addClickAnimation(this.shuffleButton);

    // Handle play/pause button
    this.playButton.addEventListener('click', () => {
      // Play click sound
      this.playClickSound();

      // Toggle music
      if (this.isMusicFadingIn) {
        this.fadeMusicOut();
      } else {
        this.fadeMusicIn();
      }
    });

    // Handle shuffle button
    this.shuffleButton.addEventListener('click', () => {
      // Play click sound
      this.playClickSound();

      // Select a different random track
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.tracks.length);
      } while (newIndex === this.currentTrackIndex && this.tracks.length > 1);

      this.currentTrackIndex = newIndex;

      // If already playing, update the track
      if (this.isMusicFadingIn) {
        this.updateNowPlayingText();
        this.changeTrack();
      }
    });
  }

  // Add manual animation for button press
  addClickAnimation(element) {
    if (!element) return;

    // Use existing coordinates with adjusted Y values
    let transformOrigin =
      element.id === 'play'
        ? '99.4221px 16.6365px' // Play button center
        : '99.3255px 48.4011px'; // Shuffle button center

    // Set the initial transform origin (only once)
    element.style.transformOrigin = transformOrigin;

    // Store original pointer-events value
    const originalPointerEvents = window
      .getComputedStyle(element)
      .getPropertyValue('pointer-events');

    element.addEventListener('mousedown', () => {
      // Apply only the transform property, not replacing other styles
      element.style.transform = 'scale(0.92) translateY(1px)';
      // Make sure pointer-events is still set
      element.style.pointerEvents = originalPointerEvents;
      element.style.cursor = 'pointer';
    });

    // Reset on mouseup/mouseleave
    const resetTransform = () => {
      element.style.transform = '';
      // Make sure pointer-events is still set
      element.style.pointerEvents = originalPointerEvents;
      element.style.cursor = 'pointer';
    };

    element.addEventListener('mouseup', resetTransform);
    element.addEventListener('mouseleave', resetTransform);
  }

  playClickSound() {
    // Create a new instance of the sound to allow multiple rapid clicks
    const soundClone = this.hoverSound.cloneNode();
    soundClone.play();
  }

  setupSvgLoadHandling() {
    // Try the normal load event first
    this.speakerSvg.addEventListener('load', () => {
      console.log('SVG load event fired');
      this.initSvgElements();
    });

    // Start polling for SVG readiness
    this.pollSvgReadiness();
  }

  pollSvgReadiness() {
    // If already initialized, stop polling
    if (this.svgInitialized) {
      return;
    }

    // Try initialization if the document exists
    if (this.speakerSvg.contentDocument) {
      console.log('Found SVG document, attempting initialization');
      this.initSvgElements();
    }

    // If we've been trying too long, force reloading the SVG
    if (this.pollAttempts && this.pollAttempts > 10) {
      console.log('Too many attempts, forcing SVG reload');
      const currentSrc = this.speakerSvg.getAttribute('data');
      this.speakerSvg.setAttribute('data', '');
      setTimeout(() => {
        this.speakerSvg.setAttribute('data', currentSrc);
        this.pollAttempts = 0; // Reset counter
      }, 100);
    } else {
      // Increment attempt counter
      this.pollAttempts = (this.pollAttempts || 0) + 1;

      // Schedule next poll - gradually increase interval to avoid CPU thrashing
      const delay = Math.min(500, 100 * this.pollAttempts);
      setTimeout(() => {
        this.pollSvgReadiness();
      }, delay);
    }
  }

  initMusic() {
    // Clean up existing audio context and nodes
    if (this.musicContext) {
      this.musicContext.close();
      this.musicContext = null;
    }

    this.musicContext = new (window.AudioContext || window.webkitAudioContext)();
    this.musicSound = new Audio(this.tracks[this.currentTrackIndex].path);
    this.musicSound.loop = true;

    // Create audio nodes
    this.musicSource = this.musicContext.createMediaElementSource(this.musicSound);
    this.musicGainNode = this.musicContext.createGain();
    this.analyser = this.musicContext.createAnalyser();

    // Configure analyzer
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.6;

    // Connect nodes in the correct order
    this.musicSource.connect(this.analyser);
    this.analyser.connect(this.musicGainNode);
    this.musicGainNode.connect(this.musicContext.destination);

    // Set up visualizer with the analyzer
    this.visualizer.setupAudio(this.analyser);
    this.visualizer.start();

    // Initialize gain
    this.musicGainNode.gain.value = 0;
  }

  updateNowPlayingText() {
    const nowPlayingText = document.querySelector('.marquee-text');
    nowPlayingText.textContent = `♫ ♪ Now Playing: ${this.tracks[this.currentTrackIndex].name} ♪ ♫`;
  }

  changeTrack() {
    // Store current state
    const wasPlaying = this.isMusicFadingIn;

    // Clean up old audio context and nodes
    if (this.musicContext) {
      this.musicContext.close();
      this.musicContext = null;
    }
    if (this.musicSound) {
      this.musicSound.pause();
      this.musicSound = null;
    }

    // Initialize new audio setup
    this.initMusic();

    // If it was playing, continue playing the new track
    if (wasPlaying) {
      this.fadeMusicIn();
    }
  }

  fadeMusicIn() {
    if (this.musicSound === null) {
      this.initMusic();
    }
    if (this.musicContext.state === 'suspended') {
      this.musicContext.resume();
    }

    // Update the now playing text before playing
    this.updateNowPlayingText();

    this.musicSound.play();
    this.isMusicFadingIn = true;
    this.musicGainNode.gain.setValueAtTime(
      this.musicGainNode.gain.value,
      this.musicContext.currentTime
    );
    this.musicGainNode.gain.linearRampToValueAtTime(
      this.musicVolume,
      this.musicContext.currentTime + this.fadeInTime
    );

    // Add visual indication of playing state
    this.playButton.classList.add('playing');

    // Replace the play icon with a pause icon
    this.updatePlayButtonIcon(true);

    // Show light
    this.musicLight.style.opacity = '1';

    // Show and animate now playing pill
    this.nowPlayingElement.style.display = 'block';
    this.nowPlayingElement.classList.remove('pill-exit');
    this.nowPlayingElement.classList.add('pill-enter');
  }

  fadeMusicOut() {
    this.isMusicFadingIn = false;
    this.musicGainNode.gain.setValueAtTime(
      this.musicGainNode.gain.value,
      this.musicContext.currentTime
    );
    this.musicGainNode.gain.linearRampToValueAtTime(
      0,
      this.musicContext.currentTime + this.fadeOutTime
    );

    // Remove playing state visual indication
    this.playButton.classList.remove('playing');

    // Replace the pause icon with a play icon
    this.updatePlayButtonIcon(false);

    // Hide light
    this.musicLight.style.opacity = '0';

    // Animate and hide now playing pill
    this.nowPlayingElement.classList.remove('pill-enter');
    this.nowPlayingElement.classList.add('pill-exit');

    setTimeout(() => {
      if (!this.isMusicFadingIn) {
        this.musicSound.pause();
        this.nowPlayingElement.style.display = 'none';
      }
    }, this.fadeOutTime * 1000);
  }

  // Update the play button icon between play and pause states
  updatePlayButtonIcon(isPlaying) {
    // Find the path element inside the play button that displays the icon
    const iconPath = this.playButton.querySelector('path');

    if (!iconPath) {
      console.error('Could not find path element within play button');
      return;
    }

    if (isPlaying) {
      // Pause icon - two vertical bars
      iconPath.setAttribute(
        'd',
        'M96.9866 29.109C96.5232 29.109 96.0769 28.7574 96.0769 28.1821V20.501C96.0769 19.9311 96.5232 19.5742 96.9866 19.5742H98.2597C98.7871 19.5742 99.0588 19.8352 99.0588 20.3732V28.081C99.0588 28.6136 98.7871 28.8853 98.2597 28.8853H96.9866ZM101.1361 29.109C100.6981 29.109 100.3371 28.7574 100.3371 28.1821V20.501C100.3371 19.9311 100.6088 19.5742 101.1361 19.5742H102.4092C102.9419 19.5742 103.2136 19.8352 103.2136 20.3732V28.081C103.2136 28.6136 102.9419 28.8853 102.4092 28.8853H101.1361Z'
      );
    } else {
      // Play icon - triangle
      iconPath.setAttribute(
        'd',
        'M96.9866 29.109C96.5232 29.109 96.1769 28.7574 96.1769 28.1821V20.501C96.1769 19.9311 96.5232 19.5742 96.9866 19.5742C97.221 19.5742 97.4287 19.6541 97.695 19.8086L104.018 23.4733C104.492 23.7503 104.705 23.9794 104.705 24.3416C104.705 24.7091 104.492 24.9382 104.018 25.2098L97.695 28.8746C97.4287 29.0291 97.221 29.109 96.9866 29.109Z'
      );
    }
  }

  playMusic() {
    if (this.musicSound === null) {
      this.musicSound = new Audio(this.tracks[this.currentTrackIndex].path);
    }

    if (this.musicSound.paused) {
      this.musicSound.play();
      this.updateNowPlayingText();
    }
  }

  pauseMusic() {
    if (this.musicSound && !this.musicSound.paused) {
      this.musicSound.pause();
      this.visualizer.stop();
    }
  }
}
