  export function secureAB(): 'A' | 'B' {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
      const arr = new Uint32Array(1);
      globalThis.crypto.getRandomValues(arr);
      return arr[0] % 2 === 0 ? 'A' : 'B';
    }
    return Math.random() < 0.5 ? 'A' : 'B';
  }
