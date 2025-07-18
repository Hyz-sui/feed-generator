import { Algo } from "../algos/algo";
import { WatanareTimelineAlgo } from "../algos/watanare-timeline-algo";

const algos: Algo[] = [new WatanareTimelineAlgo()]

export class AlgosProvider {
    get = (): Algo[] => algos
}
