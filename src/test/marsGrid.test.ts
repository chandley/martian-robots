import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MarsGrid } from '../mars/marsGrid.ts'

test('reports the start position when no instruction is given', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  grid.addRobot({ x: 0, y: 0, orientation: 'N' })

  assert.equal(grid.reportRobots(), '0 0 N')
})

test('L rotates the robot left in place', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const robotId = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(robotId, 'L')

  assert.equal(grid.reportRobots(), '0 0 W')
})


test('R rotates the robot right in place', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const robotId = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(robotId, 'R')

  assert.equal(grid.reportRobots(), '0 0 E')
})


test('F moves off grid and reports lost at last position', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const robotId = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(robotId, 'F')

  assert.equal(grid.reportRobots(), '0 0 N LOST')
})

test('2x2 grid: L rotates a robot at the top-right corner in place', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  const robotId = grid.addRobot({ x: 1, y: 1, orientation: 'N' })

  grid.processInstruction(robotId, 'L')

  assert.equal(grid.reportRobots(), '1 1 W')
})


test('2x2 grid: LF rotates and moves a robot', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  const robotId = grid.addRobot({ x: 1, y: 1, orientation: 'N' })

  grid.processInstruction(robotId, 'L')
  grid.processInstruction(robotId, 'F')

  assert.equal(grid.reportRobots(), '0 1 W')
})


test('2x2 grid: show three robots', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.addRobot({ x: 1, y: 0, orientation: 'N' })
  grid.addRobot({ x: 1, y: 1, orientation: 'N' })

  assert.equal(grid.reportRobots(), '0 0 N\n1 0 N\n1 1 N')
})

test('honours the grid size: a robot moving past the edge is lost', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  const robotId = grid.addRobot({ x: 1, y: 1, orientation: 'N' })

  grid.processInstruction(robotId, 'L')
  grid.processInstruction(robotId, 'F')
  grid.processInstruction(robotId, 'F')

  assert.equal(grid.reportRobots(), '0 1 W LOST')
})

test('a lost robot ignores later instructions, even a move that would be valid from its last position', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  const robotId = grid.addRobot({ x: 1, y: 1, orientation: 'N' })

  grid.processInstruction(robotId, 'F') // off the top edge: lost at 1 1 N
  grid.processInstruction(robotId, 'L') // would face W
  grid.processInstruction(robotId, 'F') // would move to 0 1, which is on the grid

  assert.equal(grid.reportRobots(), '1 1 N LOST')
})

// Scents: a lost robot leaves a scent of its last position and the instruction that took it off the grid.

test('scent: a later robot ignores the same move from the same position', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const first = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(first, 'F')

  const second = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(second, 'F')

  assert.equal(grid.reportRobots(), '0 0 N LOST\n0 0 N')
})

test('scent: the saved robot carries on with its next instruction', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const first = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(first, 'F')

  const second = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(second, 'F')
  grid.processInstruction(second, 'R')

  assert.equal(grid.reportRobots(), '0 0 N LOST\n0 0 E')
})

test('scent: only applies to the orientation it was left with', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const first = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(first, 'F')

  const second = grid.addRobot({ x: 0, y: 0, orientation: 'E' })
  grid.processInstruction(second, 'F')

  assert.equal(grid.reportRobots(), '0 0 N LOST\n0 0 E LOST')
})

test('scent: one square can hold scents for more than one orientation', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  for (const orientation of ['N', 'E'] as const) {
    const lost = grid.addRobot({ x: 0, y: 0, orientation })
    grid.processInstruction(lost, 'F')
  }

  for (const orientation of ['N', 'E'] as const) {
    const saved = grid.addRobot({ x: 0, y: 0, orientation })
    grid.processInstruction(saved, 'F')
  }

  assert.equal(grid.reportRobots(), '0 0 N LOST\n0 0 E LOST\n0 0 N\n0 0 E')
})

test('scent: only applies to the square it was left on', () => {
  const grid = new MarsGrid({ maxX: 1, maxY: 1 })
  const first = grid.addRobot({ x: 0, y: 1, orientation: 'N' })
  grid.processInstruction(first, 'F')

  const second = grid.addRobot({ x: 1, y: 1, orientation: 'N' })
  grid.processInstruction(second, 'F')

  assert.equal(grid.reportRobots(), '0 1 N LOST\n1 1 N LOST')
})

test('scent: does not block a turn on the scented square', () => {
  const grid = new MarsGrid({ maxX: 0, maxY: 0 })
  const first = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(first, 'F')

  const second = grid.addRobot({ x: 0, y: 0, orientation: 'N' })
  grid.processInstruction(second, 'L')

  assert.equal(grid.reportRobots(), '0 0 N LOST\n0 0 W')
})
