interface IState {
  [key: string]: unknown;
}

export const isBackend = (): boolean => typeof window === 'undefined';

export const isClient = (): boolean => !isBackend();

export const clone = (state: IState): Readonly<IState> => JSON.parse(JSON.stringify(state));
