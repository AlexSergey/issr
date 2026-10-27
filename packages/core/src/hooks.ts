import {
  DependencyList,
  Dispatch,
  EffectCallback,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Effect } from './effect';
import { IssrContext, IssrScopeContext } from './i-ssr';
import { isBackend } from './utils';

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as null | PromiseLike<unknown>)?.then === 'function';

const isSameDeps = (prev: DependencyList, next: DependencyList): boolean =>
  prev.length === next.length && prev.every((dep, i) => Object.is(dep, next[i]));

// Prefixes the id with the closest SsrScope, so one component rendered several times gets unique ids
const useScopedId = (id: string): string => {
  const scope = useContext(IssrScopeContext);

  return scope ? `${scope}:${id}` : id;
};

export const useSsrState = <S>(initialState: (() => S) | S, id?: string): [S, Dispatch<SetStateAction<S>>] => {
  if (typeof id !== 'string') {
    throw new Error(
      '"useSsrState" hook: id is not a string. iSSR required @issr/babel-loader. You can follow official documentation to setup your build system https://github.com/AlexSergey/issr#usage',
    );
  }
  const { initState } = useContext(IssrContext);
  const key = useScopedId(id);

  const appStateFragment: S = useMemo<S>(
    () => (typeof initState[key] === 'undefined' ? initialState : initState[key]) as S,
    [initState, key, initialState],
  );
  const [state, setState] = useState<S>(appStateFragment);
  // Source of truth for functional updates: initState[key] may be absent (initial value came from the hook argument)
  const stateRef = useRef<S>(state);

  const modifiedSetState = useCallback(
    (innerState: ((prevState: S) => S) | S) => {
      const s = innerState instanceof Function ? innerState(stateRef.current) : innerState;
      stateRef.current = s;
      initState[key] = s;

      setState(s);
    },
    [initState, key],
  );

  useEffect(
    () => (): void => {
      // Clear Global state when component was unmounted
      initState[key] = undefined;
      delete initState[key];
    },
    [initState, key],
  );

  return [state, modifiedSetState];
};

export const useSsrEffect = (effect: EffectCallback, deps?: DependencyList | string, id?: string): void => {
  const effectId = Array.isArray(deps) ? id : typeof deps === 'string' ? deps : false;

  if (typeof effectId !== 'string') {
    throw new Error(
      '"useSsrEffect" hook: id is not a string. iSSR required @issr/babel-loader. You can follow official documentation to setup your build system https://github.com/AlexSergey/issr#usage',
    );
  }

  const key = useScopedId(effectId);
  const cb = useRef(effect);
  const { getEffectCalledState, isLoading, setEffectCalledState } = useContext(IssrContext);
  const allDeps = Array.isArray(deps) ? deps : [];
  // Deps of the first client render during hydration: the effect has already been called on the backend for them.
  // Captured once per component instance, so re-renders and StrictMode double renders do not change it
  const [hydrationDeps] = useState<DependencyList | null>(() => (!isBackend() && isLoading() ? allDeps : null));
  const skipDeps = useRef(hydrationDeps);

  useEffect(() => {
    cb.current = effect;
  }, [effect]);

  // Effect on the backend side must run synchronously
  if (isBackend() && !getEffectCalledState(key)) {
    effect();
    setEffectCalledState(key);
  }

  useEffect(() => {
    // First call after hydration must be skipped on the client side, until deps change
    if (skipDeps.current) {
      if (isSameDeps(skipDeps.current, allDeps)) {
        return;
      }
      skipDeps.current = null;
    }

    return cb.current();
  }, allDeps);
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
  const key = useScopedId(id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ArgumentsType extends any[], ReturnType>(
    cb: (...args: ArgumentsType) => ReturnType,
    ...args: ArgumentsType
  ): ReturnType => {
    const res = cb(...args);

    if (!effectCollection.getEffect(key)) {
      const effect = new Effect({ id: key });
      effectCollection.addEffect(effect);

      if (isThenable(res)) {
        effect.addCallback(res);
      }
    }

    return res;
  };
};
