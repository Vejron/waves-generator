/**
 * Example usage of invertSvgMask utility for ASection component
 * 
 * Instead of manually creating the inverse mask SVG, you can now
 * generate it automatically from the top mask.
 */

import { invertSvgMask } from '~/utils/svg-mask-inverter';

// Example: Your top mask SVG
const topMaskSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100S32.06,0,326.72,0c255.72,0,358.35,119.2,673.28,77.47v22.53H0Z"/></svg>';

// Generate the inverted bottom mask
const bottomMaskSvg = invertSvgMask(topMaskSvg, 100);

console.log('Top mask:', topMaskSvg);
console.log('Bottom mask:', bottomMaskSvg);

/**
 * You can then use this in your ASection.vue component:
 * 
 * <style scoped>
 * .mask-container {
 *   --top-mask-image: v-bind(encodedTopMask);
 *   --bottom-mask-image: v-bind(encodedBottomMask);
 * }
 * </style>
 * 
 * <script setup>
 * import { invertSvgMask } from '~/utils/svg-mask-inverter';
 * 
 * const topMaskSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,100S32.06,0,326.72,0c255.72,0,358.35,119.2,673.28,77.47v22.53H0Z"/></svg>';
 * const bottomMaskSvg = invertSvgMask(topMaskSvg, 100);
 * 
 * // Encode for use in CSS (optional, depending on your needs)
 * const encodedTopMask = `url('data:image/svg+xml,${encodeURIComponent(topMaskSvg)}')`;
 * const encodedBottomMask = `url('data:image/svg+xml,${encodeURIComponent(bottomMaskSvg)}')`;
 * </script>
 */
