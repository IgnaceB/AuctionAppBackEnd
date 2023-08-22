import express from 'express'
import cors from 'cors'
import connect from './helpers/db.mjs'

console.log("ca corse")
const PORT = 3000
const app = express()

/*const corsOption=({
	http://example.com
})*/

app.use(cors())


app.get("/", async (req, res)=>{
	console.log("ca route")
	const response = await connect("select *from users")
	res.status(200).json(response)
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})