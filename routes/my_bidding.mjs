import express from 'express'
import pool from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the bid table, item table, and lobby table
		
		const bidQuery = `select *,(select max(amount) from bid 
		as max_bid where max_bid.id_item = bid.id_item) as max_amount,
		(select count (distinct id_item) from bid where id_bidder=$1 as nr_items
		from bid 
		where id_bidder=$1
		order by bid.id_item desc`
		const dataBid= await pool.query(bidQuery,[currentUser])
		
		//setting up out of scope the container of all the informations
		let allData = []
		let previous=-1
		let actual=0
		let next=1
		
		//looping on the number of bidded item, to associate correct lobby and items to each bid
		for (let i=0;i<dataBid.rows[0].nr_items;i++){
		let bidData=[]
		const itemQuery= `select 
		items.id as id_item,
		items.id_seller as id_seller,
		items.name as item_name,
		items.status as item_status,
		items.cover_lobby as cover_lobby,
		lobby.id as id_lobby,
		lobby.end_at as lobby_end_at
		from items 
		left join lobby on lobby.id_item=items.id
		where items.id=$1`
		
		const dataItem=await pool.query(itemQuery,[dataBid.rows[actual]["id_item"]])
		bidData.push(dataBid.rows[actual])

		for (let j=next; j<dataBid.rows.length;j++){
		
			if (dataBid.rows[j].id_item==dataBid.rows[actual].id_item){	
				bidData.push(dataBid.rows[j])
			}
			else {
				previous=j-1
				break
			}
		}
		actual=previous+1
		next=previous+2

		allData[i]={
			bid_information : bidData,
			item_information : dataItem.rows[0]}
	}
		res.status(200).json(allData)

	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.get('/payment/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the bid table, item table, and lobby table
		const bidQuery = `select * from bid
		inner join items on items.id=bid.id_item
		where id_bidder=$1 and amount in 
		(select max(amount) from bid as max_bid where max_bid.id_item=bid.id_item group by id_item) 
		and items.status='2' order by bid.id desc`
		const dataBid= await pool.query(bidQuery,[currentUser])
	
		res.status(200).json(dataBid.rows)

	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

//update status of an item -> payed
router.post('/payment',authentication, async (req,res)=>{
	//retrieve the id of the user and the id of the item 
	const currentUser=res.locals.user_id
	const currentItem=req.body.item_id

	//check if the bid exists and is the higher on this item

	const checkBidQuery=`select *from bid where id_bidder=$1 and id_item=$2
	and amount=(select max(amount) from bid as max_bid where bid.id_item=max_bid.id_item)
	and 2=(select status from items where items.id=bid.id_item) `
	const checkBid=await pool.query(checkBidQuery,[currentUser,currentItem])

	//check if the item have the good status

	if(checkBid.rows.length>0){

		try{

	//Update status of items -> 3 -> payed
			const paymentQuery = `update items set status='3' where id=$1`
			const updateStatus= await pool.query(paymentQuery,[currentItem])
			
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