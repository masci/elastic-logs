import {default as Pino} from 'pino'
import {default as ecs} from '@elastic/ecs-pino-format'

export async function convert(lines: string[], path: string): Promise<void> {
  const log = Pino(ecs(), Pino.destination(path))

  for (const l of lines) {
    log.info(l)
  }
}
