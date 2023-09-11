import express from 'express'
import pool from '../helpers/db.mjs'

import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()


router.get('/',async (req,res)=>{
	//retrieve the nr of the page we want to display, setting up nr of entity by page
	// and calculate the nr of the first item to be display
	try{
		

	//retrieve data from db from startSearch to startSearch+nrEntity
		const lobbyQuery = `select *from lobby `
		const dataLobby= await pool.query(lobbyQuery)

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
		let values = [startSearch,nrEntity]
		const lobbyQuery = `select *from lobby order by end_at asc offset $1 limit $2`
		const dataLobby= await pool.query(lobbyQuery,values)

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
		let values = [startSearch,nrEntity]
		const countQuery = `select *,(lobby.likes+
		(select count (bid.id) as countbid from bid where bid.id_item=lobby.id_item)
		+ (select count (id) as countchat from chat where chat.id_lobby=lobby.id)) as mycount 
		from lobby order by mycount desc offset $1 limit $2`

		const countTendance=await pool.query(countQuery,values)
		res.status(201).json(countTendance.rows)			
	}
	
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.post('/tags',async (req,res)=>{
	//retrieve an array containing all the tags
	const tags = req.body.tags
	try{
		//creating the query to get the lobby containing items that match all the tags
		//initialize query
		let researchQuery=`select *from items inner join lobby on lobby.id_item=items.id where items.id in `
		
		for (let i = 0; i<tags.length;i++){
			//
			if (i==tags.length-1){
				researchQuery+=`(select id_item from items_tags where tag=$${i+1}`
				for (let i = 0;i<tags.length;i++){
					researchQuery+=`)`
				}
			} 
			else {
				researchQuery+=`(select id_item from items_tags where tag=$${i+1} and id_item in `
			}
		}
		
//retrieve data from db from startSearch to startSearch+nrEntity
		let values = tags
		const dataLobby= await pool.query(researchQuery,values)

		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
}
)

router.post('/tags/:page',async (req,res)=>{
	//retrieve an array containing all the tags
	const tags = req.body.tags

		//define the current page
	const currentPage=req.params.page
	let nrEntity = 20
	let startSearch = nrEntity*currentPage

	try{
			//creating the query to get the lobby containing items that match all the tags
			//initialize query
		let researchQuery=`select *from items inner join lobby on lobby.id_item=items.id where items.id in `
		
		//looping to create the tags search according the number of tags sent
		for (let i = 0; i<tags.length;i++){
			//
			if (i==tags.length-1){
				researchQuery+=`(select id_item from items_tags where tag=$${i+3}`
				for (let i = 0;i<tags.length;i++){
					researchQuery+=`)`
				}
			} 
			else {
				researchQuery+=`(select id_item from items_tags where tag=$${i+3} and id_item in `
			}
		}

			//finalize query with sorting + paginating
		researchQuery+=` order by end_at desc offset $1 limit $2`
	
			//retrieve data from db from startSearch to startSearch+nrEntity
		const values = [nrEntity, startSearch,...tags]
		

		const dataLobby= await pool.query(researchQuery,values)

		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
}
)

export default router