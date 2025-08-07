import { Database } from '.'

// 抽象化。Databaseから拾いたいものが増えたら増やしていい
export type MinifiedDb = Pick<
  Database,
  'insertInto' | 'deleteFrom' | 'selectFrom' | 'updateTable'
> & { isDatabase: boolean; schema: MinifiedSchema }

export const isMinifiedDb = (obj: unknown): obj is MinifiedDb =>
  obj !== null &&
  typeof obj === 'object' &&
  'schema' in obj &&
  'insertInto' in obj &&
  'deleteFrom' in obj &&
  'selectFrom' in obj &&
  'updateTable' in obj && 
  'isDatabase' in obj &&
  isMinifiedSchema(obj.schema)

export type MinifiedSchema = Pick<
  Database['schema'],
  'createTable' | 'dropTable'
>
export const isMinifiedSchema = (obj: unknown): obj is MinifiedSchema =>
  obj !== null &&
  typeof obj === 'object' &&
  'createTable' in obj &&
  'dropTable' in obj
