import { createContext, useEffect, isValidElement, FunctionComponent } from 'react';

import { EffectCollection } from './effect-collection';
import { isBackend, clone } from './utils';

export interface IInitState {
  [key: string]: unknown;
}

export interface IState {
  [key: string]: unknown;
}

interface IOptions {
  onlyClient?: boolean;
}

interface IReturnCreateIssr<P> extends FunctionComponent<P> {
  getState: () => IState;
  effectCollection: EffectCollection;
}

interface IIssrContext {
  isLoading: () => boolean;
  initState: IInitState | Record<string, unknown>;
  effectCollection: EffectCollection;
  getState: () => IState;
  setEffectCalledState: (id: string) => void;
  getEffectCalledState: (id: string) => boolean;
}

type ExcludeFn = (...args: unknown[]) => JSX.Element;

export const IssrContext = createContext<IIssrContext>({} as IIssrContext);

export const ExcludeSsr = ({ children }: { children: JSX.Element | ExcludeFn }): JSX.Element | null => {
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
  loading: boolean;
  calledState: {
    [key: string]: boolean;
  };
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
