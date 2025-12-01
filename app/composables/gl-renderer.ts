import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';

export interface UniformSetterContext {
    gl: WebGLRenderingContext;
    location: WebGLUniformLocation | null;
    elapsed: number;
    size: { width: number; height: number };
}

export type UniformSetter = (context: UniformSetterContext) => void;

export interface WebGLUniformConfig {
    name: string;
    setter: UniformSetter;
}

export type UniformValueHasher = (context: UniformSetterContext) => string;

export interface WebGLUniformConfigWithCache extends WebGLUniformConfig {
    hash?: UniformValueHasher;
}

export interface UseWebGLRendererOptions {
    canvasRef: Ref<HTMLCanvasElement | null>;
    containerRef: Ref<HTMLElement | null>;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    uniforms: WebGLUniformConfigWithCache[];
    enableTransparency?: boolean;
}

export const FULLSCREEN_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const getDevicePixelRatio = () => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);

export const useWebGLRenderer = (options: UseWebGLRendererOptions) => {
    const shouldEnableTransparency = options.enableTransparency ?? true;
    const canvasSize = { width: 0, height: 0 };
    const uniformLocations = new Map<string, WebGLUniformLocation | null>();
    const uniformCache = new Map<string, string>();

    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let buffer: WebGLBuffer | null = null;
    let animationFrameId = 0;
    let startTimestamp = 0;

    const syncCanvasSize = () => {
        const canvas = options.canvasRef.value;
        const container = options.containerRef.value;
        if (!canvas || !container) {
            return;
        }

        const rect = container.getBoundingClientRect();
        const widthPx = Math.max(rect.width, 1);
        const heightPx = Math.max(rect.height, 1);
        const dpr = 1 //getDevicePixelRatio();
        const width = Math.floor(widthPx * dpr);
        const height = Math.floor(heightPx * dpr);

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        canvas.style.width = `${widthPx}px`;
        canvas.style.height = `${heightPx}px`;

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
        const activeGl = gl;
        if (!activeGl || !program) {
            return;
        }

        if (!canvasSize.width || !canvasSize.height) {
            animationFrameId = requestAnimationFrame(renderFrame);
            return;
        }

        const elapsed = (timestamp - startTimestamp) / 1000;
        activeGl.useProgram(program);

        options.uniforms.forEach(({ name, setter, hash }) => {
            const location = uniformLocations.get(name) ?? null;
            const context: UniformSetterContext = { gl: activeGl, location, elapsed, size: canvasSize };
            if (hash) {
                const key = hash(context);
                const previous = uniformCache.get(name);
                if (previous === key) {
                    return;
                }
                uniformCache.set(name, key);
            }
            setter(context);
        });

        activeGl.drawArrays(activeGl.TRIANGLES, 0, 6);
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
        uniformLocations.clear();
        uniformCache.clear();
    };

    const initGl = () => {
        if (gl || !options.canvasRef.value) {
            return;
        }

        const context = options.canvasRef.value.getContext('webgl2', { alpha: shouldEnableTransparency });
        if (!context) {
            console.warn('WebGL not supported in this browser.');
            return;
        }

        gl = context;
        vertexShader = createShader(gl, gl.VERTEX_SHADER, options.vertexShaderSource);
        fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, options.fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            cleanup();
            return;
        }

        program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) {
            cleanup();
            return;
        }

        if (shouldEnableTransparency) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

        uniformLocations.clear();
        uniformCache.clear();
        options.uniforms.forEach(({ name }) => {
            uniformLocations.set(name, gl?.getUniformLocation(program!, name) ?? null);
        });

        startTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(renderFrame);
    };

    const handleContextLost = (event: Event) => {
        event.preventDefault();
        cleanup();
    };

    const handleContextRestored = () => {
        uniformCache.clear();
        initGl();
    };

    useResizeObserver(options.containerRef, () => {
        syncCanvasSize();
    });

    onMounted(() => {
        nextTick(() => {
            syncCanvasSize();
            initGl();
            if (options.canvasRef.value) {
                options.canvasRef.value.addEventListener('webglcontextlost', handleContextLost, false);
                options.canvasRef.value.addEventListener('webglcontextrestored', handleContextRestored, false);
            }
        });
    });

    onBeforeUnmount(() => {
        if (options.canvasRef.value) {
            options.canvasRef.value.removeEventListener('webglcontextlost', handleContextLost);
            options.canvasRef.value.removeEventListener('webglcontextrestored', handleContextRestored);
        }
        cleanup();
    });

    return {
        cleanup,
        syncCanvasSize,
    };
};
