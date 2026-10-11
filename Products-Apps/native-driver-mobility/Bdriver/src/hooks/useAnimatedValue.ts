import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useAnimatedValue<T extends number>(
  target: T,
  duration = 500,
  epsilon = 0.00001,
): T {
  const [value, setValue] = useState<T>(target);
  const frameRef = useRef<number | null>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      setValue(target);
      return;
    }
    if (Math.abs((target as number) - (value as number)) < epsilon) return;

    const from = value;
    const start = performance.now();
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    const step = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const next = (from as number) + ((target as number) - (from as number)) * eased;
      setValue(next as T);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [target, duration, epsilon, value]);

  return value;
}
