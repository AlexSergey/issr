import {
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
  EffectCallback,
  DependencyList,
  useCallback,
} from 'react';

import { Effect } from './effect';
import { IssrContext } from './i-ssr';
import { isBackend } from './utils';

export const useSsrState = <S>(initialState: S | (() => S), id?: string): [S, Dispatch<SetStateAction<S>>] => {
  if (typeof id !== 'string') {
    throw new Error(
      '"useSsrState" hook: id is not a string. iSSR required @issr/babel-loader. You can follow official documentation to setup your build system https://github.com/AlexSergey/issr#usage',
    );
  }
  const { initState } = useContext(IssrContext);

  const appStateFragment: S = useMemo<S>(
    () => (typeof initState[id] === 'undefined' ? initialState : initState[id]) as S,
    [initState, id, initialState],
  );
  const [state, setState] = useState<S>(appStateFragment);

  const modifiedSetState = useCallback((innerState: S | ((prevState: S) => S)) => {
    const s = innerState instanceof Function ? innerState(initState[id] as S) : innerState;
    initState[id] = s;

    setState(s);
  }, []);

  useEffect(
    () => (): void => {
      // Clear Global state when component was unmounted
      initState[id] = undefined;
      delete initState[id];
    },
    [],
  );

  return [state, modifiedSetState];
};

export const useSsrEffect = (effect: EffectCallback, deps?: DependencyList | string, id?: string): void => {
  // eslint-disable-next-line no-nested-ternary
  const effectId = Array.isArray(deps) ? id : typeof deps === 'string' ? deps : false;

  if (typeof effectId !== 'string') {
    throw new Error(
      '"useSsrEffect" hook: id is not a string. iSSR required @issr/babel-loader. You can follow official documentation to setup your build system https://github.com/AlexSergey/issr#usage',
    );
  }

  const initHook = useRef(true);
  const cb = useRef(effect);
  const { isLoading, setEffectCalledState, getEffectCalledState } = useContext(IssrContext);
  const isCalled = getEffectCalledState(effectId);
  const loading = isLoading();
  const isClient = !isBackend();
  const firstLoadingOnTheClient = isClient && loading && initHook.current;
  const firstLoadingOnTheBackend = isBackend() && initHook.current && !isCalled;
  initHook.current = false;
  const allDeps = Array.isArray(deps) ? deps : [];

  useEffect(() => {
    cb.current = effect;
  }, [effect]);

  // Effect on the backend side must run synchronously
  if (firstLoadingOnTheBackend) {
    effect();
    setEffectCalledState(effectId);
  }

  useEffect(() => {
    // First call after hydration must be skipped on the client side
    if (firstLoadingOnTheClient) {
      return;
    }
    // Already called in the backend side
    if (firstLoadingOnTheBackend) {
      return;
    }
    if (typeof cb.current === 'function') {
      // eslint-disable-next-line consistent-return
      return cb.current();
    }
  }, allDeps.concat([firstLoadingOnTheBackend, firstLoadingOnTheClient]));
};

export const useRegisterEffect = (
  id?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (<ArgumentsType extends any[], ReturnType>(
  cb: (...args: ArgumentsType) => ReturnType,
  ...args: ArgumentsType
) => ReturnType) => {
  if (typeof id !== 'string') {
    throw new Error(
      '"useRegisterEffect" hook: id is not a string. iSSR required @issr/babel-loader. You can follow official documentation to setup your build system https://github.com/AlexSergey/issr#usage',
    );
  }

  const { effectCollection } = useContext(IssrContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ArgumentsType extends any[], ReturnType>(
    cb: (...args: ArgumentsType) => ReturnType,
    ...args: ArgumentsType
  ): ReturnType => {
    const res = cb(...args);

    if (!effectCollection.getEffect(id)) {
      const effect = new Effect({ id });
      effectCollection.addEffect(effect);

      if (res instanceof Promise) {
        effect.addCallback(res);
      }
    }

    return res;
  };
};
