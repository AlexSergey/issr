type IState = Record<string, unknown>;
export declare const isBackend: () => boolean;
export declare const isClient: () => boolean;
export declare const clone: (state: IState) => Readonly<IState>;
export {};
