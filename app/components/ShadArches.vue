<script lang="ts">
export interface ShadArchesProps {
    speed?: number;
    colorFront?: [number, number, number, number];
    colorMid?: [number, number, number, number];
    colorBack?: [number, number, number, number];
    brightness?: number;
    contrast?: number;
}
</script>

<script setup lang="ts">

const props = withDefaults(defineProps<ShadArchesProps>(), {
    speed: 0.5,
    colorFront: () => [1.0, 1.0, 1.0, 1.0],
    colorMid: () => [0.2, 0.86, 1.0, 1.0],
    colorBack: () => [0.0, 0.0, 0.0, 0.0],
    brightness: .3,
    contrast: 1.0,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const fragmentShaderSource = `#version 300 es 
precision mediump float;

uniform vec3 iResolution;
uniform float iTime;
uniform float u_speed;
uniform vec4 u_colorFront;
uniform vec4 u_colorMid;
uniform vec4 u_colorBack;
uniform float u_brightness;
uniform float u_contrast;

out vec4 fragColor;

vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuroShape(vec2 uv, float t) {
    vec2 sine_acc = vec2(0.0);
    vec2 res = vec2(0.0);
    float scale = 8.0;

    for (int j = 0; j < 15; j++) {
        uv = rotate(uv, 1.0);
        sine_acc = rotate(sine_acc, 1.0);
        vec2 layer = uv * scale + float(j) + sine_acc - t;
        sine_acc += sin(layer);
        res += (0.5 + 0.5 * cos(layer)) / scale;
        scale *= 1.2;
    }

    return res.x + res.y;
}

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 shape_uv = (gl_FragCoord.xy - iResolution.xy) / iResolution.y * 3.0;

    float t = 0.5 * iTime * u_speed;
    float noise = neuroShape(shape_uv, t);
    noise = (1.0 + u_brightness) * noise * noise;
    noise = pow(noise, 0.7 + 6.0 * u_contrast);
    noise = min(1.4, noise);

    float blend = smoothstep(0.7, 1.4, noise);

    vec4 frontC = u_colorFront;
    frontC.rgb *= frontC.a;
    vec4 midC = u_colorMid;
    midC.rgb *= midC.a;
    vec4 blendFront = mix(midC, frontC, blend);

    float safeNoise = max(noise, 0.0);
    vec3 color = blendFront.rgb * safeNoise;
    float opacity = clamp(blendFront.a * safeNoise, 0.0, 1.0);

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color += bgColor * (1.0 - opacity);
    opacity = opacity + u_colorBack.a * (1.0 - opacity);

    color += 1.0 / 256.0 * (rand(gl_FragCoord.xy * 0.014) - 0.5);

    fragColor = vec4(color, opacity);
}
`;

useWebGLRenderer({
    enableTransparency: true,
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
                gl.uniform3f(location, size.width, size.height, 1.0);
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
            name: 'u_colorFront',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                const [r, g, b, a] = props.colorFront;
                gl.uniform4f(location, r, g, b, a);
            },
        },
        {
            name: 'u_colorMid',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                const [r, g, b, a] = props.colorMid;
                gl.uniform4f(location, r, g, b, a);
            },
        },
        {
            name: 'u_colorBack',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                const [r, g, b, a] = props.colorBack;
                gl.uniform4f(location, r, g, b, a);
            },
        },
        {
            name: 'u_brightness',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.brightness);
            },
        },
        {
            name: 'u_contrast',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.contrast);
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
