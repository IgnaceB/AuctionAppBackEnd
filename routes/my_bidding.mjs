import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the bid table, item table, and lobby table
		const bidQuery = `select * from bid
		 where id_bidder='${currentUser}' order by bid.id desc`
		const dataBid= await connect(bidQuery)
		
		//setting up out of scope the container of all the informations
		let allData = []

		//looping on the number of bidded item, to associate correct lobby and items to each bid
		for (let i=0;i<dataBid.rows.length;i++){
		const itemQuery= `select * from items 
		where id=${dataBid.rows[i]["id_item"]}`
		const dataItem=await connect(itemQuery)

		const lobbyQuery= `select *from lobby
		where id_item=${dataBid.rows[i]["id_item"]}`
		const dataLobby=await connect(lobbyQuery)

		allData[i]={
			bid_information : dataBid.rows[i],
			item_information : dataItem.rows[0],
			lobby_information : dataLobby.rows[0]}
	}

		
		res.status(200).json(allData)

	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

//update status of an item -> payed
router.post('/payment',async (req,res)=>{
	//retrieve the id of the user and the id of the item 
	const currentUser=req.body.user_id
	const currentItem=req.body.item_id

	//check if the bid exists 

	const checkBidQuery=`select *from bid where id_bidder='${currentUser}' and id_item='${currentItem}'`
	const checkBid=await connect(checkBidQuery)

	//check if the item have the good status
	console.log(checkBid)
	if(checkBid.rows.length>0){

		try{

	//Update status of items -> 3 -> payed
			const paymentQuery = `update items set status='3' where id='${currentItem}'`
			const updateStatus= await connect(paymentQuery)
			
			res.status(200).json({message : 'status updated'})
		}
		catch(err){
			console.log(err)
			res.status(404).json({message:'connection error, contact webmaster'})
		}}
		else {
			res.status(401).json({message:'error, no such bid'})
		}
	})

export default router