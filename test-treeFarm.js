/*
    JSMacros Tree Farm Bot
    
    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Variable used to set the distance apart of each tree
treeWidth = 4;

// Variable used to set time in ticks it takes to break a log with selected unenchanted tool + 5 for buffer
// Nothing: 65, Wooden: 35, Stone: 20, Iron: 15, Diamond: 13, Netherite: 12, Gold: 10
breakTime = 15;

// Variable used to set time in ticks it takes to break a leaf block with selected unenchanted tool + 7 for buffer
leafBreakTime = 13;

// Set amount of time it takes to recover from swing with an axe
// Wooden: 25, Gold: 20, Stone: 25, Iron: 23, Diamond: 20, Netherite: 20
recoveryBuffer = 20;

// Variable used to set the farm length in blocks; length of farm on X axis
// Mehri Oak Tree Farm: 76, Creative Test World: 76
farmLength = 76;

// Variable used to set the farm width in blocks; length of farm on Z axis
// Mehri Oak Tree Farm: 66, Creative Test World: 76
farmWidth = 66;

// Set to the maximum height of tree; should be 6 for oak I think
// The - 2 is to subtract the two bottom blocks already broken by the bot, so only change the first number if need be!
treeHeight = 6 - 2;

south = 0;
west = 90;
north = 180;
east = 270;

// Set to integer of cardinal direction when facing first tree from lodestone
// South: 0, West: 90, North: 180, East: 270
rowDirection = south;

// Set to integer of cardinal direction of the first change of direction of tree farm
// South: 0, West: 90, North: 180, East: 270
turnDirection = west;

// Set to tools to be used in harvest
logTool = "minecraft:iron_axe";
leafTool = "minecraft:stick"

// Set to sapling type to replant
sapling = "minecraft:oak_sapling";

// Function for equipping a given item
function pick(name, hotbar = null, dmg = -1) {
    inv = Player.openInventory();
    slots = inv.getMap();
    
    if (hotbar == null) {
        hotbar = inv.getSelectedHotbarSlotIndex();
    }
    
    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
    item = inv.getSlot(slot);
    dura = item.getMaxDamage() - item.getDamage();

    if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {
        inv.close();
        return true;
    }
    
    for (slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {
        let item = inv.getSlot(slot);
        if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {
            //Chat.log(`Found ${item.getItemId()} at slot ${slot}.`);
            inv.swap(slot, slots["hotbar"][hotbar]);
            Time.sleep(250);
            inv.setSelectedHotbarSlotIndex(parseInt(slot));
            inv.close();
            return true;
        }
    }
    inv.close();
    return false;
}

// walks to the centre of the given x, z coordinate. assumes flat y level
// if x, z is ommitted then centres the player on the current block
// precise=true attemts to walk to the exact coordinate rather than the centre of the block

function walkTo(x = null, z = null, precise = false, timeout = null) {
    pos = Player.getPlayer().getPos();
    if (x == null) {
        x = pos.x;
    }
    if (z == null) {
        z = pos.z;
    }
    if (precise) {
        tx = x;
        tz = z;
    } else {
        if (x < 0) {
            tx = parseInt(x) - 0.5;
        } else {
            tx = parseInt(x) + 0.5;
        }
        if (z < 0) {
            tz = parseInt(z) - 0.5;
        } else {
            tz = parseInt(z) + 0.5;
        }
    }
    Chat.log("walking to x: " + tx + ", z: " + tz);
    KeyBind.keyBind('key.forward', true);
    timer = 0;
    while (true) {
        Player.getPlayer().lookAt(tx, pos.y, tz);
        pos = Player.getPlayer().getPos();
        if (Math.abs(pos.x - tx) < 0.5 && Math.abs(pos.z - tz) < 0.5) {
            KeyBind.keyBind('key.sneak', false);
        }
        if (Math.abs(pos.x - tx) < 0.075 && Math.abs(pos.z - tz) < 0.075) {
            break;
        }
        Client.waitTick();
        timer += 1;
        if (timeout && timer > timeout) {
            Chat.log("walkTo timed out");
            KeyBind.keyBind('key.forward', false);
            KeyBind.keyBind('key.sneak', false);
            return false;
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.sneak', false);
    Client.waitTick(5);
    pos = Player.getPlayer().getPos();
    Player.getPlayer().getRaw().method_5814(tx, pos.y, tz);
    return true;
}

walkTo();

// Variables used to locate bot
//startingX = Player.getPlayer().getX();
//startingZ = Player.getPlayer().getZ();
currentX = Player.getPlayer().getX();
currentZ = Player.getPlayer().getZ();

// Variable used to calculate distance to stop in front of tree
//anchorZ_NS = startingZ + treeWidth;
//anchorZ_SN = startingZ - treeWidth;

// Variable used to calculate distance to stop in front of first tree of next row
//anchorX_EW = currentX - treeWidth;
//anchorX_WE = currentX + treeWidth;

// Starting corner of the tree farm
startX = -95;
startZ = 4;

// Opposite corner of the tree farm
endX = -105;
endZ = 14;

if (rowDirection == south || rowDirection == north) {
    if (startZ < endZ) {
        hyaw = 0;
        pyaw = 180;
        tree = startZ + treeWidth;  //TESTING
    } else {
        hyaw = 180;
        pyaw = 0;
        tree = startZ - treeWidth;  //TESTING
    }
} else if (rowDirection == west || rowDirection == east) {
    if (startX < endX) {
        hyaw = 0;
        pyaw = 180;
        tree = startX + treeWidth;  //TESTING
    } else {
        hyaw = 180;
        pyaw = 0;
        tree = startX - treeWidth;  //TESTING
    }
}

// Function to break potential leaves before walking
function chopLeaves(direction) {
    Player.getPlayer().lookAt(direction, 0);                // Looks in correct direction
    pick(leafTool);                                         // Equip tool used to break leaves
    KeyBind.keyBind('key.attack', true);                    // Begin breaking leaves between trees
    Client.waitTick(leafBreakTime * treeWidth);             // Wait to break all leaves between trees before walking; prevents weird glitches on CivMC
    KeyBind.keyBind('key.attack', false);                   // Stop breaking leaves between trees
}

// Function to walk to next tree
function nextTree(direction) {                                    
    //Player.getPlayer().lookAt(direction, 0);                // Looks in correct direction
    if (direction == south) {
        walkTo(direction, currentZ + treeWidth);
    } else if (direction == west) {
        walkTo(currentX - treeWidth, direction);
    } else if (direction == north) {
        walkTo(direction, currentZ - treeWidth);
    } else if (direction == east) {
        walkTo(currentX + treeWidth, direction);
    } else {
        Chat.log("ERROR: Broken walkRow() function!");
    }
}

// Function to plant a sapling
function replant(direction) {
    Player.getPlayer().lookAt(direction, 90);               // Look straight down
    pick(sapling);                                          // Equip sapling to replant
    Client.waitTick();
    KeyBind.keyBind('key.use', true);
    KeyBind.keyBind('key.use', false);
    Client.waitTick();
    Player.getPlayer().lookAt(direction, 0);
}

// Function to harvest a single tree
function chopTree(direction) {
    //Chat.log("LOG: Start - chopTree()");
    //KeyBind.keyBind('key.forward', false);                  // Stop walking to begin chopping
    pick(logTool);                                          // Equip tool used to break logs
    Client.waitTick(recoveryBuffer);                        // Buffer to successfully break next log
    Player.getPlayer().lookAt(direction, 75);               // Look down at bottom log
    KeyBind.keyBind('key.attack', true);                    // Beginning chopping bottom log
    Client.waitTick(breakTime);                             // Chop for amount of time it takes to break log with selected axe
    KeyBind.keyBind('key.attack', false);                   // Stop chopping bottom log
    Client.waitTick(recoveryBuffer);                        // Buffer to successfully break next log
    Player.getPlayer().lookAt(direction, 0);                // Look at middle log
    KeyBind.keyBind('key.attack', true);                    // Beginning chopping middle log
    Client.waitTick(breakTime);                             // Chop for amount of time it takes to break log with selected axe
    KeyBind.keyBind('key.attack', false);                   // Stop chopping to walk forward under tree
    Client.waitTick(recoveryBuffer);                        // Buffer to successfully break next log; potential fix for random trees not getting fully chopped?
    //Walk directly under tree
    if (direction == south) {
        walkTo(direction, currentZ + 1);
    } else if (direction == west) {
        walkTo(currentX - 1, direction);
    } else if (direction == north) {
        walkTo(direction, currentZ - 1);
    } else if (direction == east) {
        walkTo(currentX + 1, direction);
    } else {
        Chat.log("ERROR: Broken chopTree() function!");
    }
    //replant(direction);                                     // Replant sapling
    //pick(logTool);                                          // Equip tool used to break logs
    Player.getPlayer().lookAt(direction, -90);              // Look straight up
    KeyBind.keyBind('key.attack', true);                    // Begin chopping rest of tree
    Client.waitTick(breakTime * treeHeight + breakTime);    // Time it takes to chop maximum height tree
    KeyBind.keyBind('key.attack', false);                   // Stop chopping tree
    //chopLeaves(direction);                                  // Break leaves in front of next tree, and waits just long enough to collect falling logs too
    //Chat.log("LOG: End - chopTree()");
}

// Function to harvest an entire row of farm, from North to South
function harvestRowNS(direction) {
    Chat.log("LOG: Starting harvestRowNS()");
    walkTo();                                           // Stands in exact center of block
    chopLeaves(direction);                                  // Break leaves between rows
    if (direction == south) {
        for (i = currentZ; i <= endZ; i += treeWidth) {     //TESTING
            nextTree(direction);
            chopTree(direction);
            replant(direction);
            chopLeaves(direction);
        }
        walkTo(direction, currentZ + 1);
    } else if (direction == west) {
        walkTo(currentX - 1, direction);
    } else if (direction == north) {
        walkTo(direction, currentZ - 1);
    } else if (direction == east) {
        walkTo(currentX + 1, direction);
    } else {
        Chat.log("ERROR: Broken chopTree() function!");
    }
    if (startingX != currentX) {                            // If at the beginning of NEW row
        Chat.log("LOG: Detected new row, assigning newStartingZ!");
        newStartingZ = currentZ;
        newAnchorZ_NS = newStartingZ + treeWidth;
        while ((currentZ < (newStartingZ + farmWidth - 1)) == true) {
            currentZ = Player.getPlayer().getZ();           // Acquires current Z coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentZ >= newAnchorZ_NS - 0.1) {          // If at beginning of tree, start chopping; 0.1 is to prevent a bug
                chopTree(direction);                        // Call chopTree() function
                newAnchorZ_NS = currentZ + treeWidth + 1;   // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    } else {                                                // Executes at FIRST row
        while ((currentZ < (startingZ + farmWidth - 1)) == true) {
            currentZ = Player.getPlayer().getZ();           // Acquires current Z coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentZ >= anchorZ_NS - 0.1) {             // If at beginning of tree, start chopping
                chopTree(direction);                        // Call chopTree function
                anchorZ_NS = currentZ + treeWidth + 1;      // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished harvestRowNS()");
}

// Function to harvest an entire row of farm, from South to North
function harvestRowSN(direction) {
    Chat.log("LOG: Starting harvestRowSN()");
    walkTo();                                           // Stands in exact center of block
    chopLeaves(direction);                                  // Break leaves between rows
    if (startingX != currentX) {                            // If at the beginning of NEW row
        Chat.log("LOG: Detected new row, assigning newStartingZ!");
        newStartingZ = currentZ;
        newAnchorZ_SN = newStartingZ - treeWidth;
        while ((currentZ > (newStartingZ - farmWidth + 1)) == true) {
            currentZ = Player.getPlayer().getZ();           // Acquires current Z coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentZ <= newAnchorZ_SN + 0.1) {          // If at beginning of tree, start chopping
                chopTree(direction);                        // Call chopTree function
                newAnchorZ_SN = currentZ - treeWidth - 1;   // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    } else {                                                // Executes at FIRST row
        while ((currentZ > (startingZ - farmWidth + 1)) == true) {
            currentZ = Player.getPlayer().getZ();           // Acquires current Z coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentZ <= anchorZ_SN + 0.1) {             // If at beginning of tree, start chopping
                chopTree(direction);                        // Call chopTree function
                anchorZ_SN = currentZ - treeWidth - 1;      // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished harvestRowSN()");
}

// Function to move to next row and harvest the first tree, from East to West
function nextRowEW(direction) {
    Chat.log("LOG: Starting nextRowEW()");
    walkTo();                                           // Stands in exact center of block
    chopLeaves(direction);                                  // Break leaves between rows
    if (startingX != currentX) {                            // If at 2nd+ turn
        Chat.log("LOG: Detected 2nd+ row, assigning newStartingX!");
        newStartingX = currentX;
        newAnchorX_EW = newStartingX - treeWidth;
        while ((currentX > (newStartingX - treeWidth - 1)) == true) {
            currentX = Player.getPlayer().getX();           // Acquires current X coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentX <= newAnchorX_EW) {                // If at beginning of first tree in row, start chopping
                chopTree(direction);                        // Call chopTree function
                newAnchorX_EW = currentX - treeWidth - 1;   // Used to calculate location of next tree
            }
            Client.waitTick(1);   
        }
    } else {                                                // Execute at FIRST turn
        Chat.log("LOG: First nextRowEW() executing!");
        while ((currentX > (startingX - treeWidth - 1)) == true) {
            currentX = Player.getPlayer().getX();           // Acquires current X coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentX <= anchorX_EW) {                   // If at beginning of first tree in row, start chopping
                chopTree(direction);                        // Call chopTree function
                anchorX_EW = currentX - treeWidth - 1;      // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished nextRowEW()");
}

// Function to move to next row and harvest the first tree, from West to East
function nextRowWE(direction) {
    Chat.log("LOG: Starting nextRowWE()");
    walkTo();                                           // Stands in exact center of block
    chopLeaves(direction);                                  // Break leaves between rows
    if (startingX != currentX) {
        Chat.log("LOG: Detected 2nd+ row, assigning newStartingX!");
        newStartingX = currentX;
        newAnchorX_WE = newStartingX + treeWidth;
        while ((currentX < (newStartingX + treeWidth + 1)) == true) {
            currentX = Player.getPlayer().getX();           // Acquires current X coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentX >= newAnchorX_WE) {                // If at beginning of first tree in row, start chopping
                chopTree(direction);                        // Call chopTree function
                newAnchorX_WE = currentX + treeWidth + 1;   // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    } else {
        Chat.log("LOG: First nextRowWE() executing!");
        while ((currentX < (startingX + treeWidth + 1)) == true) {
            currentX = Player.getPlayer().getX();           // Acquires current X coordinate
            walkRow(direction);                             // Call walkRow function
            if (currentX >= anchorX_WE) {                   // If at beginning of first tree in row, start chopping
                chopTree(direction);                        // Call chopTree function
                anchorX_WE = currentX + treeWidth + 1;      // Used to calculate location of next tree
            }
            Client.waitTick(1);                             // Prevents crash
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.attack', false);
    Chat.log("LOG: Finished nextRowWE()");
}

// Function to harvest an entire row of farm, from East to West
function harvestRowEW(direction) {

}

// Function to harvest an entire row of farm, from West to East
function harvestRowWE(direction) {

}

// Function to move to next row and harvest the first tree, from North to South
function nextRowNS(direction) {

}

// Function to move to next row and harvest the first tree, from South to North
function nextRowSN(direction) {

}



// Script start
if (rowDirection == 0 && turnDirection == 90) {                     // Farm north->south and turn west
    Chat.log("LOG: Starting North-South, with West turns!");
    while (currentX > startingX - farmLength + treeWidth + 1) {     // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection += 180;
        harvestRowNS(rowDirection);
        if (currentX > startingX - farmLength + treeWidth + 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
        harvestRowSN(reverseRowDirection);
        if (currentX > startingX - farmLength + treeWidth + 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 0 && turnDirection == 270) {               // Farm north->south, turn east
    Chat.log("LOG: Starting North-South, with East turns!");
    while (currentX < startingX + farmLength - treeWidth - 1) {     // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection += 180;
        harvestRowNS(rowDirection);
        if (currentX < startingX + farmLength - treeWidth - 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowWE(turnDirection);
        }
        harvestRowSN(reverseRowDirection);
        if (currentX < startingX + farmLength - treeWidth - 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowWE(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 180 && turnDirection == 90) {              // Farm south->north, turn west
    Chat.log("LOG: Starting South-North, with West turns!");
    while (currentX > startingX - farmLength + treeWidth + 1) {     // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection -= 180;
        harvestRowSN(rowDirection);
        if (currentX > startingX - farmLength + treeWidth + 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
        harvestRowNS(reverseRowDirection);
        if (currentX > startingX - farmLength + treeWidth + 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowEW(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 180 && turnDirection == 270) {             // Farm south->north, turn east
    Chat.log("LOG: Starting South-North, with East turns!");
    while (currentX < startingX + farmLength - treeWidth - 1) {     // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection -= 180;
        harvestRowSN(rowDirection);
        if (currentX < startingX + farmLength - treeWidth - 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowWE(turnDirection);
        }
        harvestRowNS(reverseRowDirection);
        if (currentX < startingX + farmLength - treeWidth - 1) {    // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowWE(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 90 && turnDirection == 0) {                // Farm east->west, turn south UNTESTED
    Chat.log("LOG: Starting East-West, with South turns!");
    while (currentZ < startingZ + farmWidth - treeWidth - 1) {      // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection += 180;
        harvestRowEW(rowDirection);
        if (currentZ < startingZ + farmWidth - treeWidth - 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowNS(turnDirection);
        }
        harvestRowEW(reverseRowDirection);
        if (currentZ < startingZ + farmWidth - treeWidth - 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowNS(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 90 && turnDirection == 180) {              // Farm east->west, turn north UNTESTED
    Chat.log("LOG: Starting East-West, with North turns!");
    while (currentZ > startingZ - farmWidth + treeWidth + 1) {      // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection += 180;
        harvestRowEW(rowDirection);
        if (currentZ > startingZ - farmWidth + treeWidth + 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowSN(turnDirection);
        }
        harvestRowEW(reverseRowDirection);
        if (currentZ > startingZ - farmWidth + treeWidth + 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowSN(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 270 && turnDirection == 0) {               // Farm west->east, turn south UNTESTED
    Chat.log("LOG: Starting West-East, with South turns!");
    while (currentZ < startingZ + farmWidth - treeWidth - 1) {      // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection -= 180;
        harvestRowWE(rowDirection);
        if (currentZ < startingZ + farmWidth - treeWidth - 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowNS(turnDirection);
        }
        harvestRowWE(reverseRowDirection);
        if (currentZ < startingZ + farmWidth - treeWidth - 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowNS(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else if (rowDirection == 270 && turnDirection == 180) {             // Farm west->east, turn north UNTESTED
    Chat.log("LOG: Starting West-East, with North turns!");
    while (currentZ > startingZ - farmWidth + treeWidth + 1) {      // Loop for length of farm
        reverseRowDirection = rowDirection;
        reverseRowDirection -= 180;
        harvestRowWE(rowDirection);
        if (currentZ > startingZ - farmWidth + treeWidth + 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowSN(turnDirection);
        }
        harvestRowWE(reverseRowDirection);
        if (currentZ > startingZ - farmWidth + treeWidth + 1) {     // Stop bot from continuing at end of farm
            Chat.log("LOG: Not at end of farm, continuing!");
            nextRowSN(turnDirection);
        }
    }
    Chat.log("LOG: Script completed successfully!");
}
else {
    Chat.log("ERROR: Invalid rowDirection and/or turnDirection!");
}