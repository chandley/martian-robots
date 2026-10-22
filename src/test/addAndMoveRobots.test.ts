import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MarsGrid } from '../mars/marsGrid.ts'
import { addAndMoveRobots } from '../addAndMoveRobots.ts'

test('runs each robot in turn and reports them all', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })

  const report = addAndMoveRobots(grid, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])

  assert.equal(report, '0 1 W\n0 0 E')
})
