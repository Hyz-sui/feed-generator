import { Database } from "../db";
import { Record } from "../lexicon/types/app/bsky/feed/post";
import { CreateOp, DeleteOp } from "../util/subscription";

export interface Topic {
    handleCreation: (db: Database, creation: CreateOp<Record>[]) => void
    handleDeletion: (db: Database, deletion: DeleteOp[]) => void
}
