import { Effect, Statuses } from './effect';

export class EffectCollection {
  private effects: Map<string, Effect>;

  constructor() {
    this.effects = new Map();
  }

  addEffect = (effect: Effect): void => {
    this.effects.set(effect.getId(), effect);
  };

  getEffect = (effectId: string): Effect | undefined => this.effects.get(effectId);

  getEffects = (): Effect[] => Array.from(this.effects.values());

  getWaited = (): Effect[] => {
    const effects = this.getEffects();

    return effects.filter((effect) => effect.getStatus() === Statuses.wait);
  };

  hasEffect = (effectId: string): boolean => Boolean(this.effects.get(effectId));

  runEffects = async (): Promise<void> => {
    const waited = this.getWaited();

    if (waited.length > 0) {
      const results = await Promise.allSettled(waited.map((effect) => effect.getCallback()));

      results.forEach((result, num) => {
        const effect = waited[num];

        if (result.status === 'fulfilled') {
          if (effect) {
            effect.done();
          }
        }

        if (result.status === 'rejected') {
          if (effect) {
            effect.failed();
          }
        }
      });
    }
  };
}
