import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

function runMartianRobots(inputFile: string): string {
  return execFileSync(process.execPath, ['martian-robots', inputFile], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

test('smallgrid: a robot with no instructions reports its start position', () => {
  assert.equal(runMartianRobots('examples/smallgrid.txt'), '0 0 N\n')
})
