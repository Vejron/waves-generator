<script lang="ts">
export interface VeroniProps {
    speed?: number;
    frequency?: number;
    smoothness?: number;
    glossyMode?: number;
}
</script>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

const props = withDefaults(defineProps<VeroniProps>(), {
    speed: .1,
    frequency: 2,
    smoothness: 0.7,
    glossyMode: 1,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const canvasSize = { width: 1, height: 1 };

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShaderSource = String.raw`
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float u_speed;
uniform float u_frequency;
uniform float u_smoothness;
uniform float u_glossyMode;

vec2 hash22(vec2 p) {
        float n = sin(dot(p, vec2(41.0, 289.0)));
        p = fract(vec2(2097152.0, 262144.0) * n);
        return cos(p * 6.283 + iTime * u_speed) * 0.5;
}
float smoothVoronoi(vec2 p, float falloff) {
        vec2 ip = floor(p);
        p -= ip;
        float d = 1.0;
        float res = 0.0;
        for(int i = -1; i <= 2; i++) {
                for(int j = -1; j <= 2; j++) {
                        vec2 b = vec2(float(i), float(j));
                        vec2 v = b - p + hash22(ip + b);
                        d = max(dot(v,v), 1e-4);
                        res += 1.0 / pow(d, falloff);
                }
        }
        return pow(1.0 / res, 0.5 / falloff);
}
float func2D(vec2 p) {
        float d = smoothVoronoi(p * 2.0, 4.0) * 0.66 + smoothVoronoi(p * 6.0, 4.0) * 0.34;
        return sqrt(d);
}
float smoothFract(float x, float sf) {
        x = fract(x);
        return min(x, x * (1.0 - x) * sf);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = (fragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
        vec2 e = vec2(0.001, 0.0);
        float f = func2D(uv);
        float g = length(vec2(f - func2D(uv - e.xy), f - func2D(uv - e.yx))) / e.x;
        g = 1.0 / max(g, 0.001);
        float freq = u_frequency;
        float smoothFactor = iResolution.y * 0.0125 * u_smoothness;
        float c;
        if (u_glossyMode > 0.5) {
                c = smoothFract(f * freq, g * iResolution.y / 16.0);
        } else {
                c = clamp(cos(f * freq * 6.28318530718) * g * smoothFactor, 0.0, 1.0);
        }
        vec3 col = vec3(c);
        vec3 col2 = vec3(c * 0.64, c, c * c * 0.1);
        if (u_glossyMode > 0.5) {
                col = mix(col, col2, -uv.y + clamp(fract(f * freq * 0.5) * 2.0 - 1.0, 0.0, 1.0));
        } else {
                col = mix(col, col2, -uv.y + clamp(cos(f * freq * 3.14159) * 2.0, 0.0, 1.0));
        }
        f = f * freq;
        if (u_glossyMode > 0.5) {
                if(f > 8.0 && f < 9.0) {
                        col *= vec3(1.0, 0.0, 0.1);
                }
        } else {
                if(f > 8.5 && f < 9.5) {
                        col *= vec3(1.0, 0.0, 0.1);
                }
        }
        if (u_glossyMode > 0.5) {
                col += g * g * g * vec3(0.3, 0.5, 1.0) * 0.0015625;
        }
        fragColor = vec4(sqrt(clamp(col, 0.0, 1.0)), 1.0);
}
void main() {
        vec4 color = vec4(0.0);
        mainImage(color, gl_FragCoord.xy);
        gl_FragColor = color;
}`;

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let vertexShader: WebGLShader | null = null;
let fragmentShader: WebGLShader | null = null;
let buffer: WebGLBuffer | null = null;
let animationFrameId = 0;
let startTimestamp = 0;

const uniforms: Record<string, WebGLUniformLocation | null> = {
    iResolution: null,
    iTime: null,
    u_speed: null,
    u_frequency: null,
    u_smoothness: null,
    u_glossyMode: null,
};

const getDevicePixelRatio = () => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);

const syncCanvasSize = () => {
    if (!canvasRef.value || !containerRef.value) {
        return;
    }

    const rect = containerRef.value.getBoundingClientRect();
    const widthPx = Math.max(rect.width, 1);
    const heightPx = Math.max(rect.height, 1);
    const dpr = getDevicePixelRatio();
    const width = Math.floor(widthPx * dpr);
    const height = Math.floor(heightPx * dpr);

    if (canvasRef.value.width !== width || canvasRef.value.height !== height) {
        canvasRef.value.width = width;
        canvasRef.value.height = height;
    }

    canvasRef.value.style.width = `${widthPx}px`;
    canvasRef.value.style.height = `${heightPx}px`;

    if (gl) {
        gl.viewport(0, 0, width, height);
    }

    canvasSize.width = width;
    canvasSize.height = height;
};

const createShader = (glContext: WebGLRenderingContext, type: number, source: string) => {
    const shader = glContext.createShader(type);
    if (!shader) {
        return null;
    }

    glContext.shaderSource(shader, source);
    glContext.compileShader(shader);

    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error(glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
    }

    return shader;
};

const createProgram = (glContext: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) => {
    const prog = glContext.createProgram();
    if (!prog) {
        return null;
    }

    glContext.attachShader(prog, vs);
    glContext.attachShader(prog, fs);
    glContext.linkProgram(prog);

    if (!glContext.getProgramParameter(prog, glContext.LINK_STATUS)) {
        console.error(glContext.getProgramInfoLog(prog));
        glContext.deleteProgram(prog);
        return null;
    }

    return prog;
};

const renderFrame = (timestamp: number) => {
    if (!gl || !canvasRef.value || !program) {
        return;
    }

    const { width, height } = canvasSize;
    if (!width || !height) {
        animationFrameId = requestAnimationFrame(renderFrame);
        return;
    }

    const elapsed = (timestamp - startTimestamp) / 1000;
    gl.useProgram(program);

    if (uniforms.iResolution) {
        gl.uniform3f(uniforms.iResolution, width, height, 1.0);
    }
    if (uniforms.iTime) {
        gl.uniform1f(uniforms.iTime, elapsed);
    }
    if (uniforms.u_speed) {
        gl.uniform1f(uniforms.u_speed, props.speed);
    }
    if (uniforms.u_frequency) {
        gl.uniform1f(uniforms.u_frequency, props.frequency);
    }
    if (uniforms.u_smoothness) {
        gl.uniform1f(uniforms.u_smoothness, props.smoothness);
    }
    if (uniforms.u_glossyMode) {
        gl.uniform1f(uniforms.u_glossyMode, props.glossyMode);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationFrameId = requestAnimationFrame(renderFrame);
};

const initGl = () => {
    if (gl || !canvasRef.value) {
        return;
    }

    const context = canvasRef.value.getContext('webgl');
    if (!context) {
        console.warn('WebGL not supported in this browser.');
        return;
    }

    gl = context;
    vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        cleanup();
        return;
    }

    program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        cleanup();
        return;
    }

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]),
        gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    uniforms.iResolution = gl.getUniformLocation(program, 'iResolution');
    uniforms.iTime = gl.getUniformLocation(program, 'iTime');
    uniforms.u_speed = gl.getUniformLocation(program, 'u_speed');
    uniforms.u_frequency = gl.getUniformLocation(program, 'u_frequency');
    uniforms.u_smoothness = gl.getUniformLocation(program, 'u_smoothness');
    uniforms.u_glossyMode = gl.getUniformLocation(program, 'u_glossyMode');

    startTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(renderFrame);
};

const cleanup = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    if (gl && buffer) {
        gl.deleteBuffer(buffer);
        buffer = null;
    }

    if (gl && program) {
        gl.deleteProgram(program);
        program = null;
    }

    if (gl && vertexShader) {
        gl.deleteShader(vertexShader);
        vertexShader = null;
    }

    if (gl && fragmentShader) {
        gl.deleteShader(fragmentShader);
        fragmentShader = null;
    }

    gl = null;
};

useResizeObserver(containerRef, () => {
    syncCanvasSize();
});

onMounted(() => {
    nextTick(() => {
        syncCanvasSize();
        initGl();
    });
});

onBeforeUnmount(() => {
    cleanup();
});
</script>

<template>
    <div ref="containerRef" class="relative">
        <canvas ref="canvasRef" class="block h-full w-full" />
    </div>
</template>