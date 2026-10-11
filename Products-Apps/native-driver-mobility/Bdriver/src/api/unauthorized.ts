type Listener = () => void;

const listeners = new Set<Listener>();

export function emitUnauthorized() {
  for (const listener of listeners) listener();
}

export function addUnauthorizedListener(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
