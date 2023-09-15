import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'
import pool from './helpers/db.mjs'
import Queue from 'bull'
import { createServer } from "http";
import { Server } from "socket.io";



const app = express()
const PORT = 3000

// try on socket not implemented !!!!
/*const PORTSocket = 3001
const httpServer = createServer(app)
export const io = new Server(httpServer)
io.on("connection",(socket)=>{
	console.log('user connected')
})
const count = io.engine.clientsCount*/

console.log(count)

import loginRoutes from './routes/login.mjs'
import allLobbyRoutes from './routes/allLobby.mjs'
import lobbyRoutes from './routes/lobby.mjs'
import historicRoutes from './routes/historic.mjs'
import accountRoutes from './routes/account.mjs'
import biddingRoutes from './routes/my_bidding.mjs'
import auctionRoutes from './routes/my_auction.mjs'
import chatRoutes from './routes/chat.mjs'
import {DateTime} from 'luxon'

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

//try on socket, not implemented !!!!
/*app.get('/socket',(req,res)=>{
	try {io.emit('message','dqzdzqdz')
	res.sendStatus(200)
}
	catch(err){
		throw err
	}
})*/


// connection to Redis db Not used !!!!!
/*import { createClient } from 'redis';
const client = createClient({
    username: 'default', // use your Redis user. More info https://redis.io/docs/management/security/acl/
    password: 'ppOdN5U8Yb3EazS3DiTnUd8k', // use your password here
    socket: {
        host: '89.58.25.154',
        port: 9001,
        tls : false,
}});
const connected=async ()=>{
	client.on('error', err => console.log('Redis Client Error', err))
await client.connect()
await client.ping()
console.log(await client.ping())
console.log(await client.get('mykey'))
}
connected()*/


// queue for create lobby from items creation => my_auction.mjs
export const lobbyCreationQueue= new Queue('lobbyCreationQueue',{
	redis : {
    password: 'ppOdN5U8Yb3EazS3DiTnUd8k', // use your password here
    host: '89.58.25.154',
    port: 9001,
},
limiter : {
	max : 10000,
	duration : 5000,
}})

// queue for delete lobby when auctionduration reach 0
const lobbySuppressionQueue = new Queue('lobbySuppressionQueue',{
	redis : {
    password: 'ppOdN5U8Yb3EazS3DiTnUd8k', // use your password here
    host: '89.58.25.154',
    port: 9001,
},
limiter : {
	max : 10000,
	duration : 5000,
}})



// describe process of creating lobby queue =>create lobby
lobbyCreationQueue.process(async(job, done) => {
	try {
		const queryCreationLobby=`insert into lobby (name,id_item,created_at,end_at,likes,cover_lobby)
		VALUES ($1,$2,$3,$4,$5,$6) returning id`
		const queryUpdateItem= `update items set status=1 where id=$1`
		const updateItem= await pool.query(queryUpdateItem,[job.data.id_item])
		const creationLobby = await pool.query(queryCreationLobby,[job.data.name,job.data.id_item,job.data.created_at,job.data.end_at,job.data.likes,job.data.cover_lobby])

		job.data={id:creationLobby.rows[0].id,
		duration: job.data.end_at,
		item : job.data.id_item}
		/*console.log(`lobby id ${job.data.id} created`)*/

		done();
	}
	catch(err){
		throw err
	}
});

//create worker in suppression queue
lobbyCreationQueue.on('completed',async (job,result)=>{
	try {
		await lobbySuppressionQueue.add({
			id : job.data.id,
			end_at : job.data.duration,
			item : job.data.item
		},
		{delay : job.data.duration})
	}
	catch(err){
		throw err
	}
})

// describe process of suppression queue => delete lobby
lobbySuppressionQueue.process(async(job, done)=>{
	const queryUpdateItem= `update items set status=2 where id=$1`
	const updateItem= await pool.query(queryUpdateItem,[job.data.item])
	const querySuppressionLobby = `delete from lobby where id=$1`
	const supppressionLobby= await pool.query(querySuppressionLobby,[job.data.id])
	done()
})

//try on socket => not implemented
/*httpServer.listen(PORTSocket,()=>{
	console.log(`socket running on port ${PORTSocket}`)
})*/

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})