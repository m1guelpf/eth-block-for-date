import EthDater from '../src/index.js'
import { createPublicClient, http } from 'viem'
import { describe, expect, test } from 'bun:test'

const client = createPublicClient({ transport: http(process.env.RPC_URL) })
const dater = new EthDater(client)

describe('Block By Date General Tests', function () {
	test('Should get right block', async function () {
		let block = await dater.getBlock(new Date('2016-07-20T13:20:40Z'))
		expect(block.number).toEqual(1920000n)
	})

	test('Should get previous block', async function () {
		let block = await dater.getBlock(new Date('2016-07-20T13:20:40Z'), false)
		expect(block.number).toEqual(1919999n)
	})

	test('Should return 1 as block number if given time is before first block time', async function () {
		let block = await dater.getBlock(new Date('1961-04-06:07:00Z'))
		expect(block.number).toEqual(1n)
	})

	test('Should return last block number if given time is in the future', async function () {
		let last = await client.getBlockNumber()
		let block = await dater.getBlock(new Date(Date.now() + 100000000000), true, true)
		expect(block.number).toEqual(last)
	})

	test('Should return unique blocks for hourly request', async function () {
		let time = new Date(),
			results = []
		for (let i = 0; i < 10; i++) {
			let block = await dater.getBlock(time)

			time = new Date(time.getTime() - 3600000)
			results.push(block.number)
		}

		let unique = results.filter((v, i, a) => a.indexOf(v) === i)

		expect(results).toStrictEqual(unique)
	})

	test('Should return right timestamp for a given date', async function () {
		let block = await dater.getBlock(new Date('2016-07-20T13:20:40Z'))
		expect(block.timestamp).toEqual(1469020840)
	})

	test('Should return right timestamp if given time is before first block time', async function () {
		let block = await dater.getBlock(new Date('1961-04-06:07:00Z'))
		expect(block.timestamp).toEqual(1438269988)
	})

	test('Should return right timestamp if given time is in the future', async function () {
		let latestBlock = await client.getBlockNumber()
		let block = await dater.getBlock(new Date('2030-04-06:07:00Z'), true, true)

		// accounts for new blocks being mined during the test
		expect(BigInt(latestBlock) - block.number).toBeLessThanOrEqual(5n)
	})
})
