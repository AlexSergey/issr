/**
 * @jest-environment node
 */
import { Effect, Statuses } from './effect';
import { EffectCollection } from './effect-collection';

const createEffect = (id: string, callback?: Promise<unknown>): Effect => {
  const effect = new Effect({ id });

  if (callback) {
    effect.addCallback(callback);
  }

  return effect;
};

describe('EffectCollection tests', () => {
  test('stores effects by id', () => {
    const collection = new EffectCollection();
    const effect = createEffect('effect-0');

    expect(collection.hasEffect('effect-0')).toBe(false);
    expect(collection.getEffect('effect-0')).toBeUndefined();

    collection.addEffect(effect);

    expect(collection.hasEffect('effect-0')).toBe(true);
    expect(collection.getEffect('effect-0')).toBe(effect);
    expect(collection.getEffects()).toStrictEqual([effect]);
  });

  test('returns only waiting effects', () => {
    const collection = new EffectCollection();
    const waiting = createEffect('waiting');
    const done = createEffect('done');
    done.done();

    collection.addEffect(waiting);
    collection.addEffect(done);

    expect(collection.getWaited()).toStrictEqual([waiting]);
  });

  test('runEffects marks fulfilled effects as done and rejected as failed', async () => {
    const collection = new EffectCollection();
    const fulfilled = createEffect('fulfilled', Promise.resolve('ok'));
    const rejected = createEffect('rejected', Promise.reject(new Error('fail')));
    const withoutCallback = createEffect('without-callback');

    collection.addEffect(fulfilled);
    collection.addEffect(rejected);
    collection.addEffect(withoutCallback);

    await collection.runEffects();

    expect(fulfilled.getStatus()).toBe(Statuses.done);
    expect(rejected.getStatus()).toBe(Statuses.failed);
    expect(withoutCallback.getStatus()).toBe(Statuses.done);
    expect(collection.getWaited()).toStrictEqual([]);
  });

  test('runEffects does not run finished effects again', async () => {
    const collection = new EffectCollection();
    const effect = createEffect('effect-0', Promise.resolve());
    const getCallback = jest.spyOn(effect, 'getCallback');

    collection.addEffect(effect);

    await collection.runEffects();
    await collection.runEffects();

    expect(getCallback).toHaveBeenCalledTimes(1);
  });

  test('runEffects with no effects resolves', async () => {
    await expect(new EffectCollection().runEffects()).resolves.toBeUndefined();
  });
});
