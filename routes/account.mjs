import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()

import {authentication} from '../helpers/controllers.mjs'

//display de data of an user
router.get('/:user_id',async (req,res)=>{
	//retrieve the id of the user
	try{
		const currentUser=req.params.user_id

	//retrieve data from the users table
		const userQuery = `select *from users where id='${currentUser}'`
		const dataUser= await connect(userQuery)
		res.status(200).json(dataUser.rows)
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.patch('/',authentication,async (req,res)=>{
	//retrieve the new information and the id of the user
	const idUser=req.body.user_id


	const data={
		name:req.body.newName,
		phone:req.body.newPhone,
		address:req.body.newAddress,
		adress_nr:req.body.newAdress_nr,
		box : req.body.newBox,
	}
	//define the array out of the scope of the function
	let array=[]

	//construct an array containing [name='value',name2='value2'] -> not update field not send in the request
	Object.keys(data).forEach(key=>{
		if (data[key]!=undefined){
			array.push(`${key}='${data[key]}'`)
		}
	})

	//starting building the string queryUser that will contain the sql query
	// 'update users set name='value', name2='value2' where id=idUser' 
	let queryUser="update users set "
	for (let i=0;i<array.length;i++){
		//filter on the last element of the array to remove ',' and add the end of request 
		if (i==array.length-1){
			queryUser+=array[i]+` where id=${idUser}`
		}
		else {
			queryUser+=' '+array[i]+', '
		}
	}
	
	try{
		//update using the string queryUser
		const updateUser = await connect(queryUser)
		res.status(200).json({message:'user correctly udpated'})
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})

router.get('/like/:user_id',async(req,res)=>{
	try{
		const userId=req.params.user_id

		const searchLikeQuery = `select id_lobby from likes_to_users where id_user=${userId}`
		const searchLike = await connect(searchLikeQuery)

		res.status(201).json(searchLike.rows)
	}
	catch (err){
		res.status(404).json({message:err})
	}
})
export default router