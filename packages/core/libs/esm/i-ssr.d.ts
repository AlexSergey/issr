import { FunctionComponent, JSX } from 'react';
import { EffectCollection } from './effect-collection';
export type IInitState = Record<string, unknown>;
export type IState = Record<string, unknown>;
type ExcludeFn = (...args: unknown[]) => JSX.Element;
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
export declare const IssrContext: import("react").Context<IIssrContext>;
export declare const ExcludeSsr: ({ children }: {
    children: ExcludeFn | JSX.Element;
}) => JSX.Element | null;
export declare const createSsr: (initState?: IInitState, options?: IOptions) => IReturnCreateIssr<{
    children: JSX.Element;
}>;
export {};
