# Elastic Logs Action

[![build-test](https://github.com/masci/elastic-logs/actions/workflows/test.yml/badge.svg)](https://github.com/masci/elastic-logs/actions/workflows/test.yml)

This action collect logs from a workflow run and send them to Elasticsearch

## Usage

```yaml
some-job:
  runs-on: ubuntu-latest
  steps:
    - name: checkout
      uses: actions/checkout@v2
    - name: build
      run: this-will-fail
    - name: elastic-logs
      if: failure()
      uses: masci/elastic-logs
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        cloud-id: ${{ secrets.CLOUD_ID }}
        username: ${{ secrets.ES_USER }}
        password: ${{ secrets.ES_PASS }}
        job-names: build
```

## Development

Install the dependencies

```bash
$ npm install
```

Lint, test and build the typescript and package it for distribution

```bash
$ npm run all
```

Run the tests :heavy_check_mark:

```bash
$ npm test

> elastic-logs-action@1.0.0 test
> jest

 PASS  __tests__/github.test.ts
  Test jobs list retrieval
    ✓ Retrieve the list of jobs (4 ms)
    ✓ Cannot retrieve the list of jobs (1 ms)
    ✓ Filter jobs by name
  Test logs retrieval
    ✓ Retrieve the logs (6 ms)
    ✓ Cannot retrieve the logs (1 ms)

 PASS  __tests__/logs.test.ts
  Test logs module
    ✓ conversion (8 ms)

 PASS  __tests__/run.test.ts
  Test config params
    ✓ Process job-names param (5 ms)
    ✓ Missing Elastic config params

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        3.309 s, estimated 4 s
Ran all test suites.
```
