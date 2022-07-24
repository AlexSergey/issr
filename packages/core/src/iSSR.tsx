import React, { createContext, useEffect, isValidElement, FunctionComponent } from 'react';
import EffectCollection from './EffectCollection';
import { isBackend, clone } from './utils';

export interface InitStateInterface {
  [key: string]: unknown;
}

export interface StateInterface {
  [key: string]: unknown;
}

interface OptionsInterface {
  onlyClient?: boolean;
}

interface ReturnCreateISSR extends FunctionComponent {
  getState: () => StateInterface;
  effectCollection: EffectCollection;
}

interface IssrContextInterface {
  isLoading: () => boolean;
  initState: InitStateInterface | Record<string, unknown>;
  effectCollection: EffectCollection;
  getState: () => StateInterface;
}

type ExcludeFn = (...args: unknown[]) => JSX.Element;

export const IssrContext = createContext<IssrContextInterface>({} as IssrContextInterface);

export const ExcludeSsr = ({ children }: { children: JSX.Element | ExcludeFn }): JSX.Element => (
  isBackend() ?
    null :
    (isValidElement(children) ?
      children :

      (typeof children === 'function' ?
        children() :
        null)
    )
);

const OnComplete = ({ loading, onLoad }): JSX.Element => {
  useEffect(() => {
    if (!isBackend() && loading) {
      setTimeout(() => onLoad(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const createSsr = (initState: InitStateInterface = {}, options: OptionsInterface = {}): ReturnCreateISSR => {
  const app = {
    loading: options.onlyClient ? false : !isBackend(),
    state: initState
  };
  const effectCollection = new EffectCollection();

  const onLoad = (state): void => {
    app.loading = state;
  };

  const isLoading = (): boolean => app.loading;

  const getState = (): StateInterface => clone(app.state);

  const iSSR = ({ children }): JSX.Element => (
    <IssrContext.Provider value={{
      isLoading,
      initState,
      effectCollection,
      getState
    }}
    >
      {children}
      <OnComplete
        loading={app.loading}
        onLoad={onLoad}
      />
    </IssrContext.Provider>
  );

  iSSR.getState = getState;
  iSSR.effectCollection = effectCollection;

  return iSSR;
};

export default createSsr;
