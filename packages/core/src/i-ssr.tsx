import { createContext, FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react';

import { EffectCollection } from './effect-collection';
import { clone, isBackend } from './utils';

export type IInitState = Record<string, unknown>;

export type IState = Record<string, unknown>;

type ExcludeFn = (...args: unknown[]) => ReactNode;

interface IIssrContext {
  effectCollection: EffectCollection;
  getEffectCalledState: (id: string) => boolean;
  getState: () => IState;
  initState: IInitState | Record<string, unknown>;
  isLoading: () => boolean;
  setEffectCalledState: (id: string) => void;
}

interface IOptions {
  onlyClient?: boolean;
}

interface IReturnCreateIssr<P> extends FunctionComponent<P> {
  effectCollection: EffectCollection;
  getState: () => IState;
}

export const IssrContext = createContext<IIssrContext>({} as IIssrContext);

export const IssrScopeContext = createContext<string>('');

export const SsrScope = ({ children, id }: { children: ReactNode; id: number | string }): ReactNode => {
  const parent = useContext(IssrScopeContext);

  return (
    <IssrScopeContext.Provider value={parent ? `${parent}/${id}` : String(id)}>{children}</IssrScopeContext.Provider>
  );
};

export const ExcludeSsr = ({ children }: { children: ExcludeFn | ReactNode }): null | ReactNode => {
  const { isLoading } = useContext(IssrContext);
  // The backend renders nothing here, so during hydration children appear only after mount to avoid a mismatch
  const [mounted, setMounted] = useState(() => !isBackend() && typeof isLoading === 'function' && !isLoading());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isBackend() || !mounted) {
    return null;
  }
  if (typeof children === 'function') {
    return children();
  }

  return children ?? null;
};

interface IOnComplete {
  loading: boolean;
  onLoad: (loading: boolean) => void;
}

const OnComplete = ({ loading, onLoad }: IOnComplete): null | ReactNode => {
  useEffect(() => {
    if (!isBackend() && loading) {
      setTimeout(() => onLoad(false));
    }
  }, []);

  return null;
};

interface IApp {
  calledState: Record<string, boolean>;
  loading: boolean;
  state: IInitState;
}

export const createSsr = (
  initState: IInitState = {},
  options: IOptions = {},
): IReturnCreateIssr<{ children: ReactNode }> => {
  const app: IApp = {
    calledState: {},
    loading: options.onlyClient ? false : !isBackend(),
    state: initState,
  };

  const setEffectCalledState = (id: string): void => {
    app.calledState[id] = true;
  };

  const getEffectCalledState = (id: string): boolean => {
    return Boolean(app.calledState[id]);
  };

  const effectCollection = new EffectCollection();

  const onLoad = (state: boolean): void => {
    app.loading = state;
  };

  const isLoading = (): boolean => app.loading;

  const getState = (): IState => clone(app.state);

  // Created once so context consumers do not re-render on every iSSR render
  const contextValue: IIssrContext = {
    effectCollection,
    getEffectCalledState,
    getState,
    initState,
    isLoading,
    setEffectCalledState,
  };

  const iSSR = ({ children }: { children: ReactNode }): ReactNode => (
    <IssrContext.Provider value={contextValue}>
      {children}
      <OnComplete loading={app.loading} onLoad={onLoad} />
    </IssrContext.Provider>
  );

  iSSR.getState = getState;
  iSSR.effectCollection = effectCollection;

  return iSSR;
};
