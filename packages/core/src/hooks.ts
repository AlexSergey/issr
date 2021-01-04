import { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { isBackend, getRandomID } from './utils';
import { IssrContext } from './iSSR';
import { Effect } from './Effect';

interface IssrState<T> {
  setState(componentState: T, skip?: boolean): void;
}

export const useSsrState = <T>(defaultValue: T, id?: string): [T, (componentState: T, skip?: boolean) => void] => {
  const key = typeof id === 'undefined' ?
    getRandomID() :
    id;

  const hook = useRef<false | IssrState<T>>(false);
  const { isLoading, initState } = useContext(IssrContext);
  const loading = isLoading();
  const loaded = !loading;
  const isClient = !isBackend();
  const hookIsNotReady = hook.current === false;
  const setImmediately = isClient && loaded && hookIsNotReady;

  if (
    setImmediately &&
    initState[key] &&
    process.env.NODE_ENV !== 'production'
  ) {
    // eslint-disable-next-line no-console
    console.warn(`Key should be unique! The key "${key}" is already exist in InitialState`);
  }

  const appStateFragment: T = useMemo<T>(
    () => (
      !initState[key] ?
        defaultValue :
        initState[key]
    ),
    [initState, key, defaultValue]
  );
  const [state, setState] = useState<T>(appStateFragment);

  useEffect(() => (): void => {
    // Clear Global state when component was unmounted
    initState[key] = undefined;
    delete initState[key];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hook.current) {
    hook.current = {
      setState: (componentState: T, skip?: boolean): void => {
        const s = typeof componentState === 'function' ? componentState(state) : componentState;
        initState[key] = s;

        if (!skip) {
          setState(s);
        }
      }
    };
  }

  return [state, hook.current.setState];
};

export const useSsrEffect = (cb?: Function, id?: string): void => {
  const effectId = (typeof cb === 'string' && typeof id === 'undefined') ?
    cb :
    typeof id === 'undefined' ?
      getRandomID() :
      id;

  const initHook = useRef(true);
  const { isLoading, effectCollection } = useContext(IssrContext);
  const loading = isLoading();
  const loaded = !loading;
  const isClient = !isBackend();
  const onLoadOnTheClient = isClient && loaded && initHook.current;
  const onLoadOnTheBackend = isBackend() && initHook.current;

  initHook.current = false;

  if (onLoadOnTheClient) {
    if (typeof cb === 'function') {
      cb();
    }
    // eslint-disable-next-line sonarjs/no-collapsible-if
  } else if (onLoadOnTheBackend) {
    if (!effectCollection.getEffect(effectId)) {
      const effect = new Effect({ id: effectId });
      effectCollection.addEffect(effect);

      if (typeof cb === 'function') {
        const res = cb();

        if (res instanceof Promise && effect instanceof Effect) {
          effect.addCallback(res);
        }
      }
    }
  }
};
