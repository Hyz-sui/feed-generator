import { Database } from '../db'
import { Record as Post } from '../lexicon/types/app/bsky/feed/post'
import { MinifiedDb } from '../db/minified-db'
import { CreateOp, DeleteOp } from '../util/subscription'

export interface Topic {
  handleCreation: (db: MinifiedDb, creation: CreateOp<Post>[]) => Promise<void>
  handleDeletion: (db: MinifiedDb, deletion: DeleteOp[]) => Promise<void>
}
