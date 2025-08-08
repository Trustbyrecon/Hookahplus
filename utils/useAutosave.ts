import { useEffect, useRef } from 'react';

export default function useAutosave<T>(value: T, onSave: (value: T) => void, delay = 2000) {
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      onSave(value);
    }, delay);

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [value, onSave, delay]);
}
