import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MarsGrid } from '../mars/marsGrid.ts'
import { addAndMoveRobots } from '../addAndMoveRobots.ts'

test('adds and moves each robot in turn', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })

  addAndMoveRobots(grid, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])

  assert.equal(grid.reportRobots(), '0 1 W\n0 0 E')
})
