/*
    JSMacros Tree Farm Bot
    Author: BattleDog249
            battledog249@proton.me
            BattleDog249#9512
*/

//Variables used to locate bot
startingX = Player.getPlayer().getX();
startingZ = Player.getPlayer().getZ();
currentX = Player.getPlayer().getX();
currentZ = Player.getPlayer().getZ();

//Set distance apart of each tree
treeWidth = 4;

//Variable used to calculate distance to stop in front of tree
anchorZ = startingZ + treeWidth;

//Variable used to calculate distance to stop in front of first tree of next row
anchorX = currentX - treeWidth;

//Variable used to set time in ticks it takes to break a log with selected tool
breakSpeed = 20;

//Variable used to set the farm length in blocks
farmLength = 16;

//Variable used to set the farm width in blocks; length of rows
farmWidth = 16;

//Set maximum height of tree
//Leave unchanged unless you know what's up
treeMaxHeight = 2;

//Set to integer of cardinal direction when facing first tree from lodestone
//South: 0, West: 90, North: 180, East: 270
rowDirection = 0;

//Set to integer of cardinal direction of the first change of direction of tree farm
//South: 0, West: 90, North: 180, East: 270
turnDirection = 90;



//Function to walk row and break potential leaves
function walkRow(direction){
    Player.getPlayer().lookAt(direction, 0);    //Looks in correct direction
    KeyBind.keyBind('key.forward', true);       //Begin moving forward
    KeyBind.keyBind('key.attack', true);        //Begin breaking leaves between trees
}

//Function to harvest a single tree
function chopTree(direction){
    KeyBind.keyBind('key.forward', false);      //Stop walking to chop
    Player.getPlayer().lookAt(direction, 75)    //Look down at bottom log block
    Client.waitTick(4);                         //Buffer to successfully break bottom block
    KeyBind.keyBind('key.attack', true);        //Beginning chopping bottom log block
    Client.waitTick(breakSpeed);                //Chop for amount of time it takes to break log with selected tool
    Player.getPlayer().lookAt(direction, 0)     //Look at second log block
    Client.waitTick(breakSpeed);                //Chop for amount of time it takes to break log with selected tool
    KeyBind.keyBind('key.attack', false);       //Stop chopping to walk forward under tree
    KeyBind.keyBind('key.forward', true);       //Start walking under tree
    Client.waitTick(3);                         //Should be time it takes in ticks to walk 1 block; not sure exact value rn
    KeyBind.keyBind('key.forward', false);      //Stop under tree
    Player.getPlayer().lookAt(direction, -90)   //Look straight up
    KeyBind.keyBind('key.attack', true);        //Begin chopping rest of tree
    Client.waitTick(breakSpeed * treeMaxHeight);//Time it takes to chop maximum height tree
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
}

//Function to harvest an entire row of farm
function harvestRow(direction){
    while((currentZ < (startingZ + farmWidth - 1)) == true){
        currentZ = Player.getPlayer().getZ();           //Acquires current Z coordinate
        walkRow(direction);                             //Call walkRow function
        if(currentZ >= anchorZ){                        //If at beginning of tree, start chopping
            chopTree(direction);                        //Call chopTree function
            anchorZ = currentZ + treeWidth + 1;         //Used to calculate location of next tree
        }
        Client.waitTick(1);                             //Prevents crash
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Completed harvestRow()");
}

//Function to move to next row and harvest the first tree
function nextRow(direction){
    while((currentX > (startingX - treeWidth - 1)) == true){
        currentX = Player.getPlayer().getX();           //Acquires current X coordinate
        walkRow(direction);                             //Call walkRow function
        if(currentX <= anchorX){                        //If at beginning of first tree in row, start chopping
            chopTree(direction);                        //Call chopTree function
            anchorX = currentX - treeWidth - 1;         //Used to calculate location of next tree
        }
        Client.waitTick(1);                             //Prevents crash
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Completed nextRow()");
}



//Script start
if((rowDirection == 0 || rowDirection == 90 || rowDirection == 180 || rowDirection == 270) && (turnDirection == 0 || turnDirection == 90 || turnDirection == 180 || turnDirection == 270)){     //Checks for valid input
    harvestRow(rowDirection)
    nextRow(turnDirection)
    if(rowDirection == 0 || rowDirection == 90){    //Harvest row in reverse direction
        reverseRowDirection = rowDirection
        reverseRowDirection += 180
        harvestRow(reverseRowDirection)
    } else if(rowDirection == 180 || rowDirection == 270){
        reverseRowDirection = rowDirection
        reverseRowDirection -= 180
        harvestRow(reverseRowDirection)
    } else {
        Chat.log("ERROR: Reverse direction incorrect!")
    }
    Chat.log("LOG: Script completed successfully!")
} else {
    Chat.log("ERROR: Invalid rowDirection and/or turnDirection!")
}