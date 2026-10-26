import { test } from 'node:test'
import assert from 'node:assert/strict'
import { InputError, parseInput } from '../io/parseInput.ts'

test('parses the grid and one robot with an instruction line', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n')

  assert.deepEqual(input, {
    gridSize: { maxX: 1, maxY: 1 },
    robotOrders: [{ startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' }],
  })
})

test('a robot with no instruction line at the end of the file gets an empty instruction string', () => {
  const input = parseInput('0 0\n0 0 N\n')

  assert.deepEqual(input.robotOrders, [{ startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: '' }])
})

test('parses three robots in order', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n0 0 N\nR\n1 0 N\nRR\n')

  assert.deepEqual(input.robotOrders, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
    { startPosition: { x: 1, y: 0, orientation: 'N' }, instructionString: 'RR' },
  ])
})

test('ignores blank lines between robots', () => {
  const input = parseInput('1 1\n1 1 N\nLF\n\n0 0 N\nR\n')

  assert.deepEqual(input.robotOrders, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])
})

test('a robot with no instructions followed by another robot gets an empty instruction string', () => {
  const input = parseInput('1 1\n1 1 N\n0 0 N\nR\n')

  assert.deepEqual(input.robotOrders, [
    { startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: '' },
    { startPosition: { x: 0, y: 0, orientation: 'N' }, instructionString: 'R' },
  ])
})

test('parses Windows line endings the same way', () => {
  const input = parseInput('1 1\r\n1 1 N\r\nLF\r\n')

  assert.deepEqual(input, {
    gridSize: { maxX: 1, maxY: 1 },
    robotOrders: [{ startPosition: { x: 1, y: 1, orientation: 'N' }, instructionString: 'LF' }],
  })
})

// Validation: any bad line rejects the whole input with an InputError naming the line.

function assertRejected(text: string, lineNumber: number, message: RegExp): void {
  assert.throws(() => parseInput(text), (error: unknown) => {
    assert.ok(error instanceof InputError, 'expected an InputError')
    assert.equal(error.lineNumber, lineNumber)
    assert.match(error.message, message)
    return true
  })
}

test('rejects an empty input', () => {
  assertRejected('', 1, /grid/i)
})

test('rejects a grid line that is not two whole numbers', () => {
  assertRejected('5\n1 1 N\n', 1, /grid/i)
})

test('rejects a grid larger than 50', () => {
  assertRejected('51 3\n1 1 N\n', 1, /50/)
})

test('accepts a grid of exactly 50 by 50', () => {
  assert.deepEqual(parseInput('50 50\n50 50 N\n').gridSize, { maxX: 50, maxY: 50 })
})

test('rejects an unknown orientation', () => {
  assertRejected('5 3\n1 1 X\n', 2, /orientation/i)
})

test('rejects a robot starting off the grid', () => {
  assertRejected('5 3\n6 1 N\n', 2, /off the grid/i)
})

test('rejects an unknown instruction letter', () => {
  assertRejected('5 3\n1 1 N\nFXF\n', 3, /instruction/i)
})

test('rejects an instruction string longer than 100', () => {
  assertRejected(`5 3\n1 1 N\n${'L'.repeat(101)}\n`, 3, /100/)
})

test('accepts an instruction string of exactly 100', () => {
  assert.equal(parseInput(`5 3\n1 1 N\n${'L'.repeat(100)}\n`).robotOrders[0].instructionString.length, 100)
})

test('rejects more than 1000 robots', () => {
  const robots = '0 0 N\n'.repeat(1001)
  assertRejected(`5 3\n${robots}`, 1002, /1000/)
})

test('accepts exactly 1000 robots', () => {
  const robots = '0 0 N\n'.repeat(1000)
  assert.equal(parseInput(`5 3\n${robots}`).robotOrders.length, 1000)
})

test('rejects an instruction line with no robot before it', () => {
  assertRejected('5 3\nLF\n', 2, /robot/i)
})

test('rejects two instruction lines in a row', () => {
  assertRejected('5 3\n1 1 N\nLF\nRF\n', 4, /robot/i)
})

test('line numbers count blank lines', () => {
  assertRejected('5 3\n\n1 1 X\n', 3, /orientation/i)
})
