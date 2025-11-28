/**
 * Cursor-reactive visual effects
 *
 * - Liquid Glass: WebGL refraction lens that follows cursor
 * - Chromatic: SVG filter RGB split
 * - Ripple: SVG displacement
 */

export class ShaderOverlay {
  constructor(options = {}) {
    this.enabled = false;
    this.currentEffect = options.effect || 'glass';
    this.intensity = options.intensity || 0.7;

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.smoothMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.lensSize = 120; // Smaller default lens

    // WebGL for liquid glass
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.backgroundTexture = null;
    this.uniforms = {};
    this.textureReady = false;

    // SVG filters for other effects
    this.svgFilters = null;

    this.animationId = null;
    this.captureScheduled = false;

    this.init();
  }

  init() {
    this.createCanvas();
    this.setupWebGL();
    this.createSVGFilters();
    this.setupEventListeners();
    this.loadHtml2Canvas();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'liquid-glass-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999998;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this.canvas);
  }

  setupWebGL() {
    this.gl = this.canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!this.gl) {
      console.warn('WebGL not supported');
      return;
    }

    const gl = this.gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Simplified liquid glass shader - circular lens only around cursor
    const fsSource = `
      precision highp float;

      uniform sampler2D u_background;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_lensRadius;
      uniform float u_intensity;
      uniform float u_dpr;

      varying vec2 v_uv;

      void main() {
        // Convert UV to screen pixels
        vec2 screenPos = v_uv * u_resolution / u_dpr;
        vec2 mousePos = u_mouse;

        // Distance from cursor in pixels
        float dist = distance(screenPos, mousePos);
        float radius = u_lensRadius;

        // Outside lens - transparent (show page beneath)
        if (dist > radius) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        // Normalized distance within lens (0 at center, 1 at edge)
        float nd = dist / radius;

        // Dome curvature for refraction
        float dome = sqrt(1.0 - nd * nd); // hemisphere shape

        // Direction from center
        vec2 dir = (screenPos - mousePos) / radius;

        // Refraction offset - bends inward like a magnifying glass
        // Much more aggressive aberration
        float refractStrength = 0.25 * u_intensity;
        vec2 offset = dir * nd * (1.0 - dome) * refractStrength;

        // Sample background with refraction
        vec2 sampleUV = v_uv - offset;
        sampleUV.y = 1.0 - sampleUV.y; // Flip Y for html2canvas
        vec3 color = texture2D(u_background, sampleUV).rgb;

        // Blur near edges (simple box blur)
        float blurAmount = nd * nd * 0.003 * u_intensity;
        vec3 blur = vec3(0.0);
        float samples = 0.0;
        for (int x = -2; x <= 2; x++) {
          for (int y = -2; y <= 2; y++) {
            vec2 off = vec2(float(x), float(y)) * blurAmount;
            blur += texture2D(u_background, sampleUV + off).rgb;
            samples += 1.0;
          }
        }
        color = mix(color, blur / samples, nd * 0.5);

        // Edge highlight (rim lighting)
        float edge = smoothstep(0.7, 1.0, nd);
        color = mix(color, vec3(1.0), edge * 0.3);

        // Inner shadow at top
        float shadow = smoothstep(0.0, 0.5, -dir.y + 0.3) * (1.0 - nd);
        color = mix(color, color * 0.85, shadow * 0.2);

        // Slight tint
        color = mix(color, vec3(0.95, 0.97, 1.0), 0.05);

        // Soften edges
        float alpha = smoothstep(1.0, 0.9, nd) * 0.95;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      lensRadius: gl.getUniformLocation(this.program, 'u_lensRadius'),
      intensity: gl.getUniformLocation(this.program, 'u_intensity'),
      dpr: gl.getUniformLocation(this.program, 'u_dpr'),
      background: gl.getUniformLocation(this.program, 'u_background')
    };

    // Background texture
    this.backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Initialize with a placeholder (1x1 white pixel)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createSVGFilters() {
    this.svgFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgFilters.id = 'shader-svg-filters';
    this.svgFilters.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden;';
    this.svgFilters.innerHTML = `
      <defs>
        <filter id="chromatic-filter" x="-5%" y="-5%" width="110%" height="110%">
          <feOffset in="SourceGraphic" dx="3" dy="0" result="red-channel"/>
          <feOffset in="SourceGraphic" dx="-3" dy="0" result="blue-channel"/>
          <feColorMatrix in="red-channel" type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
          <feColorMatrix in="SourceGraphic" type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
          <feColorMatrix in="blue-channel" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
          <feBlend in="red" in2="green" mode="screen" result="rg"/>
          <feBlend in="rg" in2="blue" mode="screen"/>
        </filter>
        <filter id="ripple-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(this.svgFilters);
  }

  loadHtml2Canvas() {
    if (window.html2canvas) {
      console.log('html2canvas already loaded');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => console.log('html2canvas loaded');
    script.onerror = () => console.error('Failed to load html2canvas');
    document.head.appendChild(script);
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    });

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    // Re-capture on resize
    if (this.enabled && this.currentEffect === 'glass') {
      this.scheduleCapture();
    }
  }

  scheduleCapture() {
    if (this.captureScheduled) return;
    this.captureScheduled = true;

    // Small delay to let DOM settle
    setTimeout(() => {
      this.captureBackground();
      this.captureScheduled = false;
    }, 50);
  }

  async captureBackground() {
    if (!window.html2canvas) {
      console.warn('html2canvas not loaded yet');
      return;
    }

    try {
      // Hide canvas during capture
      const prevOpacity = this.canvas.style.opacity;
      this.canvas.style.opacity = '0';
      this.canvas.style.display = 'none';

      const captured = await window.html2canvas(document.documentElement, {
        scale: window.devicePixelRatio || 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight
      });

      this.canvas.style.display = 'block';
      this.canvas.style.opacity = prevOpacity;

      // Upload to WebGL texture
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captured);

      this.textureReady = true;
      console.log('Background captured', captured.width, 'x', captured.height);

    } catch (e) {
      console.error('Capture failed:', e);
      this.canvas.style.display = 'block';
    }
  }

  setEffect(name) {
    this.clearEffects();
    this.currentEffect = name;
    if (this.enabled) {
      this.applyEffect();
    }
  }

  clearEffects() {
    this.canvas.style.opacity = '0';
    document.body.style.filter = '';
  }

  applyEffect() {
    if (this.currentEffect === 'glass') {
      this.canvas.style.opacity = '1';
      this.scheduleCapture();
    } else if (this.currentEffect === 'chromatic') {
      document.body.style.filter = 'url(#chromatic-filter)';
    } else if (this.currentEffect === 'ripple') {
      document.body.style.filter = 'url(#ripple-filter)';
    }
  }

  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));
    this.lensSize = 80 + this.intensity * 100; // 80-180px range
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.resize();
    this.applyEffect();
    this.animate();
  }

  disable() {
    this.enabled = false;
    this.clearEffects();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  toggle() {
    this.enabled ? this.disable() : this.enable();
  }

  animate() {
    if (!this.enabled) return;

    // Smooth mouse
    this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.15;
    this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.15;

    if (this.currentEffect === 'glass' && this.gl && this.textureReady) {
      const gl = this.gl;
      const dpr = window.devicePixelRatio || 1;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
      // Flip Y for WebGL coordinate system (Y=0 at bottom)
      gl.uniform2f(this.uniforms.mouse, this.smoothMouse.x, window.innerHeight - this.smoothMouse.y);
      gl.uniform1f(this.uniforms.lensRadius, this.lensSize);
      gl.uniform1f(this.uniforms.intensity, this.intensity);
      gl.uniform1f(this.uniforms.dpr, dpr);
      gl.uniform1i(this.uniforms.background, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.disable();
    this.canvas?.remove();
    this.svgFilters?.remove();
  }
}

export function initShaderOverlay(options = {}) {
  const shader = new ShaderOverlay(options);

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'L') {
      shader.toggle();
    }

    if (shader.enabled) {
      if (e.key === '1') shader.setEffect('glass');
      if (e.key === '2') shader.setEffect('chromatic');
      if (e.key === '3') shader.setEffect('ripple');

      // R to recapture background
      if (e.key === 'r' || e.key === 'R') {
        shader.scheduleCapture();
      }

      if (e.key === '=' || e.key === '+') {
        shader.setIntensity(shader.intensity + 0.1);
      } else if (e.key === '-') {
        shader.setIntensity(shader.intensity - 0.1);
      }
    }
  });

  return shader;
}
