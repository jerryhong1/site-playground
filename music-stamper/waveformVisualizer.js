export class WaveformVisualizer {
  constructor() {
    this.canvas = document.getElementById('waveform-visualizer');
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.ctx = this.canvas.getContext('2d');

    // Get RGB values for accent color
    const style = getComputedStyle(document.documentElement);
    const accentColorRGB = style.getPropertyValue('--accent-color-rgb').trim();
    this.accentColorRGB = accentColorRGB || '255, 255, 255'; // fallback to white if not set

    // Sliders for bars and smoothing
    this.barsSlider = document.getElementById('bars-slider');
    this.smoothingSlider = document.getElementById('smoothing-slider');
    this.barCount = this.barsSlider ? parseInt(this.barsSlider.value) : 64;
    this.smoothing = this.smoothingSlider ? parseInt(this.smoothingSlider.value) / 100 : 0.6;

    if (this.barsSlider) {
      this.barsSlider.addEventListener('input', () => {
        this.barCount = parseInt(this.barsSlider.value);
      });
    }
    if (this.smoothingSlider) {
      this.smoothingSlider.addEventListener('input', () => {
        this.smoothing = parseInt(this.smoothingSlider.value) / 100;
        if (this.analyser) {
          this.analyser.smoothingTimeConstant = this.smoothing;
        }
      });
    }

    this.particles = [];
    this.analyser = null;
    this.dataArray = null;
    this.animationFrameId = null;

    // Particle settings
    this.particleCount = 120;
    this.baseParticleSize = 8;
    this.baseWaveHeight = 64;
    this.waveSpeed = 0.05;
    this.time = 0;

    // Audio analysis settings
    this.smoothingFactor = 0.3; // How smooth the transitions should be
    this.bassValue = 0;
    this.midsValue = 0;
    this.highsValue = 0;

    // Initialize particles
    this.initParticles();

    // Start drawing immediately for testing
    this.start();
  }

  initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: (i / (this.particleCount - 1)) * this.canvas.width,
        y: this.canvas.height / 2,
        baseY: this.canvas.height / 2,
        size: this.baseParticleSize,
        opacity: 0.7,
      });
    }
  }

  setupAudio(analyserNode) {
    console.log('Setting up visualizer with analyzer node');
    this.analyser = analyserNode;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    // Set smoothing from slider if available
    if (this.smoothingSlider) {
      this.analyser.smoothingTimeConstant = this.smoothing;
    }
    // Update bars slider max to match available bins
    if (this.barsSlider) {
      this.barsSlider.max = this.dataArray.length;
      if (this.barCount > this.dataArray.length) {
        this.barCount = this.dataArray.length;
        this.barsSlider.value = this.barCount;
      }
    }
    console.log('Visualizer setup complete. Buffer length:', this.dataArray.length);
  }

  analyzeAudio() {
    if (!this.analyser || !this.dataArray) {
      return;
    }

    try {
      this.analyser.getByteFrequencyData(this.dataArray);

      // Get average values for different frequency ranges
      const bass = this.dataArray.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      const mids = this.dataArray.slice(8, 24).reduce((a, b) => a + b, 0) / 16;
      const highs = this.dataArray.slice(24, 48).reduce((a, b) => a + b, 0) / 24;

      // Smooth the transitions
      this.bassValue =
        this.bassValue * (1 - this.smoothingFactor) + (bass / 255) * this.smoothingFactor;
      this.midsValue =
        this.midsValue * (1 - this.smoothingFactor) + (mids / 255) * this.smoothingFactor;
      this.highsValue =
        this.highsValue * (1 - this.smoothingFactor) + (highs / 255) * this.smoothingFactor;
    } catch (error) {
      console.error('Error analyzing audio:', error);
    }
  }

  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      const maxBars = this.dataArray.length;
      const bucketCount = Math.max(1, Math.min(this.barCount, maxBars));
      const barWidth = this.canvas.width / bucketCount;
      // Calculate left offset to center the bars horizontally
      const totalBarsWidth = barWidth * bucketCount;
      const leftOffset = (this.canvas.width - totalBarsWidth) / 2;
      const centerY = this.canvas.height / 2;
      for (let i = 0; i < bucketCount; i++) {
        // Logarithmic bin index for this bar (0 = lowest freq, 1 = highest)
        const t = i / (bucketCount - 1);
        const logIndex = Math.log10(1 + t * (this.dataArray.length - 1));
        const binIndex = Math.floor(
          ((Math.pow(10, logIndex) - 1) / (this.dataArray.length - 1)) * (this.dataArray.length - 1)
        );
        const safeBin = Math.max(0, Math.min(this.dataArray.length - 1, binIndex));
        let value = this.dataArray[safeBin];
        // Frequency normalization: boost higher frequencies
        const norm = 0.8 + 1.2 * t * t; // Linear boost, tweak as needed
        value = value * norm;
        const percent = Math.min(1, value / 255);
        const barHeight = percent * (this.canvas.height / 2); // Only half the canvas, since it grows both ways
        const x = leftOffset + i * barWidth;
        const y = centerY - barHeight;
        this.ctx.fillStyle = `rgba(${this.accentColorRGB}, 0.7)`;
        this.ctx.fillRect(x, y, barWidth - 1, barHeight * 2);
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }

  start() {
    if (!this.animationFrameId) {
      this.draw();
    }
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.particles = [];
    this.initParticles(); // Reinitialize particles for new dimensions
  }
}
