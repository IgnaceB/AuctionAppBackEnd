import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

const router=express.Router()

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

router.patch('/',async (req,res)=>{
	//retrieve the new information and the id of the user
	const idUser=req.body.user_id
	const data={
		name:req.body.newName,
		phone:req.body.newPhone,
		address:req.body.newAddress,
		adress_nr:req.body.newAdress_nr,
		box : req.body.newBox,
	}

	let array=[]

	Object.keys(data).forEach(key=>{
		if (data[key]!=undefined){
			array.push(`${key}='${data[key]}'`)
		}
	})

	let queryUser="update users set "
	for (let i=0;i<array.length;i++){
		if (i==array.length-1){
			queryUser+=array[i]+` where id=${idUser}`
		}
		else {
			queryUser+=' '+array[i]+', '
		}
	}
	
	try{
		const updateUser = await connect(queryUser)
		res.status(200).json({message:'user correctly udpated'})
	}
	catch(err){
		console.log(err)
		res.status(404).json({message:'connection error, contact webmaster'})
	}
})
export default router