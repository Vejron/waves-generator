/**
 * Inverts an SVG mask path by flipping it vertically and horizontally
 * Used to generate the bottom mask from the top mask for ASection component
 * 
 * @param svgString - The complete SVG string including <svg> tags
 * @param viewBoxHeight - The height value from the viewBox (e.g., 100)
 * @returns The inverted SVG string
 */
export function invertSvgMask(svgString: string, viewBoxHeight: number = 100): string {
  // Extract the path element
  const pathMatch = svgString.match(/<path\s+d="([^"]+)"/);
  if (!pathMatch || !pathMatch[1]) {
    console.warn('No path found in SVG');
    return svgString;
  }

  const originalPath = pathMatch[1];
  const invertedPath = invertSvgPath(originalPath, viewBoxHeight);

  // Replace the path in the original SVG with the inverted one
  const invertedSvg = svgString.replace(
    /d="[^"]+"/,
    `d="${invertedPath}"`
  );

  return invertedSvg;
}

/**
 * Wraps a baseline-closed wave path so it encloses the area above the curve.
 * Assumes the path starts at the bottom-left corner and closes along the bottom edge.
 */
export function enclosePathAbove(
  pathData: string,
  viewBoxWidth: number = 1000,
  viewBoxHeight: number = 100
): string {
  const trimmed = pathData.trim();
  if (!trimmed) {
    return pathData;
  }

    const startPattern = new RegExp(`^M0,${escapeNumber(viewBoxHeight)}(\\s?)`);
  let result = trimmed;

  if (startPattern.test(result)) {
    result = result.replace(startPattern, `M0,0 L0,${viewBoxHeight}$1`);
  } else {
    console.warn('Path start does not match expected bottom baseline; prefixing manually.');
    result = `M0,0 L0,${viewBoxHeight} ${result}`;
  }

  const endPattern = new RegExp(
    `L${escapeNumber(viewBoxWidth)},${escapeNumber(viewBoxHeight)}\\s*L0,${escapeNumber(viewBoxHeight)}\\s*Z$`
  );
  const alreadyClosedPattern = new RegExp(`L\\s*${escapeNumber(viewBoxWidth)},0\\s*Z$`, 'i');

  if (endPattern.test(result)) {
    result = result.replace(endPattern, `L${viewBoxWidth},0 Z`);
  } else if (!alreadyClosedPattern.test(result)) {
    result = `${result} L${viewBoxWidth},0 Z`;
  }

  return result;
}

function escapeNumber(value: number): string {
  return value.toString().replace(/\./g, '\\.');
}

/**
 * Inverts an SVG path by flipping it vertically
 * 
 * @param pathData - The d attribute value of the path
 * @param viewBoxHeight - The height of the viewBox for vertical flip
 * @returns The inverted path string
 */
function invertSvgPath(pathData: string, viewBoxHeight: number): string {
  // Split the path into commands
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  
  if (commands.length === 0) return pathData;

  // Process and invert each command
  const invertedCommands = commands.map(command => {
    const type = command[0];
    const args = command.slice(1).trim();

    // Parse numbers from the command arguments
    const numbers = (args.match(/-?\d+\.?\d*([eE]-?\d+)?/g) || []).map(Number);

    if (!numbers.length) {
      return command; // Return unchanged if no numbers
    }

    // Invert Y coordinates based on command type
    const invertedNumbers = invertCommandNumbers(type as unknown as string, numbers, viewBoxHeight);
    
    return type + invertedNumbers.join(',');
  });

  // Reverse the order of commands to flip horizontally
  // But keep the first point relative to the viewBox width
  return reversePathCommands(invertedCommands.join(' '), viewBoxHeight);
}

/**
 * Inverts Y coordinates in command arguments
 */
