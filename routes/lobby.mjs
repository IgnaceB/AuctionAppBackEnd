import express from 'express'
import pool from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()

router.get('/init/:lobby_id',async (req,res)=>{
	//retrieve the id of the lobby
	try{
		const currentLobby=req.params.lobby_id

	//retrieve data from the lobby_id
		let valuesLobby=[currentLobby]
		const lobbyQuery = `select *from lobby where id=$1`
		const lobby =await pool.query(lobbyQuery,valuesLobby)

			//retrieve data from items
		let valuesItem=[lobby.rows[0]["id_item"]]
		const itemQuery=`select *from items where id=$1`
		const item = await pool.query(itemQuery,valuesItem)
		
		//retrieve data from pictures
		const picturesQuery=`select *from items_pictures where id_item=$1`
		const pictures =await pool.query(picturesQuery,valuesItem)

		//retrieve data from users
		let valuesSeller=[item.rows[0]["id_seller"]]
		const sellerQuery=`select *from users where id=$1`
		const seller =await pool.query(sellerQuery,valuesSeller)

		//retrieve data from chat 
		const chatQuery=`select chat.id_user, chat.message, users.avatar, users.username, chat.created_at 
		from chat inner join users on chat.id_user=users.id
		where id_lobby=$1`
		const chat =await pool.query(chatQuery,valuesLobby)

		//retrieve data from tags
		const tagsQuery=`select *from items_tags where id_item=$1`
		const tags = await pool.query(tagsQuery,valuesItem)

		res.status(200).json({
			lobby : lobby.rows[0],
			item : item.rows[0],
			pictures : pictures.rows,
			seller : seller.rows[0],
			chat : chat.rows,
			tags : tags.rows
		})

	}

	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.get('/update_chat/:lobby_id',async (req,res)=>{
	//retrieve the id of the lobby
	try{
		const currentLobby=req.params.lobby_id
		let values=currentLobby

	//retrieve data from : 
		// lobby -> id_item + likes
		// chat -> new messages
		// bid -> amount
		// users -> avatar and username inner join message chat
		const updateQuery = `select chat.message, chat.created_at, users.avatar, users.username
		from chat inner join users on chat.id_user=users.id 
		where chat.id_lobby =$1 `
		const update = await pool.query(updateQuery,values)
		res.status(200).json(update.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})
router.get('/update_lobby/:lobby_id',async (req,res)=>{
	//retrieve the id of the lobby
	try{
		const currentLobby=req.params.lobby_id
		let values=[currentLobby]
	//retrieve data from : 
		// lobby -> id_item + likes
		// chat -> new messages
		// bid -> amount
		// users -> avatar and username inner join message chat
		const updateQuery = `select bid.amount, lobby.likes from bid
		inner join lobby on lobby.id_item=bid.id_item
		where lobby.id=$1 order by bid.amount desc limit 1 `
		const update = await pool.query(updateQuery,values)
		res.status(200).json(update.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.get('/:lobby_id',async (req,res)=>{
	//retrieve the id of the lobby
	try{
		const currentLobby=req.params.lobby_id
		let values = [currentLobby]
	//retrieve data from the lobby_id
		const lobbyQuery = `select *from lobby where id=$1`
		const dataLobby= await pool.query(lobbyQuery,values)
		res.status(200).json(dataLobby.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.post('/bid',authentication, async (req,res)=>{
	//retrieve bid information
	const bidAmount = req.body.bidAmount
	const user_id = res.locals.user_id
	const lobby_id = req.body.lobby_id
	const date=DateTime.now().toSQL()

	//find items.id using lobby_id
	let valuesLobby=[lobby_id]
	const findItemQuery = `select items.id from lobby 
	inner join items on lobby.id_item=items.id 
	where lobby.id=$1`
	const findItem= await pool.query(findItemQuery,valuesLobby)

	//verify if this is the higher bid on this item
	let valuesItem=[findItem.rows[0]["id"]]
	const findHigherBidQuery=`select amount from bid where id_item=$1 order by amount desc limit 1`
	const higherBid=await pool.query(findHigherBidQuery,valuesItem)
	if (higherBid.rows[0]['amount']<bidAmount){

	//update data on table bid
		try{
			//delete previous bid -- remove ask by louis
			/*const deleteQuery = `delete from bid where id_bidder=${user_id} and id_item=${findItem.rows[0]["id"]}`
			const deletePreviousBid = await connect(deleteQuery)*/
			let valuesBid=[user_id,[findItem.rows[0]["id"]],date,bidAmount]
			//insert new bid
			const bidQuery = `insert into bid (id_bidder,id_item,created_at,amount) values 
			($1,$2,$3,$4)`
			const updateBid= await pool.query(bidQuery,valuesBid)

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

router.post('/like',authentication, async(req,res)=>{
	//retrieve like informations
	const user_id=res.locals.user_id
	const lobby_id=req.body.lobby_id

	let values=[user_id,lobby_id]

	// verify if this is the first like on this lobby by this user
	const searchLikeQuery=`select *from likes_to_users where id_user=$1 and id_lobby=$2`
	const searchLike= await pool.query(searchLikeQuery,values)

	if (searchLike.rows.length>0){
		res.status(401).json({message : 'error, this user already liked this lobby'})
	}
	else {
		// insert data into likes_to_users

		const likeToUsersQuery = `insert into likes_to_users (id_user,id_lobby) VALUES ($1,$2)`
		const likeToUsers= await pool.query(likeToUsersQuery,values)

		// insert data into lobby

		const likeLobbyQuery = `update lobby set likes=likes+1 where id=$1`
		const likeLobby=await pool.query(likeLobbyQuery,[lobby_id])

		res.status(201).json({message : 'like successfully added'})
	}
})

router.delete('/like',authentication, async(req,res)=>{
	//retrieve like informations
	const user_id=res.locals.user_id
	const lobby_id=req.body.lobby_id

	// delete the line if exist
	try{

	const searchLikeQuery=`select *from likes_to_users where id_user=$1 and id_lobby=$2`
	const searchLike= await pool.query(searchLikeQuery,[user_id,lobby_id])

	if(searchLike.rows.length>0) {
	//remove line from like_to_users
	const deleteLikeQuery=`delete from likes_to_users where id_user=$1 and id_lobby=$2`
	const deleteLike= await pool.query(deleteLikeQuery,[user_id,lobby_id])

	//decrease the like amount of the lobby
	const decreaseLikeQuery=`update lobby set likes=likes-1 where id=$1`
	const decreaseLike=await pool.query(decreaseLikeQuery,[lobby_id])

	res.status(201).json({message : 'like successfully removed'})
}
else {
	res.status(401).json({message : 'no like associated'})
}
}
catch(err){
	console.log(err)
	res.status(404).json({message : "error, contact webmaster "})
}	
	
})

export default router