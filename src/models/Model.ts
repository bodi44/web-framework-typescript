import { Callback } from './Eventing';
import { AxiosPromise, AxiosResponse } from 'axios';
import { HasId } from './Sync';

export interface ModelAttributes<T> {
  get<K extends keyof T>(key: K): T[K]

  set(value: T): void

  getAll(): T
}

interface ApiSync<T> {
  fetch(id: number): AxiosPromise

  save(data: T): AxiosPromise
}

interface Events {
  on(eventName: string, callback: Callback): void

  trigger(eventName: string): void
}

export class Model<T extends HasId> {
  constructor(
    private attributes: ModelAttributes<T>,
    private events: Events,
    private sync: ApiSync<T>,
  ) {
  }

  get on() {
    return this.events.on;
  }

  get trigger() {
    return this.events.trigger;
  }

  get get() {
    return this.attributes.get;
  }

  set(update: T): void {
    this.attributes.set(update);
    this.events.trigger('change');
  }

  fetch(): void {
    const id = this.attributes.get('id');

    if (typeof id !== 'number') {
      throw new Error('Cannot fetch without id');
    }

    this.sync.fetch(id)
      .then((resp: AxiosResponse): void => {
        this.set(resp.data);
      });
  }

  save(): void {
    this.sync.save(this.attributes.getAll())
      .then((resp: AxiosResponse) => {
        this.trigger('save');
      })
      .catch(() => {
        this.trigger('error');
      });
  }
}
