import express from 'express'
import connect from '../helpers/db.mjs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {authentication} from '../helpers/controllers.mjs'

const router=express.Router()

router.post('/login',async(req,res)=>{

	//Retrieve data from request
	const userEmail=req.body.email
	const userPassword=req.body.password

	//Retrieve id and check if an entry exist in the users table for this email
	const usersData= await connect(`select id from users where email='${userEmail}'`)
	console.log(usersData.rows[0])

	if(usersData.rows.length>0){
		//Retrieve crypted password from the login table using the users.id

		const loginData=await connect(`select password from login where id_user='${usersData.rows[0]["id"]}'`)
		
		//check crypted password with introduce password
		const checkPassword= await bcrypt.compare(userPassword, loginData.rows[0]["password"])
		
		if (checkPassword){

		//generate and send jwt
			const accessToken=jwt.sign(usersData.rows[0]["id"],process.env.ACCESS_TOKEN_SECRET)

			res.status(201).json({id : usersData.rows[0]["id"], token : accessToken})
		}
		else {


			res.status(401).json({message : "incorrect password"})
		}

	}
	else {
		res.status(401).json({message : "incorrect email"})
	}
})


router.post('/signup',async(req,res)=>{

	//retrieve data from request
	const email=req.body.email
	const password=req.body.password
	const name=req.body.name
	const phone=req.body.phone
	const address=req.body.address
	const adress_nr=req.body.adress_nr
	const box = req.body.box
	const avatar = req.body.avatar
	const username = req.body.username

	//generate crypted password
	const salt = await bcrypt.genSalt(10)
	const hashPassword= await bcrypt.hash(password, salt)
	// verify if the user exist
	const checkEmail= await connect(`select *from users where email='${email}'`)

	if(checkEmail.rows[0]){
		
		res.status(401).json({message : "user already exist"})
	}
	else {
		try {
		//update table user with the data provided
			const queryUser=`insert into users (email, name, phone, address, adress_nr, box, avatar, username)
			VALUES ('${email}','${name}','${phone}','${address}','${adress_nr}','${box}','${avatar}','${username}')`
			const createUser = await connect(queryUser)

		//retrieve id of the just created user
			const idUser=await connect(`select id from users where email='${email}'`)

		//update table login with id and crypted password 
			const queryLogin=`insert into login (id_user,password) VALUES
			('${idUser.rows[0]["id"]}','${hashPassword}')`
			const createLogin=await connect(queryLogin)

			return res.status(201).json({message : "user successfully created"})
		}
		catch(err){
			return res.status(404).json({message:"connection failed, contact admin"})
		}
	}
})

export default router