import { AppContext } from "../../config";
import { Database } from "../../db";
import { Image } from "../../lexicon/types/app/bsky/embed/images";
import { Record } from "../../lexicon/types/app/bsky/feed/post";
import { CreateOp, DeleteOp } from "../../util/subscription";
import { Topic } from "../topic";

const regex = /[わワﾜ][たタﾀ][なナﾅ][れレﾚ]|((わたし|私)が恋人になれ)|(恋人になれる(わけ|訳|ワケ))|(じゃん(、)?(ムリムリ|むりむり|ﾑﾘﾑﾘ))|甘織|([^哀]|^)れな子([^守]|$)|王[塚塚]([^古]|$)|紗月さん|琴紗月|紫陽花さん|瀬名紫陽花|小柳香穂|ムリムリ進化論|れなコアラ|ひとよひとよに(人|ひと)見知り/

export class WatanareTopic implements Topic {
    constructor() { }

    handleCreation = (db: Database, creation: CreateOp<Record>[]): void => {
        const matches = creation.filter((creation) => this.isMatch(creation.author, creation.record))
        if (matches.length === 0) {
            return
        }
        db
            .insertInto('watanare_post')
            .values(matches.map((match) => ({
                uri: match.uri,
                cid: match.cid,
                indexedAt: new Date().toISOString(),
            })))
            .onConflict((oc) => oc.doNothing())
            .execute()
    }
    handleDeletion = (db: Database, deletion: DeleteOp[]): void => {
        db
            .deleteFrom('watanare_post')
            .where('uri', 'in', deletion.map((d) => d.uri))
            .execute()
    }

    private isMatch = (author: string, record: Record): boolean => {
        if (this.isTextMatch(record.text)) {
            return true
        }
        const images = record.embed?.images
        if (images instanceof Array) {
            for (const image of images) {
                if (typeof image !== 'object') {
                    continue
                }
                const alt = image.alt;
                if (typeof alt === 'string' && this.isTextMatch(alt)) {
                    return true
                }
            }
        }
        return false
    }
    private isTextMatch = (text: string): boolean => {
        return text.match(regex) !== null
    }
}
