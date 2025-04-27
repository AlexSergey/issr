import { Effect } from './effect';
export declare class EffectCollection {
    private effects;
    constructor();
    addEffect: (effect: Effect) => void;
    getEffect: (effectId: string) => Effect | undefined;
    getEffects: () => Effect[];
    getWaited: () => Effect[];
    hasEffect: (effectId: string) => boolean;
    runEffects: () => Promise<void>;
}
