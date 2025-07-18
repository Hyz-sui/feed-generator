import { OutputSchema } from '../lexicon/types/app/bsky/feed/getFeedSkeleton';

import { AppContext } from "../config";

export interface Algo {
    get: (context: AppContext, params: any) => Promise<OutputSchema>
    shortname: string
}