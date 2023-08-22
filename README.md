# AuctionAppBackEnd

### Login

` ***/login (POST)*** 
	body.email
	body.password
		-> json [{
			user_id
			}] || status (401)`

` ***/signup (POST)***
	body.name
	body.mail
	body.phone
	body.address
	body.adress_nr
	body.box
		-> json[{
			user_id
			}] || status(401)`

### All Lobby

` ***/allLobby (GET)***
		-> JSON [{
		}]`

### One Lobby

` ***/lobby (GET)***
		-> JSON [{	
		}]`

` ***/lobby/bid (POST)***
	body.bidAmount
	body.user_id
	body.lobby_id
		-> JSON [{
			actualAmount
			}]`

` ***/lobby/:lobbyId/like (POST)***
	body.user_id
	body.lobby_id
		-> status(201)`

### Historic

`***/historic (GET)***
	-> JSON [{
		}]`

### Account 

`***/account/:user_id (GET)***
	-> JSON [{
		}] `

`***/account (UPDATE)***
	body.user_id
	body.newName
	body.newPhone
	body.newAddress
	body.newAdress_nr
	body.newBox
		-> status(201)`

### My Biddings

`***/my_bidding/:user_id (GET)***
	-> JSON [{
		}]`

`***/my_bidding/payment (POST)***
	body.id_item
	body.id_user
		-> status(201)`

### My Auctions

`***/my_auction/:user_id (GET)***
	-> JSON [{
		}]`

`***/my_auction (POST)***
	body.user_id
	body.itemName
	body.auctionStart
	body.auctionDuration
	body.itemDescription
	body.itemLink
		-> status(201)`






