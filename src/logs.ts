/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {default as ecs} from '@elastic/ecs-pino-format'
import {Client} from '@elastic/elasticsearch'
import {BulkStats} from '@elastic/elasticsearch/lib/Helpers'
import {createReadStream} from 'fs'
import {default as Pino} from 'pino'
import {default as split} from 'split2'

export async function convert(
  lines: string[],
  destPath: string
): Promise<void> {
  const log = Pino(ecs(), Pino.destination(destPath))

  for (const l of lines) {
    log.info(l)
  }
}

export function getESClient(
  cloudId: string,
  addresses: string[],
  user: string,
  pass: string
): Client {
  const config: any = {
    auth: {
      username: user,
      password: pass
    }
  }
  if (cloudId !== '') {
    config['cloud'] = {
      id: cloudId
    }
  } else {
    config['node'] = addresses
  }
  return new Client(config)
}

export async function bulkSend(
  client: Client,
  indexName: string,
  path: string
): Promise<BulkStats> {
  return client.helpers.bulk({
    datasource: createReadStream(path).pipe(split()),
    onDocument(doc) {
      return {
        create: {_index: indexName}
      }
    }
  })
}
