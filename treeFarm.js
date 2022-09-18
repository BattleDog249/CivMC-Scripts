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
anchorZ_NS = startingZ + treeWidth //+ 0.35;
anchorZ_SN = startingZ - treeWidth //- 0.35;

//Variable used to calculate distance to stop in front of first tree of next row
anchorX_EW = currentX - treeWidth;
anchorX_WE = currentX + treeWidth;

//Variable used to set time in ticks it takes to break a log with selected tool
breakSpeed = 20;

//Variable used to set the farm length in blocks; length of farm on X axis
farmLength = 16;

//Variable used to set the farm width in blocks; length of farm on Z axis
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
    //Chat.log("LOG: Starting walkRow()");
    Player.getPlayer().lookAt(direction, 0);                //Looks in correct direction
    KeyBind.keyBind('key.forward', true);                   //Begin moving forward
    KeyBind.keyBind('key.attack', true);                    //Begin breaking leaves between trees
    //Chat.log("LOG: Finished walkRow()");
}

//Function to harvest a single tree
function chopTree(direction){
    Chat.log("LOG: Starting chopTree()");
    KeyBind.keyBind('key.forward', false);                  //Stop walking to chop
    Player.getPlayer().lookAt(direction, 75);               //Look down at bottom log block
    Client.waitTick(4);                                     //Buffer to successfully break bottom block
    KeyBind.keyBind('key.attack', true);                    //Beginning chopping bottom log block
    Client.waitTick(breakSpeed);                            //Chop for amount of time it takes to break log with selected tool
    Player.getPlayer().lookAt(direction, 0);                //Look at second log block
    Client.waitTick(breakSpeed);                            //Chop for amount of time it takes to break log with selected tool
    KeyBind.keyBind('key.attack', false);                   //Stop chopping to walk forward under tree
    KeyBind.keyBind('key.forward', true);                   //Start walking under tree
    Client.waitTick(3);                                     //Should be time it takes in ticks to walk 1 block; not sure exact value rn
    KeyBind.keyBind('key.forward', false);                  //Stop under tree
    Player.getPlayer().lookAt(direction, -90);              //Look straight up
    KeyBind.keyBind('key.attack', true);                    //Begin chopping rest of tree
    Client.waitTick(breakSpeed * treeMaxHeight);            //Time it takes to chop maximum height tree
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished chopTree()");
}

//Function to harvest an entire row of farm, from North to South
function harvestRowNS(direction){
    Chat.log("LOG: Starting harvestRowNS()");
    if(startingX != currentX){                              //If at the beginning of NEW row
        Chat.log("LOG: Detected new row, assigning newStartingZ!");
        newStartingZ = currentZ;
        newAnchorZ_NS = newStartingZ + treeWidth;
        while((currentZ < (newStartingZ + farmWidth - 1)) == true){
            currentZ = Player.getPlayer().getZ();           //Acquires current Z coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentZ >= newAnchorZ_NS){                  //If at beginning of tree, start chopping
                chopTree(direction);                        //Call chopTree function
                newAnchorZ_NS = currentZ + treeWidth + 1;   //Used to calculate location of next tree
            }
            Client.waitTick(1);                             //Prevents crash
        }
    } else {                                                //Executes at FIRST row
        while((currentZ < (startingZ + farmWidth - 1)) == true){
            currentZ = Player.getPlayer().getZ();           //Acquires current Z coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentZ >= anchorZ_NS){                     //If at beginning of tree, start chopping
                chopTree(direction);                        //Call chopTree function
                anchorZ_NS = currentZ + treeWidth + 1;      //Used to calculate location of next tree
            }
            Client.waitTick(1);                             //Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished harvestRowNS()");
}