function invertCommandNumbers(type: string, numbers: number[], height: number): number[] {
  // Relative commands (lowercase) don't need inversion
  if (type === type.toLowerCase() && type !== 'z') {
    // For relative commands, only certain positions contain Y values
    // This varies by command type, so we'll process carefully
    switch (type) {
      case 'h': // Horizontal line - no Y value
        return numbers;
      case 'v': // Vertical line - invert the Y value
        return numbers.map(n => -n);
      case 'm':
      case 'l': // Move/Line - every other value is Y
      case 't': // Smooth quadratic - every other is Y
        return numbers.map((n, i) => (i % 2 === 1 ? -n : n));
      case 'c': // Cubic bezier - Y values at indices 1, 3, 5
        return numbers.map((n, i) => {
          if (i % 2 === 1) return -n;
          return n;
        });
      case 's': // Smooth cubic - Y values at indices 1, 3
      case 'q': // Quadratic - Y values at indices 1, 3
        return numbers.map((n, i) => (i % 2 === 1 ? -n : n));
      default:
        return numbers;
    }
  }

  // Absolute commands - invert Y coordinates
  switch (type.toLowerCase()) {
    case 'h': // Horizontal line - no Y value
      return numbers;
    case 'v': // Vertical line - invert Y
      return numbers.map(n => height - n);
    case 'm':
    case 'l': // Move/Line - pairs of (x, y)
    case 't': // Smooth quadratic
      return numbers.map((n, i) => (i % 2 === 1 ? height - n : n));
    case 'c': // Cubic bezier
      return numbers.map((n, i) => (i % 2 === 1 ? height - n : n));
    case 's': // Smooth cubic
    case 'q': // Quadratic
      return numbers.map((n, i) => (i % 2 === 1 ? height - n : n));
    case 'a': // Arc - Y values at indices 1, 5 (but flags at 3, 4)
      return numbers.map((n, i) => {
        if (i === 1 || (i > 4 && (i - 5) % 6 === 1)) return height - n;
        return n;
      });
    case 'z':
      return numbers;
    default:
      return numbers;
  }
}

/**
 * Reverses the path direction and horizontally flips it
 */
function reversePathCommands(pathData: string, viewBoxWidth: number = 1000): string {
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
  
  if (commands.length === 0) return pathData;

  // Reverse commands
  const reversed = commands.reverse();
  
  // Invert X coordinates and adjust for width
  const flipped = reversed.map(command => {
    const type = command[0];
    const args = command.slice(1).trim();
    const numbers = (args.match(/-?\d+\.?\d*([eE]-?\d+)?/g) || []).map(Number);

    if (!numbers.length) return command;

    const flippedNumbers = flipXCoordinates(type as unknown as string, numbers, viewBoxWidth);
    return type + flippedNumbers.join(',');
  });

  return flipped.join(' ');
}

/**
 * Flips X coordinates horizontally
 */
function flipXCoordinates(type: string, numbers: number[], width: number): number[] {
  const isRelative = type === type.toLowerCase() && type !== 'z';

  if (isRelative) {
    // Relative commands - flip the X component
    switch (type) {
      case 'v': // Vertical - no X
        return numbers;
      case 'h': // Horizontal - flip X
        return numbers.map(n => -n);
      case 'm':
      case 'l':
      case 't':
        return numbers.map((n, i) => (i % 2 === 0 ? -n : n));
      case 'c':
      case 'q':
      case 's':
        return numbers.map((n, i) => (i % 2 === 0 ? -n : n));
      default:
        return numbers;
    }
  }

  // Absolute commands - mirror X coordinate
  switch (type.toLowerCase()) {
    case 'h':
      return numbers.map(n => width - n);
    case 'v':
      return numbers;
    case 'm':
    case 'l':
    case 't':
      return numbers.map((n, i) => (i % 2 === 0 ? width - n : n));
    case 'c':
    case 'q':
    case 's':
      return numbers.map((n, i) => (i % 2 === 0 ? width - n : n));
    case 'a':
      return numbers.map((n, i) => (i === 0 || i === 5 ? width - n : n));
    default:
      return numbers;
  }
}
