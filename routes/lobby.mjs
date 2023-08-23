import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()

router.get('/:lobby_id',async (req,res)=>{
	//retrieve the id of the lobby
	try{
		const currentLobby=req.params.lobby_id

	//retrieve data from the lobby_id
		const lobbyQuery = `select *from lobby where id='${currentLobby}'`
		const dataLobby= await connect(lobbyQuery)
		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.post('/bid',async (req,res)=>{
	//retrieve bid information
	const bidAmount = req.body.bidAmount
	const user_id = req.body.user_id
	const lobby_id = req.body.lobby_id
	const date=DateTime.now().toSQL()

	//find items.id using lobby_id
	const findItemQuery = `select items.id from lobby 
	inner join items on lobby.id_item=items.id 
	where lobby.id='${lobby_id}'`
	const findItem= await connect(findItemQuery)

	//verify if this is the higher bid on this item
	const findHigherBidQuery=`select amount from bid where id_item='${findItem.rows[0]["id"]}' order by amount desc limit 1`
	const higherBid=await connect(findHigherBidQuery)
	if (higherBid.rows[0]['amount']<bidAmount){

	//update data on table bid
		try{
			const bidQuery = `insert into bid (id_bidder,id_item,created_at,amount) values 
			('${user_id}','${findItem.rows[0]["id"]}','${date}','${bidAmount}')`
			const updateBid= await connect(bidQuery)
			res.status(200).json({message : "successfully bid on the item"})   
		}
			catch(err){
				console.log(err)
				res.status(404).json({message:'connection error, contact webmaster'})
			}   
		}

	else {
		res.status(401).json({message : 'error, the bid is not the higher on this item'})
	}
})

router.post('/like',async(req,res)=>{
	//retrieve like informations
	const user_id=req.body.user_id
	const lobby_id=req.body.lobby_id

	// verify if this is the first like on this lobby by this user
	const searchLikeQuery=`select *from likes_to_users where id_user='${user_id}' and id_lobby='${lobby_id}'`
	const searchLike= await connect(searchLikeQuery)

	if (searchLike.rows.length>0){
		res.status(401).json({message : 'error, this user already liked this lobby'})
	}
	else {
		// insert data into likes_to_users
		const likeToUsersQuery = `insert into likes_to_users (id_user,id_lobby) VALUES ('${user_id}',${lobby_id})`
		const likeToUsers= await connect(likeToUsersQuery)

		res.status(201).json({message : 'like successfully added'})
	}
})

export default router