import { AtprotoAccessor } from '../atproto/atproto-client'

export class AtprotoClientProvider {
  private readonly atprotoClient: AtprotoAccessor

  constructor(atprotoClient: AtprotoAccessor) {
    this.atprotoClient = atprotoClient
  }

  get = () => this.atprotoClient
}
