import { useCallback, useEffect, useState } from "react";

const ANCHOR_KEYS = ["Meta", "Alt"];
const FUNCTIONAL_KEYS = ["Home", "End", "PageUp", "PageDown"];

export const useKeyPress = (targetKey: string) => {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(true);
    },
    [targetKey],
  );
  const upHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) setKeyPressed(false);
    },
    [targetKey],
  );

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
};

export const useMultiKeyPress = () => {
  const [keysPressed, setKeyPressed] = useState<Set<string>>(new Set([]));
  const [timeStamp, setTimeStamp] = useState(0);

  const downHandler = useCallback(
    ({ key, timeStamp }: KeyboardEvent) => {
      setTimeStamp(timeStamp);

      if (FUNCTIONAL_KEYS.includes(key)) {
        setKeyPressed(new Set([key]));
        return;
      }
      if (!keysPressed.has(key) && keysPressed.size < 2) {
        setKeyPressed(keysPressed.add(key));
      } else {
        handleKeysDown({ key, keysPressed });
        setKeyPressed(keysPressed);
      }
    },
    [keysPressed],
  );

  const upHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      handleKeysUp({ key, keysPressed });
      setKeyPressed(keysPressed);
    },
    [keysPressed],
  );

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [downHandler, upHandler]);

  return {
    keysPressed,
    timeStamp,
  };
};

export const areKeysPressed = (
  keys: string[] = [],
  keysPressed: Set<string> = new Set([]),
) => {
  if (keys.length === 1) {
    return Array.from(keysPressed).pop() === keys[0];
  }

  const required = new Set(keys);
  keysPressed.forEach((element) => required.delete(element));
  return required.size === 0;
};

const handleKeysDown = ({
  key,
  keysPressed,
}: {
  key: string;
  keysPressed: Set<string>;
}) => {
  keysPressed.forEach((element) => {
    if (!ANCHOR_KEYS.includes(element) && key !== element)
      keysPressed.delete(element);
  });
  if (keysPressed.size < 2) keysPressed.add(key);
};

const handleKeysUp = ({
  key,
  keysPressed,
}: {
  key: string;
  keysPressed: Set<string>;
}) => {
  keysPressed.forEach((element) => {
    const isAnchor = ANCHOR_KEYS.includes(element);
    if (!isAnchor && key !== element) keysPressed.delete(element);
    if (isAnchor && key === element) keysPressed.delete(element);
  });
};
