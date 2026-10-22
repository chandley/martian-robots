import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runRobots } from '../runRobots.ts'

test('runs each robot in turn and reports them all', () => {
  const report = runRobots({
    maxX: 1,
    maxY: 1,
    robots: [
      { start: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
      { start: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
    ],
  })

  assert.equal(report, '0 1 W\n0 0 E')
})
