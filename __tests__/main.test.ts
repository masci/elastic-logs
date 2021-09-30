import * as process from 'process'
import {run} from '../src/run'
import * as gh from '../src/github'
import {anything, spy, when, verify, capture} from 'ts-mockito'

describe('Test config params', () => {
  beforeEach(() => {
    process.env['INPUT_REPO-TOKEN'] = 'qwerty'
  })

  afterEach(() => {})

  test('Process job-names param', async () => {
    process.env['INPUT_JOB-NAMES'] = 'foo, bar, baz, foo bar baz'

    const spiedGH = spy(gh)
    when(
      spiedGH.fetchJobs(anything(), anything(), anything(), anything())
    ).thenResolve([]) // resolve with an empty array to avoid the subsequent API call

    await run()

    const [, , , allowList] = capture(spiedGH.fetchJobs).last()
    expect(allowList).toEqual(['foo', 'bar', 'baz', 'foo bar baz'])
  })
})
