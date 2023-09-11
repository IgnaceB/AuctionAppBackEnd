import express from 'express'
import pool from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import {authentication} from '../helpers/controllers.mjs'
import {lobbyCreationQueue} from '../server.mjs'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the items table
		const userQuery = `select *, (select max(amount) from bid 
		as max_bid where max_bid.id_item = items.id group by id_item ) as max_amount
		from items where id_seller=$1`
		const dataUser= await pool.query(userQuery,[currentUser])

		res.status(200).json(dataUser.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

//create new item in the items table
router.post('/',authentication,async (req,res)=>{
	
	const bodyData={
		id_seller : res.locals.user_id,
		itemName : req.body.itemName,
		auctionStart : req.body.auctionStart,
		auctionDuration : req.body.auctionDuration,
		itemDescription : req.body.itemDescription,
		coverLobby : req.body.coverLobby,
		tags : req.body.tags,
		pictures : req.body.pictures
	}
	let now = DateTime.utc().toSQL()
	console.log(bodyData.id_seller)
	try{
		//create the item in the item table
		const createItemQuery=`insert into items (id_seller, name, auction_start, auction_duration, description, cover_lobby, created_at, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`
		const createItem= await pool.query(createItemQuery,[bodyData.id_seller,bodyData.itemName,bodyData.auctionStart,bodyData.auctionDuration,bodyData.itemDescription,bodyData.coverLobby,now,0])
		

		//retrieve id of just created item

		const getItemIdQuery=`select *from items where id_seller=$1 order by id desc limit 1`
		const getItemID= await pool.query(getItemIdQuery,[bodyData.id_seller])

		//creating one entry for each tag in the bodyData.tag array in the table items_tags
		if(bodyData.tags){
		for (let i=0;i<bodyData.tags.length;i++){
			const createEntryQuery=`insert into items_tags (id_item, tag) VALUES ($1,$2)`
			const createEntry = await pool.query(createEntryQuery,[getItemID.rows[0]["id"],bodyData.tags[i]])
		}}

		//creating one entry for each picture in the bodyData.pictures array in the table items_pictures
		if (bodyData.pictures){
		for (let i=0;i<bodyData.pictures.length;i++){
			const createEntryQuery=`insert into items_pictures (id_item, link) VALUES ($1,$2)`
			const createEntry = await pool.query(createEntryQuery,[getItemID.rows[0]["id"],bodyData.pictures[i]])
		}}

		//insert a new job in the lobbyCreationQueue who will launch a lobby when the auctionStart date is reached

		const AddTaskToBullQueue = async () => {
			console.log(DateTime.fromISO(bodyData.auctionStart).valueOf()-DateTime.utc().valueOf())
  		await lobbyCreationQueue.add({ 
  		 name: bodyData.itemName,
  		 id_item: getItemID.rows[0]["id"],
  		 created_at : DateTime.utc(),
  		 end_at : bodyData.auctionDuration,
  		 likes : 0,
  		 cover_lobby : bodyData.coverLobby }, 
  		 //setting up delay value of date of start - value of date now
  		 {delay: DateTime.fromISO(bodyData.auctionStart).valueOf()-DateTime.utc().valueOf()
  		});
  		console.log(DateTime.fromISO(bodyData.auctionStart))
  		console.log('demand for creation lobby init')
};		

		AddTaskToBullQueue()
		
		res.status(200).json({message : `item added`})
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:err})
	}})

router.patch('/',authentication, async (req,res)=>{
	
	const bodyData={
		name : req.body.newItemName,
		auction_start : req.body.newAuctionStart,
		auction_duration : req.body.newAuctionDuration,
		description : req.body.newItemDescription,
		cover_lobby : req.body.newCoverLobby
	}

	const idUser=res.locals.user_id
	const idItem=req.body.item_id
	let now = DateTime.utc().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=$1 and id=$2`
	const verification = await pool.query(verifQuery,[idUser,idItem])

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=$1 `
		const timeRequest = await pool.query(timeQuery,[idItem])
	
		if (timeRequest.rows[0].auction_start.valueOf()>now){
			

	//define the array out of the scope of the function
			let array=[]
			let count=1

	//construct an array containing [name='value',name2='value2'] -> not update field not send in the request

			Object.keys(bodyData).forEach(key=>{
				if (bodyData[key]!=undefined){
					array.push(`${key}=$${count}`)
				}
				count++
			})

	//starting building the string queryUser that will contain the sql query
	// 'update users set name='value', name2='value2' where id=idUser' 
			let queryUpdateItem="update items set "
			for (let i=0;i<array.length;i++){
		//filter on the last element of the array to remove ',' and add the end of request 
				if (i==array.length-1){
					queryUpdateItem+=array[i]+` where id=$6`
				}
				else {
					queryUpdateItem+=' '+array[i]+', '
				}
			}
			

			try{
				const updateItem= await pool.query(queryUpdateItem,[bodyData.name, bodyData.auction_start,bodyData.auction_duration,bodyData.description,bodyData.cover_lobby,idItem])
				res.status(200).json({message : 'item updated'})
			}
			catch(err){
				console.log(err)
				res.status(404).json({message:err})
			}
		}
		else {
			res.status(401).json({message:"auction already started"})
		}
	}
	else {
		res.status(404).json({message:"access denied"})
	}
})

