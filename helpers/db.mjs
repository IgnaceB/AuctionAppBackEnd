import pg from 'pg'
const {Client}=pg
import dotenv from 'dotenv'
dotenv.config()

const client = new Client({
	user: process.env.user,
	host: process.env.host,
	database: process.env.database,
	password: process.env.password,
	port: process.env.port,
})

const connection = async (myQuery)=>{
	const connect = await client.connect()
	const response = await client.query(myQuery)
	console.log(response.rows[0])
	return response
	client.end()
}

export default connection