//Function to harvest an entire row of farm, from South to North
function harvestRowSN(direction){
    Chat.log("LOG: Starting harvestRowSN()");
    if(startingX != currentX){                              //If at the beginning of NEW row
        Chat.log("LOG: Detected new row, assigning newStartingZ!");
        newStartingZ = currentZ;
        newAnchorZ_SN = newStartingZ - treeWidth;
        while((currentZ > (newStartingZ - farmWidth + 1)) == true){
            currentZ = Player.getPlayer().getZ();           //Acquires current Z coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentZ <= newAnchorZ_SN){                  //If at beginning of tree, start chopping
                chopTree(direction);                        //Call chopTree function
                newAnchorZ_SN = currentZ - treeWidth - 1;   //Used to calculate location of next tree
            }
            Client.waitTick(1);                             //Prevents crash
        }
    } else {                                                //Executes at FIRST row
        while((currentZ > (startingZ - farmWidth + 1)) == true){
            currentZ = Player.getPlayer().getZ();           //Acquires current Z coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentZ <= anchorZ_SN){                     //If at beginning of tree, start chopping
                chopTree(direction);                        //Call chopTree function
                anchorZ_SN = currentZ - treeWidth - 1;      //Used to calculate location of next tree
            }
            Client.waitTick(1);                             //Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished harvestRowSN()");
}

//Function to move to next row and harvest the first tree, from East to West
function nextRowEW(direction){
    Chat.log("LOG: Starting nextRowEW()");
    if(startingX != currentX){                              //If at 2nd+ turn
        Chat.log("LOG: Detected 2nd+ row, assigning newStartingX!");
        newStartingX = currentX;
        newAnchorX_EW = newStartingX - treeWidth;
        while((currentX > (newStartingX - treeWidth - 1)) == true){
            currentX = Player.getPlayer().getX();           //Acquires current X coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentX <= newAnchorX_EW){                  //If at beginning of first tree in row, start chopping
                chopTree(direction);                        //Call chopTree function
                newAnchorX_EW = currentX - treeWidth - 1;   //Used to calculate location of next tree
            }
            Client.waitTick(1);   
        }
    } else {                                                //Execute at FIRST turn
        Chat.log("LOG: First nextRowEW() executing!");
        while((currentX > (startingX - treeWidth - 1)) == true){
            currentX = Player.getPlayer().getX();           //Acquires current X coordinate
            walkRow(direction);                             //Call walkRow function
            if(currentX <= anchorX_EW){                     //If at beginning of first tree in row, start chopping
                chopTree(direction);                        //Call chopTree function
                anchorX_EW = currentX - treeWidth - 1;      //Used to calculate location of next tree
            }
            Client.waitTick(1);                             //Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished nextRowEW()");
}

//Function to move to next row and harvest the first tree, from West to East UNTESTED
function nextRowWE(direction){
    Chat.log("LOG: Starting nextRowWE()");
    while((currentX < (startingX + treeWidth + 1)) == true){
        currentX = Player.getPlayer().getX();               //Acquires current X coordinate
        walkRow(direction);                                 //Call walkRow function
        if(currentX >= anchorX_WE){                         //If at beginning of first tree in row, start chopping
            chopTree(direction);                            //Call chopTree function
            anchorX_WE = currentX + treeWidth + 1;          //Used to calculate location of next tree
        }
        Client.waitTick(1);                                 //Prevents crash
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished nextRowWE()");
}



//Script start
if(rowDirection == 0 && turnDirection == 90){               //If farm north->south and turns west
    //Repeat for entire length of farm
    while(currentX > startingX - farmLength + treeWidth + 1){
        Chat.log("LOG: Starting North-South, with West turns!");
        reverseRowDirection = rowDirection;
        reverseRowDirection += 180;
        harvestRowNS(rowDirection);
        if(currentX > startingX - farmLength + treeWidth + 1){  //Stops bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
        harvestRowSN(reverseRowDirection);
        if(currentX > startingX - farmLength + treeWidth + 1){  //Stops bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
} else if(rowDirection == 180 && turnDirection == 270){     //If farm south->north, turn west
    Chat.log("LOG: Starting South-North, with West turns!");
    harvestRowSN(rowDirection);
    nextRowWE(turnDirection);
    reverseRowDirection = rowDirection;
    reverseRowDirection += 180;
    harvestRowNS(reverseRowDirection);
    Chat.log("LOG: Script completed successfully!");
} else {
    Chat.log("ERROR: Invalid rowDirection and/or turnDirection!");
}