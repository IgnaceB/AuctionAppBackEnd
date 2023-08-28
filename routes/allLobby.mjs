import express from 'express'
import connect from '../helpers/db.mjs'

const router=express.Router()


router.get('/',async (req,res)=>{
	//retrieve the nr of the page we want to display, setting up nr of entity by page
	// and calculate the nr of the first item to be display
	try{
		

	//retrieve data from db from startSearch to startSearch+nrEntity
		const lobbyQuery = `select *from lobby `
		const dataLobby= await connect(lobbyQuery)

		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
}
)

router.get('/:page',async (req,res)=>{
	//retrieve the nr of the page we want to display, setting up nr of entity by page
	// and calculate the nr of the first item to be display
	try{
		const currentPage=req.params.page
		let nrEntity = 20
		let startSearch = nrEntity*currentPage

	//retrieve data from db from startSearch to startSearch+nrEntity
		const lobbyQuery = `select *from lobby order by end_at asc offset ${startSearch} limit ${nrEntity}`
		const dataLobby= await connect(lobbyQuery)

		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
}
)

router.get('/tendance/:page',async (req,res)=>{
	try{
		
	//retrieve data from db for all the lobby and create field mycount with likes + message + bid
		const currentPage=req.params.page
		let nrEntity = 20
		let startSearch = nrEntity*currentPage

		const countQuery = `select *,(lobby.likes+
		(select count (bid.id) as countbid from bid where bid.id_item=lobby.id_item)
		+ (select count (id) as countchat from chat where chat.id_lobby=lobby.id)) as mycount 
		from lobby order by mycount desc offset ${startSearch} limit ${nrEntity}`

		const countTendance=await connect(countQuery)
		res.status(201).json(countTendance.rows)			
}
	
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

export default router