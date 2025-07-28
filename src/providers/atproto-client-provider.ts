import { AtprotoClient } from '../atproto/atproto-client'

export class AtprotoClientProvider {
  private readonly atprotoClient: AtprotoClient

  constructor(atprotoClient: AtprotoClient) {
    this.atprotoClient = atprotoClient
  }

  get = () => this.atprotoClient
}
