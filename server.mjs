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
	console.log(response.rows[0])
	res.send(response.rows[0])
})

app.listen(PORT,()=>{
	console.log(`API running on port ${PORT}`)
})