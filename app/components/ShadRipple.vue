<script lang="ts">
export interface ShadRippleProps {
    speed?: number;
    intensity?: number;
    colorScheme?: [number, number, number];
    rippleCount?: number;
    frequency?: number;
    fadeStrength?: number;
    alphaIntensity?: number;
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ShadRippleProps>(), {
    speed: .12,
    intensity: 1,
    colorScheme: () => [0.61, 1.1, 1],
    rippleCount: 55,
    frequency: 1.6,
    fadeStrength: .31,
    alphaIntensity: 5.8,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec3 iResolution;
uniform float iTime;
uniform float u_speed;
uniform float u_intensity;
uniform vec3 u_colorScheme;
uniform float u_rippleCount;
uniform float u_frequency;
uniform float u_fadeStrength;
uniform float u_alphaIntensity;

out vec4 fragColor;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    float time = iTime * u_speed;
    float ripple = 0.0;
    for(int i = 0; i < 5; i++) {
        if(float(i) >= u_rippleCount) break;
        float angle = float(i) * 6.28318 / u_rippleCount + time * 0.3;
        vec2 source = vec2(cos(angle), sin(angle)) * .4;
        float dist = length(uv - source);
        float wave = sin(dist * 15.0 * u_frequency - time * 4.0);
        float attenuation = 1.0 / (1.0 + dist * 3.0);
        ripple += wave * attenuation;
    }
    float centerDist = length(uv);
    float centerRipple = sin(centerDist * 20.0 * u_frequency - time * 5.0);
    float centerAttenuation = 1.0 / (1.0 + centerDist * 2.0);
    ripple += centerRipple * centerAttenuation * 0.5;
    ripple *= u_intensity;
    float interference = ripple * ripple;
    vec3 baseColor = u_colorScheme * 0.1;
    vec3 rippleColor = u_colorScheme * abs(ripple) * 0.8;
    vec3 interferenceColor = u_colorScheme * interference * 0.3;
    vec3 finalColor = baseColor + rippleColor + interferenceColor;
    float glow = exp(-centerDist * 1.5) * 0.2;
    finalColor += u_colorScheme * glow;
    finalColor = pow(finalColor, vec3(0.8));

    float brightness = max(length(finalColor), 1e-3);
    float alphaFromBrightness = pow(clamp(brightness, 0.0, 1.0), u_alphaIntensity);

    float v = clamp(gl_FragCoord.y / iResolution.y, 0.0, 1.0);
    float fadeTop = smoothstep(0.0, u_fadeStrength, v);
    float fadeBottom = smoothstep(0.0, u_fadeStrength, 1.0 - v);
    float edgeFade = fadeTop * fadeBottom;

    float finalAlpha = edgeFade * alphaFromBrightness;
    fragColor = vec4(finalColor * finalAlpha, finalAlpha);
}

void main() {
    vec4 color = vec4(0.0);
    mainImage(color, gl_FragCoord.xy);
    fragColor = color;
}`;

useWebGLRenderer({
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
            name: 'u_intensity',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.intensity);
            },
        },
        {
            name: 'u_colorScheme',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                const [r, g, b] = props.colorScheme;
                gl.uniform3f(location, r, g, b);
            },
        },
        {
            name: 'u_rippleCount',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.rippleCount);
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
            name: 'u_fadeStrength',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.fadeStrength);
            },
        },
        {
            name: 'u_alphaIntensity',
            setter: ({ gl, location }) => {
                if (!location) {
                    return;
                }
                gl.uniform1f(location, props.alphaIntensity);
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
