import * as process from 'process'
import {run} from '../src/run'
import * as gh from '../src/github'
import {anything, spy, when, verify, capture} from 'ts-mockito'

const spiedGH = spy(gh)

describe('Test config params', () => {
  beforeEach(() => {
    process.env['INPUT_REPO-TOKEN'] = 'qwerty'
    when(
      spiedGH.fetchJobs(anything(), anything(), anything(), anything())
    ).thenResolve([]) // resolve with an empty array to avoid the subsequent API call
  })

  afterEach(() => {})

  test('Process job-names param', async () => {
    // configure
    process.env['INPUT_JOB-NAMES'] = 'foo, bar, baz, foo bar baz'
    // run
    await run()
    // assert
    const [, , , allowList] = capture(spiedGH.fetchJobs).last()
    expect(allowList).toEqual(['foo', 'bar', 'baz', 'foo bar baz'])
  })

  test('Missing Elastic config params', async () => {
    // run
    try {
      await run()
    } catch (e) {
      expect(String(e)).toBe(
        'invalid configuration: please set either cloud-id or addresses'
      )
    }
  })
})
