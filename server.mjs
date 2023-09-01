import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'
import pool from './helpers/db.mjs'


const PORT = 3000
const app = express()


import loginRoutes from './routes/login.mjs'
import allLobbyRoutes from './routes/allLobby.mjs'
import lobbyRoutes from './routes/lobby.mjs'
import historicRoutes from './routes/historic.mjs'
import accountRoutes from './routes/account.mjs'
import biddingRoutes from './routes/my_bidding.mjs'
import auctionRoutes from './routes/my_auction.mjs'
import chatRoutes from './routes/chat.mjs'
import {DateTime} from 'luxon'
/*const corsOption=({
	http://example.com
})*/

app.use(cors())
app.use(express.json())


app.use('/',loginRoutes)
app.use('/allLobby',allLobbyRoutes)
app.use('/lobby',lobbyRoutes)
app.use('/historic',historicRoutes)
app.use('/account',accountRoutes)
app.use('/my_bidding',biddingRoutes)
app.use('/my_auction',auctionRoutes)
app.use('/chat',chatRoutes)

let n=0

const callback2=async ()=>{
	let response=await pool.query('select *from users')
	
	let response2=await pool.query('select *from chat')
	let response3=await pool.query('select *from items')
	let respons4=await pool.query('select count(*) used from pg_stat_activity')
	n++
	console.log({response : response.rows[0],
					time : DateTime.now().valueOf(),
					iteration : n,
					connections : respons4.rows[0]
				})
}
const callback=async ()=>{
	let response=await pool.query('select *from users')
	
	let response2=await pool.query('select *from chat')
	let response3=await pool.query('select *from items')
	let respons4=await pool.query('select count(*) used from pg_stat_activity')
	n++
	console.log({response : response.rows[0],
					time : DateTime.now().valueOf(),
					iteration : n,
					connections : respons4.rows[0]
				})
}
setInterval(callback,40)
setInterval(callback2,5)


app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})