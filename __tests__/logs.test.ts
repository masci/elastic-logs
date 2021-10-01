import {convert} from '../src/logs'
import {readFileSync, rmSync} from 'fs'
import {mkdtemp} from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

describe('Test logs module', () => {
  beforeEach(() => {})

  afterEach(() => {})

  test('conversion', async () => {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'elastic-logs-'))
    const inFile = './__tests__/logs.txt'
    const outFile = path.join(tmpDir, 'out.log')
    // load lines from file
    let lines: string[] = String(readFileSync(inFile)).split('\n')
    // convert lines into ECS, write to file
    convert(lines, outFile)
    // assert
    let result: string[] = String(readFileSync(outFile)).split('\n')
    expect(result.length).toBe(lines.length + 1) // count the trailing blank line in the log file
    // cleanup
    rmSync(tmpDir, {recursive: true, force: true})
  })
})
