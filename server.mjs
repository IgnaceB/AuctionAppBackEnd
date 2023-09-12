import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'
import pool from './helpers/db.mjs'
import Queue from 'bull'

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


import { createClient } from 'redis';

const client = createClient({
    username: 'default', // use your Redis user. More info https://redis.io/docs/management/security/acl/
    password: 'ppOdN5U8Yb3EazS3DiTnUd8k', // use your password here
    socket: {
        host: '89.58.25.154',
        port: 9001,
    
}});

const connected=async ()=>{
	client.on('error', err => console.log('Redis Client Error', err))
await client.connect()
await client.ping()
console.log(await client.ping())
}
connected()

// queue for create lobby from items creation => my_auction.mjs
export const lobbyCreationQueue= new Queue('lobbyCreationQueue',{
	socket: {
	host : process.env.HOSTREDIS,
	port : process.env.PORTREDIS},
	username : 'default',
	password: process.env.PASSWORDREDIS
})

// queue for delete lobby when auctionduration reach 0
const lobbySuppressionQueue = new Queue('lobbySuppressionQueue',{
	socket : {
	host : process.env.HOSTREDIS,
	port : process.env.PORTREDIS
},
	username : 'default',
	password: process.env.PASSWORDREDIS
})

const tryingQueue = new Queue('tryingQueue',{
	socket : {
	host : process.env.HOSTREDIS,
	port : process.env.PORTREDIS},
	username : 'default',
	password: process.env.PASSWORDREDIS
})

const trying = async ()=>{
	await tryingQueue.add({message : "test"})
}

trying()

tryingQueue.process(async(job,done)=>{
	console.log("ca process")
	done()
})


// create lobby
lobbyCreationQueue.process(async(job, done) => {
	try {

	const queryCreationLobby=`insert into lobby (name,id_item,created_at,end_at,likes,cover_lobby)
	VALUES ($1,$2,$3,$4,$5,$6) returning id`
	const creationLobby = await pool.query(queryCreationLobby,[job.data.name,job.data.id_item,job.data.created_at,job.data.end_at,job.data.likes,job.data.cover_lobby])
	
	job.data={id:creationLobby.rows[0].id,
	duration: job.data.end_at}
	console.log(`lobby id ${job.data.id} created`)
	done();
}
catch(err){
	throw err
}
});

//create worker in suppression queue
lobbyCreationQueue.on('completed',async (job,result)=>{
	console.log(`lobby created, setting up suppression id : ${job.data.id}`)
	try {
		await lobbySuppressionQueue.add({
		id : job.data.id,
		end_at : job.data.duration
	},
	{delay : job.data.duration})
	console.log('on queue')
}
catch(err){
	throw err
}
})

// delete lobby
lobbySuppressionQueue.process(async(job, done)=>{

	const querySuppressionLobby = `delete from lobby where id=$1`
	const supppressionLobby= await pool.query(querySuppressionLobby,[job.data.id])
	console.log(`lobby id : ${job.data.id} deleted`)
	done()
})




app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})