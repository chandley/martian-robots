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
