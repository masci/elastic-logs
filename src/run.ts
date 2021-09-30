import * as core from '@actions/core'
import * as gh from './github'
import * as process from 'process'
import {HttpClient} from '@actions/http-client'

export async function run(): Promise<void> {
  try {
    // retrieve config params
    const repoToken: string = core.getInput('repo-token', {required: true})
    const jobNames: string = core.getInput('job-names', {required: false}) || ''
    let allowList: string[] = []
    if (jobNames !== '') {
      allowList = jobNames.split(',')
      // trim job names
      allowList = allowList.map(s => s.trim())
    }

    // get an authenticated HTTP client for the GitHub API
    const client: HttpClient = gh.getClient(repoToken)
    // get all the jobs for the current workflow
    const workflowId: string = process.env['GITHUB_RUN_ID'] || ''
    const repo: string = process.env['GITHUB_REPOSITORY'] || ''
    core.debug(`Allow listing ${allowList.length} jobs in repo ${repo}`)
    const jobs: gh.Job[] = await gh.fetchJobs(
      client,
      repo,
      workflowId,
      allowList
    )
    // get the logs
    core.debug(`Getting logs for ${jobs.length} jobs`)
    for (const j of jobs) {
      const lines: string[] = await gh.fetchLogs(client, repo, j)
      core.debug(`Fetched ${lines.length} lines for job ${j.name}`)
    }
  } catch (e) {
    core.setFailed(`Run failed: ${e}`)
  }
}