router.patch('/pictures',authentication, async (req,res)=>{
	
	const newPictures = req.body.newPictures
	const idUser=res.locals.user_id
	const idItem=req.body.item_id
	let now = DateTime.utc().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=$1 and id=$2`
	const verification = await pool.query(verifQuery,[idUser,idItem])

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=$1 `
		const timeRequest = await pool.query(timeQuery,[idItem])
	
		if (timeRequest.rows[0].auction_start.valueOf()>now){
				try{
				//delete previous pictures
				const queryDeletePictures=`delete from items_pictures where id_item=$1`
				const deletePictures= await pool.query(queryDeletePictures,[idItem])

				//looping on the number of added pictures and creating a line in the table items_pictures
				newPictures.forEach(async(element)=>{
					const queryUpdatePictures=`insert into items_pictures (id_item, link) VALUES ($1,$2)`
					const updatePictures= await pool.query(queryUpdatePictures,[idItem,element])
				})
				
				res.status(200).json({message : 'pictures updated'})
			}
			catch(err){
				console.log(err)
				res.status(404).json({message:err})
			}

		}
		else {
			res.status(401).json({message:"auction already started"})
		}
	}
	else {
		res.status(404).json({message:"access denied"})
	}
})

router.patch('/tags',authentication, async (req,res)=>{
	
	const newTags = req.body.newTags
	const idUser=res.locals.user_id
	const idItem=req.body.item_id
	let now = DateTime.utc().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=$1 and id=$2`
	const verification = await pool.query(verifQuery,[idUser,idItem])

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=$1 `
		const timeRequest = await pool.query(timeQuery,[idItem])
	
		if (timeRequest.rows[0].auction_start.valueOf()>now){
				try{
				//delete previous Tags
				const queryDeleteTags=`delete from items_tags where id_item=$1`
				const deleteTags= await pool.query(queryDeleteTags,[idItem])

				//looping on the number of added Tags and creating a line in the table items_Tags
				newTags.forEach(async(element)=>{
					const queryUpdateTags=`insert into items_tags (id_item, tag) VALUES ($1,$2)`
					const updateTags= await pool.query(queryUpdateTags,[idItem,element])
				})
				
				res.status(200).json({message : 'tags updated'})
			}
			catch(err){
				console.log(err)
				res.status(404).json({message:err})
			}

		}
		else {
			res.status(401).json({message:"auction already started"})
		}
	}
	else {
		res.status(404).json({message:"access denied"})
	}
})

router.delete('/',authentication, async (req,res)=>{
	

	const idUser=res.locals.user_id
	const idItem=req.body.item_id
	let now = DateTime.utc().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=$1 and id=$2`
	const verification = await pool.query(verifQuery,[idUser,idItem])

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=$1 `
		const timeRequest = await pool.query(timeQuery,[idItem])

		if (timeRequest.rows[0].auction_start>now){
			
			try{

				//delete entry on pictures table
				const deletePicQuery = `delete from items_pictures where id_item=$1`
				const deletePicture = await pool.query (deletePicQuery,[idItem])

				//delete entry on tags table
				const deleteTagsQuery = `delete from items_tags where id_item=$1`
				const deleteTags = await pool.query (deleteTagsQuery,[idItem])

				//delete entry on item table
				const deleteQuery = `delete from items where id=$1`
				const deleteItem= await pool.query(deleteQuery,[idItem])

				res.status(200).json({message : 'item deleted'})
			}
			catch(err){
				console.log(err)
				res.status(404).json({message:err})
			}
		}
		else {
			res.status(401).json({message:"auction already started"})
		}
	}
	else {
		res.status(404).json({message:"access denied"})
	}
})



export default router