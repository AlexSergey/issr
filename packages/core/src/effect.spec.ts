/**
 * @jest-environment node
 */
import { Effect, Statuses } from './effect';

describe('Effect tests', () => {
  test('is created in the wait status', () => {
    const effect = new Effect({ id: 'effect-0' });

    expect(effect.getId()).toBe('effect-0');
    expect(effect.getStatus()).toBe(Statuses.wait);
    expect(effect.getCallback()).toBeUndefined();
  });

  test('changes status', () => {
    const done = new Effect({ id: 'done' });
    const failed = new Effect({ id: 'failed' });

    done.done();
    failed.failed();

    expect(done.getStatus()).toBe(Statuses.done);
    expect(failed.getStatus()).toBe(Statuses.failed);
  });

  test('accepts a callback only while waiting', () => {
    const effect = new Effect({ id: 'effect-0' });
    const first = Promise.resolve(1);
    const second = Promise.resolve(2);

    effect.addCallback(first);
    expect(effect.getCallback()).toBe(first);

    effect.done();
    effect.addCallback(second);
    expect(effect.getCallback()).toBe(first);
  });
});
