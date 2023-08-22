# AuctionAppBackEnd

### Login

` ***/login (POST)*** 
	body.email
	body.password
		-> status(201).json [{
			user_id
			}] || status (401)`

` ***/signup (POST)***
	body.name
	body.mail
	body.phone
	body.address
	body.adress_nr
	body.box
		-> status(201).json[{
			user_id
			}] || status(401)`

### All Lobby

` ***/allLobby/:page (GET)***
		-> status(200).JSON [{
		}]`

### One Lobby

` ***/lobby/:lobby_id (GET)***
		-> status(200).JSON [{	
		}]`

` ***/lobby/bid (POST)***
	body.bidAmount
	body.user_id
	body.lobby_id
		-> statuts(201).JSON [{
			actualAmount
			}]`

` ***/lobby/:lobbyId/like (POST)***
	body.user_id
	body.lobby_id
		-> status(201)`

### Historic

`***/historic/:page (GET)***
	-> status(200).JSON [{
		}]`

### Account 

`***/account/:user_id (GET)***
	-> status(200).JSON [{
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
	-> statuts(200).JSON [{
		}]`

`***/my_bidding/payment (POST)***
	body.id_item
	body.id_user
		-> status(201)`

### My Auctions

`***/my_auction/:user_id (GET)***
	-> status(200).JSON [{
		}]`

`***/my_auction (POST)***
	body.user_id
	body.itemName
	body.auctionStart
	body.auctionDuration
	body.itemDescription
	body.itemLink
		-> status(201)`

`***/my_auction (UPDATE)***
	body.user_id
	body.newItemName
	body.newAuctionStart
	body.newAuctionDuration
	body.newItemDescription
	body.newItemLink
		-> status(201)`

`***/my_auction (DELETE)***
	body.user_id
	body.item_id
		-> status(200)`





