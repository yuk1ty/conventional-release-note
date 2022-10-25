import {CategorizedSummary} from './classifier'
import * as IO from 'fp-ts/IO'
import * as Array from 'fp-ts/Array'
import {pipe} from 'fp-ts/lib/function'

type Doc = {
  title: string
  content: string
}

export const generateDoc = (source: CategorizedSummary) => {
  return pipe(
    IO.Do,
    IO.bind('feat', () =>
      IO.of({
        title: 'Features',
        content: source.feat.map(s => `* ${s}`).join('\n')
      })
    ),
    IO.bind('fix', () =>
      IO.of({
        title: 'Bug Fixes',
        content: source.fix.map(s => `* ${s}`).join('\n')
      })
    ),
    IO.chain(({feat, fix}) => IO.of([feat, fix]))
  )
}

export const generateReleaseNote = (source: Doc[]) => {
  return IO.of(
    Array.reduce('', (acc: string, cur: Doc) => {
      const block = `## ${cur.title}\n${cur.content}`
      return acc + block
    })(source)
  )
}
