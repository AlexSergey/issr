import { createContext, FunctionComponent, isValidElement, JSX, useEffect } from 'react';

import { EffectCollection } from './effect-collection';
import { clone, isBackend } from './utils';

export type IInitState = Record<string, unknown>;

export type IState = Record<string, unknown>;

interface IOptions {
  onlyClient?: boolean;
}

interface IReturnCreateIssr<P> extends FunctionComponent<P> {
  effectCollection: EffectCollection;
  getState: () => IState;
}

interface IIssrContext {
  effectCollection: EffectCollection;
  getEffectCalledState: (id: string) => boolean;
  getState: () => IState;
  initState: IInitState | Record<string, unknown>;
  isLoading: () => boolean;
  setEffectCalledState: (id: string) => void;
}

type ExcludeFn = (...args: unknown[]) => JSX.Element;

export const IssrContext = createContext<IIssrContext>({} as IIssrContext);

export const ExcludeSsr = ({ children }: { children: ExcludeFn | JSX.Element }): JSX.Element | null => {
  if (isBackend()) {
    return null;
  }
  if (isValidElement(children)) {
    return children;
  }
  if (typeof children === 'function') {
    return children();
  }

  return null;
};

interface IOnComplete {
  loading: boolean;
  onLoad: (loading: boolean) => void;
}

const OnComplete = ({ loading, onLoad }: IOnComplete): JSX.Element | null => {
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
): IReturnCreateIssr<{ children: JSX.Element }> => {
  const app: IApp = {
    calledState: {},
    loading: options.onlyClient ? false : !isBackend(),
    state: initState,
  };

  const setEffectCalledState = (id: string): void => {
    if (!app.calledState[id]) {
      app.calledState[id] = true;
    }
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

  const iSSR = ({ children }: { children: JSX.Element }): JSX.Element => (
    <IssrContext.Provider
      value={{
        effectCollection,
        getEffectCalledState,
        getState,
        initState,
        isLoading,
        setEffectCalledState,
      }}
    >
      {children}
      <OnComplete loading={app.loading} onLoad={onLoad} />
    </IssrContext.Provider>
  );

  iSSR.getState = getState;
  iSSR.effectCollection = effectCollection;

  return iSSR;
};
