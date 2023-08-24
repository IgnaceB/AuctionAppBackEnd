import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'

//middlewar authenticate JWT

import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'

export const authentication=(req,res,next)=>{

	const token=req.headers.authentication


	let user_id 
	if (token==null){
		return res.sendStatus(401).json({message : 'user not connected'})
	}
	else {
		try {
			jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
			if (err) return res.sendStatus(401)
				else 

			user_id=(user.id)
			res.locals.user_id=user_id

			next()

		})
	}
			catch(err){
				throw err
				res.status(404).json({message : 'access denied'})
			}
		}
	}
		
	
	



//function to compare with time now

const compareTimeNow = (table, column, next )=>{
	let now = DateTime.now().toSQL()
	const query=`select *from ${table} where ${column}`
	const response = connect(query)

	const date=response
}
