import * as core from '@actions/core'
import {HttpClient} from '@actions/http-client'
import * as process from 'process'
import * as gh from './github'
import * as logs from './logs'

const defaultIndex = 'logs-generic-default'

// Split comma separated inputs into an array of trimmed values
export function getCommaSeparatedInput(value: string): string[] {
  let retVal: string[] = []
  if (value !== '') {
    retVal = value.split(',')
    // trim array items
    retVal = retVal.map(s => s.trim())
  }

  return retVal
}

export async function run(): Promise<void> {
  try {
    // retrieve config params

    // Github repo token
    const repoToken: string = core.getInput('repo-token', {required: true})
    // List of jobs to collect logs from (all jobs when empty)
    const jobNames: string = core.getInput('job-names', {required: false}) || ''
    const allowList = getCommaSeparatedInput(jobNames)
    // Elastic Cloud ID
    const cloudId: string = core.getInput('cloud-id', {required: false}) || ''
    // Elasticsearch addresses (when Cloud ID is not present)
    const addrValue: string =
      core.getInput('addresses', {required: false}) || ''
    const addresses = getCommaSeparatedInput(addrValue)
    // Elasticsearch index
    const indexName: string =
      core.getInput('index-name', {required: false}) || defaultIndex
    // Elasticsearch user
    const username: string = core.getInput('username', {required: false})
    // Elasticsearch pass
    const password: string = core.getInput('password', {required: false})

    // Ensure either Cloud ID or ES addresses are set
    if (cloudId === '' && addresses.length === 0) {
      throw new Error(
        'invalid configuration: please set either cloud-id or addresses'
      )
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

    // get a configured ES client
    const esClient = logs.getESClient(cloudId, addresses, username, password)

    // get the logs for each job
    core.debug(`Getting logs for ${jobs.length} jobs`)
    for (const j of jobs) {
      const lines: string[] = await gh.fetchLogs(client, repo, j)
      core.debug(`Fetched ${lines.length} lines for job ${j.name}`)

      const tmpfile = `./out-${j.id}.log`

      // convert logs to ECS and dump to disk
      logs.convert(lines, tmpfile)

      // bulk send to ES
      const result = await logs.bulkSend(esClient, indexName, tmpfile)
      core.debug(`Bulk request results: ${result}`)
    }
  } catch (e) {
    core.setFailed(`Run failed: ${e}`)
  }
}
