import { DependencyList, Dispatch, EffectCallback, SetStateAction } from 'react';
export declare const useSsrState: <S>(initialState: (() => S) | S, id?: string) => [S, Dispatch<SetStateAction<S>>];
export declare const useSsrEffect: (effect: EffectCallback, deps?: DependencyList | string, id?: string) => void;
export declare const useRegisterEffect: (id?: string) => (<ArgumentsType extends any[], ReturnType>(cb: (...args: ArgumentsType) => ReturnType, ...args: ArgumentsType) => ReturnType);
