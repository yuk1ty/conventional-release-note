import * as Array from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as Writer from 'fp-ts/Writer'
import {pipe} from 'fp-ts/lib/function'

import {CategorizedSummary} from './classifier'

type Doc = {
  title: string
  content: string
}

const appendIfNeeded = (appender: string[], title: string): Doc[] => {
  if (appender.length !== 0) {
    return [
      {
        title,
        content: appender.map(s => `* ${s}`).join('\n')
      }
    ]
  } else {
    return []
  }
}

const w = Writer.getChain<Doc[]>(Array.getMonoid())

export const generateDoc = (
  source: CategorizedSummary
): TE.TaskEither<Error, Doc[]> => {
  return pipe(
    Writer.tell(appendIfNeeded(source.feat, 'Features')),
    writer =>
      w.chain(writer, () =>
        Writer.tell(appendIfNeeded(source.fix, 'Bug Fixes'))
      ),
    writer => Writer.execute(writer),
    docs => TE.of(docs)
  )
}

export const generateReleaseNote = (
  source: Doc[]
): TE.TaskEither<Error, string> => {
  return TE.of(
    Array.reduce('', (acc: string, cur: Doc) => {
      const block = `## ${cur.title}\n${cur.content}\n`
      return acc + block
    })(source)
  )
}
