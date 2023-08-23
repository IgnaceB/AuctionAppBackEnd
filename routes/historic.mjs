import express from 'express'
import connect from '../helpers/db.mjs'

const router=express.Router()

router.get('/:page',async (req,res)=>{
	//retrieve the nr of the page we want to display, setting up nr of entity by page
	// and calculate the nr of the first item to be display
	try{
	const currentPage=req.params.page
	let nrEntity = 50
	let startSearch = nrEntity*currentPage

	//retrieve data from db from startSearch to startSearch+nrEntity
	const itemsQuery = `select *from items order by id offset ${startSearch} limit ${nrEntity}`
	const dataItems= await connect(itemsQuery)

	res.status(200).json(dataItems.rows)
}
catch(err){
	console.log(err)
	res.status(404).json({message:'connection error, contact webmaster'})
}
})

export default router