import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()


//display all the biddings of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the items table
		const userQuery = `select *from items where id_seller='${currentUser}'`
		const dataUser= await connect(userQuery)

		res.status(200).json(dataUser.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

//create new item in the items table
router.post('/',async (req,res)=>{
	const bodyData={
		id_seller : req.body.user_id,
		itemName : req.body.itemName,
		auctionStart : req.body.auctionStart,
		auctionDuration : req.body.auctionDuration,
		itemDescription : req.body.itemDescription,
		itemLink : req.body.coverLobby
	}
	let now = DateTime.now().toSQL()


	try{
		const createItemQuery=`insert into items (id_seller, name, auction_start, auction_duration, description, cover_lobby, created_at, status)
		VALUES ('${bodyData.id_seller}','${bodyData.itemName}','${bodyData.auctionStart}','${bodyData.auctionDuration}','${bodyData.itemDescription}','${bodyData.itemLink}','${now}','0')`
		const createItem= await connect(createItemQuery)
		res.status(200).json({message : `item added`})
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:err})
	}})

router.patch('/',async (req,res)=>{
	
	const bodyData={
		name : req.body.newItemName,
		auction_start : req.body.newAuctionStart,
		auction_duration : req.body.newAuctionDuration,
		description : req.body.newItemDescription,
		cover_lobby : req.body.newCoverLobby
	}

	const idUser=req.body.user_id
	const idItem=req.body.item_id
	let now = DateTime.now().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=${idUser} and id=${idItem}`
	const verification = await connect(verifQuery)

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=${idItem} `
		const timeRequest = await connect(timeQuery)
		console.log(timeRequest.rows[0].auction_start)
		console.log(now)
		if (timeRequest.rows[0].auction_start.valueOf()>now){
			

	//define the array out of the scope of the function
			let array=[]

	//construct an array containing [name='value',name2='value2'] -> not update field not send in the request
			Object.keys(bodyData).forEach(key=>{
				if (bodyData[key]!=undefined){
					array.push(`${key}='${bodyData[key]}'`)
				}
			})

	//starting building the string queryUser that will contain the sql query
	// 'update users set name='value', name2='value2' where id=idUser' 
			let queryUpdateItem="update items set "
			for (let i=0;i<array.length;i++){
		//filter on the last element of the array to remove ',' and add the end of request 
				if (i==array.length-1){
					queryUpdateItem+=array[i]+` where id=${idItem}`
				}
				else {
					queryUpdateItem+=' '+array[i]+', '
				}
			}
			console.log(queryUpdateItem)

			try{
				const updateItem= await connect(queryUpdateItem)
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

router.delete('/',async (req,res)=>{
	

	const idUser=req.body.user_id
	const idItem=req.body.item_id
	let now = DateTime.now().valueOf()

    //verification if the user is the seller on the items table 

	const verifQuery=`select *from items where id_seller=${idUser} and id=${idItem}`
	const verification = await connect(verifQuery)

	if (verification.rows.length>0){

		// verification if the auction didn't start yet
		const timeQuery = `select auction_start from items where id=${idItem} `
		const timeRequest = await connect(timeQuery)

		if (timeRequest.rows[0].auction_start>now){
			
			try{
				//delete entry on item table
				const deleteQuery = `delete from items where id=${idItem}`
				const deleteItem= await connect(deleteQuery)
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