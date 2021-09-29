import {expect, test} from '@jest/globals'
import {Job, fetchJobs} from '../src/github'
import {HttpClient, HttpClientResponse} from '@actions/http-client'
import {IncomingMessage} from 'http'
import {mock, instance, when, anything, reset, capture} from 'ts-mockito'
import jobsJson from './jobs.json'

// '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'
// '1283143645'

let mockedHttpClient: HttpClient = mock(HttpClient)
let mockedResponse: HttpClientResponse = mock(HttpClientResponse)
let mockedMessage: IncomingMessage = mock(IncomingMessage)

describe('unit-tests', () => {
  beforeEach(() => {
    reset(mockedHttpClient)
    reset(mockedResponse)
    reset(mockedMessage)
  })

  afterEach(() => {})

  test('Retrieve the list of jobs', async () => {
    when(mockedMessage.statusCode).thenReturn(200)
    when(mockedResponse.message).thenReturn(instance(mockedMessage))
    when(mockedResponse.readBody()).thenResolve(JSON.stringify(jobsJson))
    when(mockedHttpClient.get(anything())).thenResolve(instance(mockedResponse))

    let jobs: Job[] = await fetchJobs(
      instance(mockedHttpClient),
      'masci',
      'foo',
      '123'
    )
    const expected: Job[] = [
      {
        id: 3734144061,
        name: 'test'
      },
      {
        id: 3734144148,
        name: 'e2e'
      }
    ]
    expect(jobs).toEqual(expected)

    // also verify the url used in the HTTP request (first param passed to get)
    const url = capture(mockedHttpClient.get).last()[0]
    expect(url).toEqual(
      'https://api.github.com/repos/masci/foo/actions/runs/123/jobs'
    )
  })

  test('Cannot retrieve the list of jobs', async () => {
    when(mockedMessage.statusCode).thenReturn(404)
    when(mockedMessage.statusMessage).thenReturn('foo has baz')
    when(mockedResponse.message).thenReturn(instance(mockedMessage))
    when(mockedHttpClient.get(anything())).thenResolve(instance(mockedResponse))

    try {
      await fetchJobs(instance(mockedHttpClient), 'masci', 'foo', '123')
    } catch (error) {
      expect(error.message).toMatch('HTTP request failed: foo has baz')
    }
  })
})
