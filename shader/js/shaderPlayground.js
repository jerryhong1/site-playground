import { ShaderOverlay } from './modules/shaderOverlay.js';

/**
 * Shader Playground
 * Extended version of ShaderOverlay with real-time parameter control
 */

class ShaderPlayground extends ShaderOverlay {
  constructor(options = {}) {
    super(options);
    this.setupPlaygroundControls();
  }

  setupPlaygroundControls() {
    // Effect type buttons
    const glassBtn = document.getElementById('effect-glass');
    const chromaticBtn = document.getElementById('effect-chromatic');
    const rippleBtn = document.getElementById('effect-ripple');

    const updateActiveButton = (activeBtn) => {
      [glassBtn, chromaticBtn, rippleBtn].forEach(btn => btn.classList.remove('active'));
      activeBtn.classList.add('active');
    };

    glassBtn.addEventListener('click', () => {
      this.setEffect('glass');
      updateActiveButton(glassBtn);
    });

    chromaticBtn.addEventListener('click', () => {
      this.setEffect('chromatic');
      updateActiveButton(chromaticBtn);
    });

    rippleBtn.addEventListener('click', () => {
      this.setEffect('ripple');
      updateActiveButton(rippleBtn);
    });

    // Parameter controls for glass effect
    this.setupRangeControl('lens-size', (value) => {
      this.lensSize = parseFloat(value);
    });

    this.setupRangeControl('intensity', (value) => {
      this.intensity = parseFloat(value);
    });

    this.setupRangeControl('refract-strength', (value) => {
      this.refractStrength = parseFloat(value);
      this.updateShaderRefractStrength();
    });

    this.setupRangeControl('blur-amount', (value) => {
      this.blurAmount = parseFloat(value);
      this.updateShaderBlurAmount();
    });

    // Toggle button
    const toggleBtn = document.getElementById('toggle-effect');
    toggleBtn.addEventListener('click', () => {
      this.toggle();
      toggleBtn.textContent = this.enabled ? 'Disable Effect' : 'Enable Effect';
    });

    // Recapture button
    document.getElementById('recapture').addEventListener('click', () => {
      this.scheduleCapture();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.toggle();
        toggleBtn.textContent = this.enabled ? 'Disable Effect' : 'Enable Effect';
      }

      if (this.enabled) {
        if (e.key === '1') {
          this.setEffect('glass');
          updateActiveButton(glassBtn);
        }
        if (e.key === '2') {
          this.setEffect('chromatic');
          updateActiveButton(chromaticBtn);
        }
        if (e.key === '3') {
          this.setEffect('ripple');
          updateActiveButton(rippleBtn);
        }

        if (e.key === 'r' || e.key === 'R') {
          this.scheduleCapture();
        }

        if (e.key === '=' || e.key === '+') {
          const newIntensity = Math.min(1, this.intensity + 0.1);
          this.setIntensity(newIntensity);
          document.getElementById('intensity').value = newIntensity;
          document.getElementById('intensity-value').textContent = newIntensity.toFixed(1);
        } else if (e.key === '-') {
          const newIntensity = Math.max(0, this.intensity - 0.1);
          this.setIntensity(newIntensity);
          document.getElementById('intensity').value = newIntensity;
          document.getElementById('intensity-value').textContent = newIntensity.toFixed(1);
        }
      }
    });
  }

  setupRangeControl(id, callback) {
    const input = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);

    input.addEventListener('input', (e) => {
      const value = e.target.value;
      valueDisplay.textContent = parseFloat(value).toFixed(id === 'intensity' ? 1 : (id === 'lens-size' ? 0 : 3));
      callback(value);
    });
  }

  // Override setupWebGL to make shader parameters modifiable
  setupWebGL() {
    super.setupWebGL();

    // Store default shader parameters
    this.refractStrength = 0.25;
    this.blurAmount = 0.003;
  }

  // Rebuild shader with new refract strength
  updateShaderRefractStrength() {
    if (!this.gl) return;

    const gl = this.gl;

    const fsSource = `
      precision highp float;

      uniform sampler2D u_background;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_lensRadius;
      uniform float u_intensity;
      uniform float u_dpr;
      uniform float u_refractStrength;
      uniform float u_blurAmount;

      varying vec2 v_uv;

      void main() {
        vec2 screenPos = v_uv * u_resolution / u_dpr;
        vec2 mousePos = u_mouse;
        float dist = distance(screenPos, mousePos);
        float radius = u_lensRadius;

        if (dist > radius) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        float nd = dist / radius;
        float dome = sqrt(1.0 - nd * nd);
        vec2 dir = (screenPos - mousePos) / radius;

        // Use dynamic refract strength
        vec2 offset = dir * nd * (1.0 - dome) * u_refractStrength * u_intensity;

        vec2 sampleUV = v_uv - offset;
        sampleUV.y = 1.0 - sampleUV.y;
        vec3 color = texture2D(u_background, sampleUV).rgb;

        // Use dynamic blur amount
        vec3 blur = vec3(0.0);
        float samples = 0.0;
        for (int x = -2; x <= 2; x++) {
          for (int y = -2; y <= 2; y++) {
            vec2 off = vec2(float(x), float(y)) * u_blurAmount * u_intensity;
            blur += texture2D(u_background, sampleUV + off).rgb;
            samples += 1.0;
          }
        }
        color = mix(color, blur / samples, nd * 0.5);

        float edge = smoothstep(0.7, 1.0, nd);
        color = mix(color, vec3(1.0), edge * 0.3);

        float shadow = smoothstep(0.0, 0.5, -dir.y + 0.3) * (1.0 - nd);
        color = mix(color, color * 0.85, shadow * 0.2);

        color = mix(color, vec3(0.95, 0.97, 1.0), 0.05);

        float alpha = smoothstep(1.0, 0.9, nd) * 0.95;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    // Delete old program
    if (this.program) {
      gl.deleteProgram(this.program);
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Update uniforms
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      lensRadius: gl.getUniformLocation(this.program, 'u_lensRadius'),
      intensity: gl.getUniformLocation(this.program, 'u_intensity'),
      dpr: gl.getUniformLocation(this.program, 'u_dpr'),
      background: gl.getUniformLocation(this.program, 'u_background'),
      refractStrength: gl.getUniformLocation(this.program, 'u_refractStrength'),
      blurAmount: gl.getUniformLocation(this.program, 'u_blurAmount')
    };

    // Re-setup vertex buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }

  updateShaderBlurAmount() {
    // Shader parameters are updated in animate() loop
  }

  // Override animate to use dynamic shader parameters
  animate() {
    if (!this.enabled) return;

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
      gl.uniform2f(this.uniforms.mouse, this.smoothMouse.x, window.innerHeight - this.smoothMouse.y);
      gl.uniform1f(this.uniforms.lensRadius, this.lensSize);
      gl.uniform1f(this.uniforms.intensity, this.intensity);
      gl.uniform1f(this.uniforms.dpr, dpr);
      gl.uniform1i(this.uniforms.background, 0);

      // Set dynamic parameters if uniforms exist
      if (this.uniforms.refractStrength) {
        gl.uniform1f(this.uniforms.refractStrength, this.refractStrength);
      }
      if (this.uniforms.blurAmount) {
        gl.uniform1f(this.uniforms.blurAmount, this.blurAmount);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize playground
document.addEventListener('DOMContentLoaded', () => {
  const playground = new ShaderPlayground({
    effect: 'glass',
    intensity: 0.7
  });

  // Auto-enable on load
  setTimeout(() => {
    playground.enable();
    document.getElementById('toggle-effect').textContent = 'Disable Effect';
  }, 500);

  window.shaderPlayground = playground;
});
