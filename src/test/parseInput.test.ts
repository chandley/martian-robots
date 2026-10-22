import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput } from '../io/parseInput.ts'

test('parses the grid and one robot with an instruction line', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n')

  assert.deepEqual(input, {
    gridSize: { maxX: 1, maxY: 1 },
    robots: [{ startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' }],
  })
})

test('a robot with no instruction line at the end of the file gets an empty instruction string', () => {
  const input = parseInput('0 0\n0 0 N\n')

  assert.deepEqual(input.robots, [{ startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: '' }])
})

test('parses three robots in order', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n0 0 N\nR\n1 0 N\nRR\n')

  assert.deepEqual(input.robots, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
    { startPosition: { x: 1, y: 0, orientation: 'N' }, instructionString: 'RR' },
  ])
})

test('ignores blank lines between robots', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n\n0 0 N\nR\n')

  assert.deepEqual(input.robots, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])
})

test('a robot with no instructions followed by another robot gets an empty instruction string', () => {
  const input = parseInput('1 1\n1 1 N\n0 0 N\nR\n')

  assert.deepEqual(input.robots, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: '' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])
})

test('parses Windows line endings the same way', () => {
  const input = parseInput('1 1\r\n1 1 N\r\nLF\r\n')

  assert.deepEqual(input, {
    gridSize: { maxX: 1, maxY: 1 },
    robots: [{ startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' }],
  })
})
