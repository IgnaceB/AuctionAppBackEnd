import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the bid table
		const userQuery = `select *from bid where id_bidder='${currentUser}'`
		const dataUser= await connect(userQuery)
		
		res.status(200).json(dataUser.rows)
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
			res.statuts(401).json({message:'error, no such bid'})
		}
	})

export default router