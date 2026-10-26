import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
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

function runMartianRobotsExpectingFailure(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const { status, stdout, stderr } = spawnSync(process.execPath, ['martian-robots', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  return { status, stdout, stderr }
}

test('bad input: reports the file and line on stderr, prints nothing else and exits with 1', () => {
  const { status, stdout, stderr } = runMartianRobotsExpectingFailure(['examples/badorientation.txt'])
  assert.equal(status, 1)
  assert.equal(stdout, '')
  assert.match(stderr, /examples\/badorientation\.txt line 2: .*orientation/i)
})

test('missing input file: says so and exits with 1', () => {
  const { status, stderr } = runMartianRobotsExpectingFailure(['examples/does-not-exist.txt'])
  assert.equal(status, 1)
  assert.match(stderr, /cannot read .*does-not-exist\.txt/i)
})

test('no argument: prints usage and exits with 1', () => {
  const { status, stderr } = runMartianRobotsExpectingFailure([])
  assert.equal(status, 1)
  assert.match(stderr, /usage/i)
})
