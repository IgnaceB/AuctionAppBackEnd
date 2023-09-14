import express from 'express'
import pool from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'
import Stripe from 'stripe'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the bid table, item table, and lobby table
		
		const bidQuery = `select *,(select max(amount) from bid 
		as max_bid where max_bid.id_item = bid.id_item) as max_amount,
		(select count (distinct id_item) from bid where id_bidder=$1) as nr_items
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
		const bidQuery = `select *,bid.id as bid_id from bid
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

//
router.post('/payment/stripe',authentication, async (req,res)=>{
	//retrieve the id of the user
	const id_user=res.locals.user_id
	const id_item = req.body.id_item
	const id_bid = req.body.id_bid
	

		// verif query if user, bid and max-bid are good
	const verifQuery=`select * from bid where id_bidder=$1 and id_item=$2 and id=$3 and amount=
	(select max(amount) from bid as max_bid where id_item=$2)`
	const verif = await pool.query(verifQuery,[id_user,id_item, id_bid])

	if (verif.rows[0]!=undefined){
		const itemInformationQuery = `select *from items where id=$1`
		const itemInformation=await pool.query(itemInformationQuery,[id_item])
		try{
	//init stripe session according to the data send by FE
			const stripe = new Stripe(process.env.stripeKey,{
				apiVersion: '2023-08-16',
			})
			const session = await stripe.checkout.sessions.create({
				line_items: [
				{
					price_data: {
						currency : "EUR",
						product_data:{
							name : itemInformation.rows[0]["name"],

						},
						unit_amount : verif.rows[0]["amount"]*100,
					},
					quantity: 1,
				},
				],
				mode: 'payment',
				metadata : {
    			'id_item': `${itemInformation.rows[0]["id"]}`,// this can be anything stored to your db
    		},
    		success_url: `http://platform.oxomoto.co`,
    		cancel_url: `http://platform.oxomoto.co`,
    	});

			res.status(303).json({message : session.url});
		}
		catch(err){
			console.log(err)
			res.status(404).json({message:'connection error, contact webmaster'})
		}
	}
	else {
		res.status(403).json({message:'bid error, no such payment'})
	}
})

//update status of an item -> payed with webhook on stripes dashboard
router.post('/payment', async (req,res)=>{
	const stripe = new Stripe(process.env.stripeKey,{
		apiVersion: '2023-08-16',
	})
	//retrieve the id of the user and the id of the item 
/*	const currentUser=res.locals.user_id*/
/*	const currentItem=req.body.item_id*/
	console.log(req.body.data.metadata)
	console.log(req.body.data)
	const currentItem=req.body.metadata.id_item
	//check if the bid exists and is the higher on this item

/*	const checkBidQuery=`select *from bid where id_bidder=$1 and id_item=$2
	and amount=(select max(amount) from bid as max_bid where bid.id_item=max_bid.id_item)
	and 2=(select status from items where items.id=bid.id_item) `
	const checkBid=await pool.query(checkBidQuery,[currentUser,currentItem])

	//check if the item have the good status

	if(checkBid.rows.length>0){*/

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
/*
	const intent = await stripe.paymentIntents.retrieve(`{{${req.body.data.object.id}}`);
	const charges = intent.charges.data;*/
/*console.log(charges)
console.log(intent)*/

		try{

	//Update status of items -> 3 -> payed
			const paymentQuery = `update items set status='3' where id=$1`
			const updateStatus= await pool.query(paymentQuery,[currentItem])
			console.log('status updated')
			res.status(200).json({message : 'status updated'})
		}
		catch(err){
			console.log(err)
			res.status(404).json({message:'connection error, contact webmaster'})
		}
/*	}*/
	/*	else {
			res.status(401).json({message:'error, no such bid'})
		}*/
})

export default router