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
		const lobbyQuery = `select *from lobby order by end_at offset ${startSearch} limit ${nrEntity} asc`
		const dataLobby= await connect(lobbyQuery)

		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
}
)

export default router