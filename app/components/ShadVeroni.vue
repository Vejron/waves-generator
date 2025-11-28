<script lang="ts">
export interface VeroniProps {
    speed?: number;
    frequency?: number;
    smoothness?: number;
    glossyMode?: number;
}
</script>

<script setup lang="ts">

const props = withDefaults(defineProps<VeroniProps>(), {
    speed: .1,
    frequency: 2,
    smoothness: 0.7,
    glossyMode: 1,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec3 iResolution;
uniform float iTime;
uniform float u_speed;
uniform float u_frequency;
uniform float u_smoothness;
uniform float u_glossyMode;

out vec4 fragColor;

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
        fragColor = color;
}`;

useWebGLRenderer({
    enableTransparency: false,
    canvasRef,
    containerRef,
    vertexShaderSource: FULLSCREEN_VERTEX_SHADER,
    fragmentShaderSource,
    uniforms: [
        {
            name: 'iResolution',
            setter: ({ gl, location, size }) => {
                if (!location) {
                    return;
                }
                gl.uniform3f(location, size.width * 0.5, size.height * 0.5, 1.0);
            },
        },
        {
            name: 'iTime',
            setter: ({ gl, location, elapsed }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, elapsed);
            },
        },
        {
            name: 'u_speed',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.speed);
            },
        },
        {
            name: 'u_frequency',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.frequency);
            },
        },
        {
            name: 'u_smoothness',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.smoothness);
            },
        },
        {
            name: 'u_glossyMode',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.glossyMode);
            },
        },
    ],
});
</script>

<template>
    <div ref="containerRef" class="relative">
        <canvas ref="canvasRef" class="block h-full w-full" />
    </div>
</template>