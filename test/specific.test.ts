import EthDater from '../src/index.js'
import { createPublicClient, http } from 'viem'
import { describe, expect, test } from 'bun:test'

const client = createPublicClient({ transport: http(process.env.RPC_URL) })
const dater = new EthDater(client)

describe('Block By Date Specific Dates Tests', function () {
	test('Should make less then 15 requests for 2015-09-03T08:47:03.168Z', async function () {
		dater.requests = 0

		await dater.getBlock(new Date('2015-09-03T08:47:03.168Z'))

		expect(dater.requests).toBeLessThan(15)
	})

	test('Should make less then 15 requests for 2017-09-09T16:33:13.236Z', async function () {
		dater.requests = 0

		await dater.getBlock(new Date('2017-09-09T16:33:13.236Z'))

		expect(dater.requests).toBeLessThan(15)
	})

	test('Should make less then 15 requests for 2017-09-22T13:52:59.961Z', async function () {
		dater.requests = 0

		await dater.getBlock(new Date('2017-09-22T13:52:59.961Z'))

		expect(dater.requests).toBeLessThan(15)
	})

	test('Should make less then 16 requests for 2016-11-14T14:46:06.107Z', async function () {
		dater.requests = 0

		await dater.getBlock(new Date('2016-11-14T14:46:06.107Z'))

		expect(dater.requests).toBeLessThan(15)
	})

	test('Should make less then 15 requests for 2017-04-20T07:54:29.965Z', async function () {
		dater.requests = 0

		await dater.getBlock(new Date('2017-04-20T07:54:29.965Z'))

		expect(dater.requests).toBeLessThan(15)
	})

	test('Should return right timestamp for a given date', async function () {
		let block = await dater.getBlock(new Date('2015-07-30T11:28:01-04:00'))

		expect(block.number).toEqual(5n)
	})

	test('Should return right timestamp for a given date', async function () {
		let block = await dater.getBlock(new Date('2015-07-30T11:28:02-04:00'))

		expect(block.number).toEqual(5n)
	})

	test('Should return right timestamp for a given date', async function () {
		let block = await dater.getBlock(new Date('2015-07-30T11:28:03-04:00'))

		expect(block.number).toEqual(5n)
	})
})
