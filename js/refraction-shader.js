// ========================================
// WebGL Refraction Shader for Navbar
// Creates real light distortion effect
// ========================================

(function () {
    'use strict';

    function initRefractionShader() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Create canvas for WebGL
        const canvas = document.createElement('canvas');
        canvas.className = 'refraction-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            border-radius: 50px;
            z-index: -1;
            opacity: 0.6;
        `;
        navMenu.style.position = 'relative';
        navMenu.insertBefore(canvas, navMenu.firstChild);

        // Get WebGL context
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.warn('WebGL not supported, using CSS fallback');
            canvas.remove();
            return;
        }

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        // Fragment shader - Refraction effect
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            varying vec2 v_texCoord;

            // Noise function for organic movement
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // Smooth noise
            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
                vec2 uv = v_texCoord;
                vec2 center = vec2(0.5, 0.5);
                
                // Time-based animation
                float t = u_time * 0.5;
                
                // Create flowing refraction pattern
                float n1 = smoothNoise(uv * 3.0 + t);
                float n2 = smoothNoise(uv * 5.0 - t * 0.7);
                float n3 = smoothNoise(uv * 2.0 + vec2(t * 0.3, -t * 0.5));
                
                // Combine noise layers
                float combined = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
                
                // Mouse influence
                float mouseInfluence = 1.0 - length(uv - u_mouse) * 2.0;
                mouseInfluence = clamp(mouseInfluence, 0.0, 1.0);
                
                // Rainbow refraction colors
                vec3 color1 = vec3(0.4, 0.4, 0.95); // Blue
                vec3 color2 = vec3(0.65, 0.35, 0.95); // Purple  
                vec3 color3 = vec3(0.95, 0.4, 0.7); // Pink
                
                // Blend colors based on position and noise
                vec3 refractColor = mix(color1, color2, uv.x + combined * 0.3);
                refractColor = mix(refractColor, color3, uv.y * 0.5 + n2 * 0.2);
                
                // Highlight effect
                float highlight = pow(combined, 2.0) * 0.5;
                refractColor += vec3(highlight);
                
                // Edge glow
                float edge = 1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0);
                edge *= 1.0 - pow(abs(uv.x - 0.5) * 2.0, 4.0);
                
                // Final alpha with mouse boost
                float alpha = edge * (0.15 + combined * 0.1 + mouseInfluence * 0.15);
                
                gl_FragColor = vec4(refractColor, alpha);
            }
        `;

        // Compile shader
        function compileShader(source, type) {
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

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            canvas.remove();
            return;
        }

        // Create program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            canvas.remove();
            return;
        }

        gl.useProgram(program);

        // Setup geometry (full screen quad)
        const positions = new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]);

        const texCoords = new Float32Array([
            0, 0, 1, 0, 0, 1,
            0, 1, 1, 0, 1, 1
        ]);

        // Position buffer
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // TexCoord buffer
        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        const texLoc = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        const timeLoc = gl.getUniformLocation(program, 'u_time');
        const resLoc = gl.getUniformLocation(program, 'u_resolution');
        const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

        // Mouse tracking
        let mouseX = 0.5, mouseY = 0.5;
        navMenu.addEventListener('mousemove', (e) => {
            const rect = navMenu.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
        });

        navMenu.addEventListener('mouseleave', () => {
            mouseX = 0.5;
            mouseY = 0.5;
        });

        // Resize handler
        function resize() {
            const rect = navMenu.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        resize();
        window.addEventListener('resize', resize);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Animation loop
        let startTime = Date.now();
        let animationId;

        function render() {
            const time = (Date.now() - startTime) / 1000;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform1f(timeLoc, time);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.uniform2f(mouseLoc, mouseX, mouseY);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationId = requestAnimationFrame(render);
        }

        render();

        // Cleanup on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                render();
            }
        });

        console.log('🌈 WebGL Refraction Shader initialized');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRefractionShader);
    } else {
        initRefractionShader();
    }
})();
