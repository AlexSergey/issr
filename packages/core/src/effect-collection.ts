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
    const results = await Promise.allSettled(waited.map((effect) => effect.getCallback()));

    waited.forEach((effect, num) => {
      if (results[num]?.status === 'rejected') {
        effect.failed();
      } else {
        effect.done();
      }
    });
  };
}
