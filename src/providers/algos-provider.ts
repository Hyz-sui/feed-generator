import { Algo } from '../algos/algo'
import { WatanareTimelineAlgo } from '../algos/watanare-timeline-algo'

export class AlgosProvider {
  private readonly algos: Algo[]
  constructor(algos: Algo[]) {
    this.algos = algos
  }

  get = (): Algo[] => this.algos
}
