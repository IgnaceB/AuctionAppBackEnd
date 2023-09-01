import express from 'express'
import pool from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()


//display all the chats of a lobby
router.get('/:lobby_id',async (req,res)=>{
	try {
		const idLobby = req.params.lobby_id

		const chatQuery = `select chat.id_user, chat.message, users.avatar, users.username, chat.created_at from chat inner join users on chat.id_user=users.id
		where id_lobby=${idLobby}`
		const chat=await pool.query(chatQuery)

		res.status(200).json(chat.rows)
}
		catch(err){
			
			res.status(404).json({message : err})
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

		const sendMessage=await pool.query(sendQuery)

		res.status(201).json({message:'message succsefully sent'})
	}
	catch(err){
		
		res.status(404).json({message:err})
	}
})

export default router