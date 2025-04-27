import { JSX } from 'react';
import { PipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { IInitState } from './i-ssr';
interface IServerRenderOptions<T> {
    cachedState?: IInitState;
    outsideEffects?: T;
    streamOptions?: RenderToPipeableStreamOptions;
    streamOptionsFn?: (state: IState) => RenderToPipeableStreamOptions;
}
interface IServerRenderResultStream {
    state: IState;
    stream: PipeableStream;
}
interface IServerRenderResultString {
    html: string;
    state: IState;
}
type IState = Record<string, unknown>;
export declare const serverRender: {
    stream: <T extends Function>(iteration: (count?: number) => JSX.Element, opts?: IServerRenderOptions<T>) => Promise<IServerRenderResultStream>;
    string: <T extends Function>(iteration: (count?: number) => JSX.Element, opts?: IServerRenderOptions<T>) => Promise<IServerRenderResultString>;
};
export {};
