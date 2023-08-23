import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'

console.log("ca deploie")
const PORT = 3000
const app = express()


import loginRoutes from './routes/login.mjs'
import allLobbyRoutes from './routes/allLobby.mjs'
import lobbyRoutes from './routes/lobby.mjs'
import historicRoutes from './routes/historic.mjs'
import accountRoutes from './routes/account.mjs'
import biddingRoutes from './routes/my_bidding.mjs'
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

app.get("/", async (req, res)=>{
	console.log("ca route")
	const response = await connect("select *from users")
	console.log(response.rows)
	res.status(200).json(response.rows)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})