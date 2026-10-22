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
  assert.equal(runMartianRobots('examples/smallstill.txt'), '0 0 N\n')
})

test('smallgrid: a robot rotates in place', () => {
  assert.equal(runMartianRobots('examples/smallrotate.txt'), '0 0 W\n')
})

test('two by two grid: a robot rotates in place and moves', () => {
  assert.equal(runMartianRobots('examples/twobytwo.txt'), '0 1 W\n')
})

test('two by two grid: show three robots with moves', () => {
  assert.equal(runMartianRobots('examples/twobytwo3robots.txt'), '0 1 W\n0 0 E\n1 0 S\n')
})



test('one by one grid: a scent saves the next robot, but only for the same move', () => {
  assert.equal(runMartianRobots('examples/onebyonescents.txt'), '0 0 N LOST\n0 0 N\n0 0 W LOST\n')
})

test('the sample from CHALLENGE.md', () => {
  assert.equal(runMartianRobots('examples/sample.txt'), '1 1 E\n3 3 N LOST\n2 3 S\n')
})
