import * as core from '@actions/core'
import * as gh from '../src/github'
import * as process from 'process'
import {HttpClient} from '@actions/http-client'

export async function run(): Promise<void> {
  // retrieve config params
  const repoToken: string = core.getInput('repo-token', {required: true})
  const jobNames: string[] = (
    core.getInput('job-names', {required: false}) || ''
  ).split(',')

  // get an authenticated HTTP client for the GitHub API
  const client: HttpClient = gh.getClient(repoToken)
  // get all the jobs for the current workflow
  const workflowId: string = process.env['GITHUB_RUN_ID'] || ''
  const repo: string = process.env['GITHUB_REPOSITORY'] || ''
  const jobs: gh.Job[] = await gh.fetchJobs(client, repo, workflowId, jobNames)
  // get the logs
  for (const j of jobs) {
    const lines: string[] = await gh.fetchLogs(client, repo, j)
    core.debug(`Fetched ${lines.length} lines for job ${j.name}`)
  }
}
