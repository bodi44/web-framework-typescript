import axios, { AxiosResponse } from 'axios';
import { User, UserProps } from './User';
import { Eventing } from './Eventing';

export class Collection<T, K> {
  models: User[] = [];
  events: Eventing = new Eventing();

  constructor(
    public rootUrl: string,
    public deserialize: (json: K) => T,
  ) {
  }

  get on() {
    return this.events.on;
  }

  get trigger() {
    return this.events.trigger;
  }

  fetch(): void {
    axios.get(this.rootUrl)
      .then((resp: AxiosResponse): void => {
        resp.data.forEach((value: UserProps): void => {
          const user = User.buildUser(value);
          this.models.push(user);
        });

        this.trigger('fetch');
      });
  }
}
