import {HttpClient, HttpClientResponse} from '@actions/http-client'

const githubAPIUrl = 'https://api.github.com'

export interface Job {
  id: number
  name: string
}

export function getClient(ghToken: string): HttpClient {
  return new HttpClient('gh-http-client', [], {
    headers: {
      Authorization: ghToken,
      'Content-Type': 'application/json'
    }
  })
}

export async function fetchJobs(
  httpClient: HttpClient,
  org: string,
  repoName: string,
  runId: string
): Promise<Job[]> {
  const url = `${githubAPIUrl}/repos/${org}/${repoName}/actions/runs/${runId}/jobs`
  const res: HttpClientResponse = await httpClient.get(url)

  if (res.message.statusCode === undefined || res.message.statusCode >= 400) {
    throw new Error(`HTTP request failed: ${res.message.statusMessage}`)
  }

  const body: string = await res.readBody()
  const jobs: Job[] = []
  for (const j of JSON.parse(body).jobs) {
    jobs.push({
      id: j.id,
      name: j.name
    })
  }

  return jobs
}