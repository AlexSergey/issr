export declare enum Statuses {
    done = "done",
    failed = "failed",
    wait = "wait"
}
interface IEffectOptions {
    id: string;
}
declare class Effect {
    private callback?;
    private readonly id;
    private status;
    constructor({ id }: IEffectOptions);
    addCallback(cb: any): void;
    done: () => void;
    failed: () => void;
    getCallback: () => any;
    getId: () => string;
    getStatus: () => Statuses;
}
export { Effect };
