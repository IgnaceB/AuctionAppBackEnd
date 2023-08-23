# AuctionAppBackEnd

https://auction.oxomoto.co/

### Login  

##### /login (POST)  
 INPUT |
- body.email  :exclamation:
- body.password  :exclamation:

OUTPUT |
 - status(201).json({  
id : integer,  
token : string,
}) || status(401).json({message : string})

##### /signup (POST)
 INPUT |
- body.name :exclamation:
- body.mail  :exclamation:
- body.phone  
- body.address  
- body.adress_nr  
- body.box  
- body.password :exclamation:

OUTPUT |
- status(201).json[{  
			message : string 
			}] || status(401).json({message : string}) || status(404).json({message : string})

### All Lobby  

##### /allLobby/:page (GET)
OUTPUT |
- status(200).JSON [{  
}]

### One Lobby  

##### /lobby/:lobby_id (GET)
OUTPUT |
- status(200).JSON [{	  
		}]

##### /lobby/bid (POST) 
INPUT |
- body.bidAmount  :exclamation:
- body.user_id  :exclamation:
- body.lobby_id :exclamation:

OUTPUT|
- statuts(201).JSON [{  
			actualAmount : number 
			}]

##### /lobby/:lobbyId/like (POST)
INPUT|
- body.user_id  :exclamation:
- body.lobby_id  :exclamation:

OUTPUT |
- status(201)

### Historic

##### /historic/:page (GET)  
OUTPUT |
- status(200).JSON [{  
		}]

### Account   

##### /account/:user_id (GET)
OUTPUT |
- status(200).JSON [{  
		}] 

##### /account (UPDATE)
INPUT |
- body.user_id  :exclamation:
- body.newName  
- body.newPhone  
- body.newAddress  
- body.newAdress_nr  
- body.newBox

OUTPUT |
- status(201)

### My Biddings  

##### /my_bidding/:user_id (GET) 
OUTPUT |
- statuts(200).JSON [{  
		}]  

##### /my_bidding/payment (POST)  
INPUT |
 - body.id_item  :exclamation:
- body.id_user  :exclamation:

OUTPUT |
-  status(201)  

### My Auctions  

##### /my_auction/:user_id (GET) 
OUTPUT |
- status(200).JSON [{  
		}]  

##### /my_auction (POST)
INPUT |
- body.user_id  :exclamation:
- body.itemName  :exclamation:
- body.auctionStart  :exclamation:
- body.auctionDuration  :exclamation:
- body.itemDescription  
- body.itemLink

OUTPUT |
- status(201)  

##### /my_auction (UPDATE)
INPUT |
- body.user_id  :exclamation:
- body.newItemName   
- body.newAuctionStart  
- body.newAuctionDuration  
- body.newItemDescription  
- body.newItemLink  

OUTPUT |
- status(201)   

##### /my_auction (DELETE)
INPUT |
- body.user_id  :exclamation:
- body.item_id  :exclamation:

OUTPUT |
- status(200)   





