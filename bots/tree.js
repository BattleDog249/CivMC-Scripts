/*
    JSMacros Tree Farm Bot

    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Set to tools to be used in harvest
logTool = "minecraft:golden_axe";
leafTool = "minecraft:stick";

// Set to the maximum height of tree
// Oak: 6, Birch: 7
// Mehri Jungle: 6
treeHeight = 6;

// Set to (in blocks) distance between trees in a row
// Mehri Farms: 4
width = 4;

// Set to (in blocks) distance between rows
// Mehri Oak/Birch: 4
// Mehri Jungle: 5
rowWidth = 4;

// Set to sapling type to replant
sapling = "minecraft:oak_sapling";

// Set to direction rows of trees in farm travel
// lat: Rows go North/South
// long: Rows go East/West
direction = "lat";
//direction = "long";

// Assign to exact coords of starting block, typically lodestone
// Testing coords
//startX = -122.5;
//startZ = 5.5;
// First level of tree farm
startX = 3247.5;
startZ = -2397.5;
// Second level of tree farm
//startX = 3247.5;
//startZ = -2396.5;
// Third level of tree farm
//startX = 3247.5;
//startZ = -2395.5;
// Fourth level of tree farm
//startX = 3247.5;
//startZ = -2394.5;
// Fifth level of tree farm
//startX = 3247.5;
//startZ = -2393.5;

// Assign coords of last tree opposite of starting coords
// Testing coords
//endX = -197.5;
//endZ = 80.5;
// First level of tree farm
endX = 3172.5;
endZ = -2332.5;
// Second level of tree farm
//endX = 3172.5;
//endZ = -2331.5;
// Third level of tree farm
//endX = 3172.5;
//endZ = -2330.5;
// Fourth level of tree farm
//endX = 3172.5;
//endZ = -2329.5;
// Fifth level of tree farm
//endX = 3172.5;
//endZ = -2328.5;

chop = 'key.attack';
plant = 'key.use';

// Grab current coordinates
pos = Player.getPlayer().getPos();

// Function to equip a given item on the hotbar if located in inventory
// name: "minecraft:itemname"
// hotbar: Preferred hotbar slot (may not be used)
// dmg: Minimum damage value, intended for use with tools to prevent breakages
function pick(name, hotbar = null, dmg = -1) {
    inv = Player.openInventory();
    slots = inv.getMap();

    if (hotbar == null) {
        hotbar = inv.getSelectedHotbarSlotIndex();
    }

    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
    item = inv.getSlot(slot);
    dura = item.getMaxDamage() - item.getDamage();

    if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {               // If item is already selected
        inv.close();                                                                // Close player inventory
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

// Function that walks to the center of the given x, z coordinate; assumes flat y level
// If x, z is ommitted then centers the bot on the current block
// precise=true attempts to walk to the exact coordinate rather than the center of the block
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
    //Chat.log("walking to x: " + tx + ", z: " + tz);
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

// Function used to calculate break times for logs and leaves with currently selected item
// block: Assign either log or leaves
// buffer: Assign tick buffer to compensate for networking issues
function breakTimes(block, buffer = 6) {
    
    inv = Player.openInventory();
    slots = inv.getMap();
    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
    item = inv.getSlot(slot);

    if (block == "log") {
        if (item.getItemId().includes("_axe")) {
            if (item.getItemId().includes("gold")) {
                breakTime = 5;
            } else if (item.getItemId().includes("netherite")) {
                breakTime = 7;
            } else if (item.getItemId().includes("diamond")) {
                breakTime = 8;
            } else if (item.getItemId().includes("iron")) {
                breakTime = 10;
            } else if (item.getItemId().includes("stone")) {
                breakTime = 15;
            } else if (item.getItemId().includes("wood")) {
                breakTime = 30;
            } else {
                Chat.log("ERROR: Invalid tool detected!");
            }
        } else {
            breakTime = 60;
        }
    } else if (block == "leaves") {
        if (item.getItemId().includes("_hoe")) {
            if (item.getItemId().includes("gold")) {
                breakTime = 1;
            } else if (item.getItemId().includes("netherite")) {
                breakTime = 1;
            } else if (item.getItemId().includes("diamond")) {
                breakTime = 1;
            } else if (item.getItemId().includes("iron")) {
                breakTime = 1;
            } else if (item.getItemId().includes("stone")) {
                breakTime = 2;
            } else if (item.getItemId().includes("wood")) {
                breakTime = 3;
            } else {
                Chat.log("ERROR: Invalid tool detected!");
            }
        } else if (item.getItemId().includes("shears")) {
            breakTime = 1;
        } else if (item.getItemId().includes("_sword")) {
            breakTime = 4;
        } else {
            breakTime = 6;
        }
    } else {
        Chat.log("ERROR: Unsupported block type selected!");
    }
    breakTime += buffer;
    return breakTime;
}

// Function to interact with blocks in a set direction for a set amount of time
// yaw: Cardinal direction for bot to face
// pitch: Vertical direction for bot to face
// action: Key stroke, usually either key.attack (left-click) or key.use (right-click)
// time: Time in ticks for bot to mine
// wait: Time in ticks for buffer, useful with anticheat issues
function interact(yaw, pitch, action, time, wait = 5) {
    //Chat.log("LOG: Start - interact()");
    Player.getPlayer().lookAt(yaw, pitch);  // Look in set direction
    Client.waitTick(wait);                  // Wait buffer to successfully break next block
    KeyBind.keyBind(action, true);          // Start mining
    Client.waitTick(time);                  // Wait until block(s) break
    KeyBind.keyBind(action, false);         // Stop mining
    //Chat.log("LOG: Stop - interact()");
}

// Function for harvesting and replanting an entire tree
// yaw: Cardinal direction of tree to be harvested
// width: Distance between trees
function chopTree(yaw, width, wait = 5) {
    //Chat.log("LOG: Start - chopTree(yaw: " + yaw + ")");
    pick(leafTool);                                                             // Equip tool used to break leaves
    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw, 0, action = chop, time = breakTimes("leaves") * width);       // Break leaves in front of next tree, and waits just long enough to collect falling logs too
    pos = Player.getPlayer().getPos();                                          // Grab current coordinates
    
    // Walk to next tree in row
    if (yaw == 0) {                                                             // If facing south
        walkTo(pos.x, pos.z + width);                                               // Walk to tree
        pick(logTool);                                                              // Equip logging tool
        Client.waitTick(wait);                                                      // Wait buffer
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop first block of tree
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop second block of tree
        walkTo(pos.x, pos.z + 1);                                                   // Walk under tree
    } else if (yaw == 90) {                                                     // Else if facing west
        walkTo(pos.x - width, pos.z);                                               // Walk to tree
        pick(logTool);                                                              // Equip logging tool
        Client.waitTick(wait);                                                      // Wait buffer
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop first block of tree
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop second block of tree
        walkTo(pos.x - 1, pos.z);                                                   // Walk under tree
    } else if (yaw == 180) {                                                    // Else if facing north
        walkTo(pos.x, pos.z - width);                                               // Walk to tree
        pick(logTool);                                                              // Equip logging tool
        Client.waitTick(wait);                                                      // Wait buffer
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop first block of tree
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop second block of tree
        walkTo(pos.x, pos.z - 1);                                                   // Walk under tree
    } else if (yaw == 270) {                                                    // Else if facing east
        walkTo(pos.x + width, pos.z);                                               // Walk to tree
        pick(logTool);                                                              // Equip logging tool
        Client.waitTick(wait);                                                      // Wait buffer
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop first block of tree
        interact(yaw, 35, action = chop, time = breakTimes("log"));                 // Chop second block of tree
        walkTo(pos.x + 1, pos.z);                                                   // Walk under tree
    } else {                                                                    // Else error catcher
        Chat.log("ERROR: Invalid yaw value for farm!");
        throw 'Exception';
    }

    pick(logTool);
    Client.waitTick(wait);                                                      // Wait buffer
    for (i = 0; i < treeHeight - 2; i++) {
        interact(yaw, -90, action = chop, time = breakTimes("log"));                // Chop remaining tree
    }
    
    pick(sapling);                                                              // Equip sapling
    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw, 90, action = plant, time = 1);                                // Replant tree
    //Chat.log("LOG: Stop - chopTree(yaw: " + yaw + ")");
}

Chat.log("Starting tree bot!");
Chat.log("Starting at X: " + startX + ", Z: " + startZ);
Chat.log("Ending at X  : " + endX + "  , Z: " + endZ);
Chat.log("Row direction: " + direction);
Chat.log("Tree height  : " + treeHeight);

walkTo(startX, startZ);

if (direction == "lat") {
    if (startX > endX && startZ < endZ) {
        //Chat.log("LOG: Starting NS-W");
        rowYaw = 0;
        turnYaw = 90;
        oppositeYaw = 180;
        while (pos.x > endX || pos.z < endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.z < endZ) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x > endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.z > startZ) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x > endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX < endX && startZ < endZ) {
        //Chat.log("LOG: Starting NS-E");
        rowYaw = 0;
        turnYaw = 270;
        oppositeYaw = 180;
        while (pos.x < endX || pos.z < endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.z < endZ) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x < endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.z > startZ) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x < endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX < endX && startZ > endZ) {
        //Chat.log("LOG: Starting SN-E");
        rowYaw = 180;
        turnYaw = 270;
        oppositeYaw = 0;
        while (pos.x < endX || pos.z > endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.z > endZ) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x < endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.z < startZ) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x < endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX > endX && startZ > endZ) {
        //Chat.log("LOG: Starting SN-W");
        rowYaw = 180;
        turnYaw = 90;
        oppositeYaw = 0;
        while (pos.x > endX || pos.z > endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.z > endZ) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x > endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.z < startZ) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.x > endX) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.x == endX) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    }
} else if (direction == "long") {
    if (startX > endX && startZ < endZ) {
        //Chat.log("LOG: Starting EW-S");
        rowYaw = 90;
        turnYaw = 0;
        oppositeYaw = 270;
        while (pos.x > endX || pos.z < endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.x > endX) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z < endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.x < startX) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z < endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX < endX && startZ < endZ) {
        //Chat.log("LOG: Starting WE-S");
        rowYaw = 270;
        turnYaw = 0;
        oppositeYaw = 90;
        while (pos.x < endX || pos.z < endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.x < endX) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z < endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.x > startX) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z < endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX < endX && startZ > endZ) {
        //Chat.log("LOG: Starting WE-N");
        rowYaw = 270;
        turnYaw = 180;
        oppositeYaw = 90;
        while (pos.x < endX || pos.z > endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.x < endX) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z > endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.x > startX) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z > endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    } else if (startX > endX && startZ > endZ) {
        //Chat.log("LOG: Starting EW-N");
        rowYaw = 90;
        turnYaw = 180;
        oppositeYaw = 270;
        while (pos.x > endX || pos.z > endZ) {
    
            // Harvest whole row while not at end of row
            while (pos.x > endX) {
                chopTree(rowYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z > endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        
            // Harvest whole opposite row while not at end of row
            while (pos.x < startX) {
                chopTree(oppositeYaw, width);
            }
        
            // Check if at last row in farm
            if (pos.z > endZ) {
                //Chat.log("LOG: Chopping next row!");
                chopTree(turnYaw, rowWidth);
            } else if (pos.z == endZ) {
                //Chat.log("LOG: Stopping at last row!");
                break;
            } else {
                Chat.log("ERROR: Out of bounds!");
                break;
            }
        }
    }
} else {
    Chat.log("ERROR: Direction value must be \"lat\" or \"long\"!");
}
Chat.log("Done!");