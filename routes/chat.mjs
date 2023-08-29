import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()


//display all the chats of a lobby
router.get('/:lobby_id',async (req,res)=>{
	try {
		const idLobby = req.params.lobby_id

		const chatQuery = `select *from chat where id_lobby=${idLobby}`
		const chat=await connect(chatQuery)
		console.log(chat)
		res.status(200).json(chat.rows)}
		catch(err){
			
			res.send(404).json({message : err})
		}
	})

//post a message inside a lobby
router.post('/',authentication, async (req,res)=>{
	try{
		const idUser = res.locals.user_id
		const idLobby = req.body.lobby_id
		const message= req.body.message

//define sql query, and connect to DB
		const sendQuery= `insert into chat (id_user, id_lobby, message) VALUES ('${idUser}','${idLobby}','${message}')`

		const sendMessage=await connect(sendQuery)

		res.status(201).json({message:'message succsefully sent'})
	}
	catch(err){
		
		res.send(404).json({message:err})
	}
})

export default router