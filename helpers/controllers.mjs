import express from 'express'
import connect from '../helpers/db.mjs'
import {DateTime} from 'luxon'
import pkg from '@sendgrid/mail'
const sgMail = pkg
import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'

sgMail.setApiKey(process.env.sendgridKey)

//middlewar authenticate JWT

export const mailSender = async (msg) =>{
	try {
		await sgMail.send(msg)
		console.log('email sent')}
		catch(err){
			throw err
		}

}




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
			
			user_id=(user)
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

export const IdRetriever=(req,res,next)=>{

	const token=req.headers.authentication

	let user_id 
			jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
			user_id=(user)
			res.locals.user_id=user_id
		})
		next()
	}		
	
	



//function to compare with time now

const compareTimeNow = (table, column, next )=>{
	let now = DateTime.now().toSQL()
	const query=`select *from ${table} where ${column}`
	const response = connect(query)

	const date=response
}
