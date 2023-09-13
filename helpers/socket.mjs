import express from 'express'
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3000
const PORTSocket = 3001
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)




export const connection = ()=>{ io.on("connection",()=>{
	console.log('user connected')
})

const count = io.engine.clientsCount

console.log(count)
}



httpServer.listen(PORTSocket,()=>{
	console.log(`socket running on port ${PORTSocket}`)
})