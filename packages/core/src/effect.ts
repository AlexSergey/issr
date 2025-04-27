export enum Statuses {
  done = 'done',
  failed = 'failed',
  wait = 'wait',
}

interface IEffectOptions {
  id: string;
}

class Effect {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callback?: any;

  private readonly id: string;

  private status: Statuses;

  constructor({ id }: IEffectOptions) {
    this.id = id;
    this.status = Statuses.wait;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCallback(cb: any): void {
    if (this.status === Statuses.wait) {
      this.callback = cb;
    }
  }

  done = (): void => {
    this.status = Statuses.done;
  };

  failed = (): void => {
    this.status = Statuses.failed;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCallback = (): any => this.callback;

  getId = (): string => this.id;

  getStatus = (): Statuses => this.status;
}

export { Effect };
