/*
    JSMacros Tree Farm Bot

    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Set to tools to be used in harvest
logTool = "minecraft:diamond_axe";
leafTool = "minecraft:shears";

// Set to numerical level of efficiency enchant of selected tool
efficiency = 5;
haste = 0;

// Set to the maximum height of tree
// Oak: 6, Unrestricted Birch/Jungle/Spruce: 7
treeHeight = 6;

// Set to (in blocks) distance between trees in a row
// Mehri Farms: 4
treeWidth = 4;

// Set to (in blocks) distance between rows
// Mehri Oak/Birch: 4
// Mehri Jungle: 5
rowWidth = 4;

// Set to sapling type to replant
sapling = "minecraft:birch_sapling";

// Set to direction rows of trees in farm travel
// lat: Rows go North/South
// long: Rows go East/West
direction = "lat";
//direction = "long";

// Assign to exact coords of starting block, typically lodestone
// Testing coords
//startX = -94.5;
//startZ = 14.5;
// First level of Oak tree farm
//startX = 3247.5;
//startZ = -2397.5;
// First level of Jungle tree farm
//startX = 2150.5;
//startZ = -1477.5;
// Second level of tree farm
startX = 3247.5;
startZ = -2396.5;
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
//endX = -104.5;
//endZ = 4.5;
// First level of Oak tree farm
//endX = 3172.5;
//endZ = -2332.5;
// First level of Jungle tree farm
//endX = 2222.5;
//endZ = -1417.5;
// Second level of tree farm
endX = 3172.5;
endZ = -2331.5;
// Third level of tree farm
//endX = 3172.5;
//endZ = -2330.5;
// Fourth level of tree farm
//endX = 3172.5;
//endZ = -2329.5;
// Fifth level of tree farm
//endX = 3172.5;
//endZ = -2328.5;

// chop = left click, plant = right click
chop = 'key.attack';
plant = 'key.use';

// Grab current coordinates
pos = Player.getPlayer().getPos();

//  Function to equip a given item on the hotbar if located in inventory
//      name: "minecraft:item_name"
//      hotbar: Hotbar slot to swap item to, 0 - 9
//      dmg: Minimum damage value, intended for use with tools to prevent breakages
//  Known issue: If item to pick is already in desired slot, it will be swapped
function pick(name, hotbar = null, dmg = -1) {
    inv = Player.openInventory();                                               // Open player inventory
    slots = inv.getMap();                                                       // Acquire inventory map

    if (hotbar == null) {                                                       // If hotbar is assigned
        hotbar = inv.getSelectedHotbarSlotIndex();                                  // Swap item to currently selected slot
    }

    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];                   // Swap item to assigned hotbar slot

    item = inv.getSlot(slot);                                                   // Acquire item in slot
    dura = item.getMaxDamage() - item.getDamage();                              // Determine item durability
    if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {               // If item is already selected and isn't sufficiently damaged
        //Chat.log(`Found ${item.getItemId()} in hand at slot ${slot}.`);
        inv.swap(slot, slots["hotbar"][hotbar]);                                    // Swap item in slot with hotbar slot
        Client.waitTick(5);                                                         // Wait buffer
        inv.setSelectedHotbarSlotIndex(hotbar);                                     // Select hotbar slot
        inv.close();                                                                // Close inventory
        return true;                                                                // pick() success
    }

    for (slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {   // For all slots in inventory
        item = inv.getSlot(slot);                                                   // Acquire item in slot
        dura = item.getMaxDamage() - item.getDamage();                              // Determine item durability
        if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {               // If item is target and item isn't sufficiently damaged
            //Chat.log(`Found ${item.getItemId()} in hand at slot ${slot}.`);
            inv.swap(slot, slots["hotbar"][hotbar]);                                    // Swap item in slot with hotbar slot
            Client.waitTick(5);                                                         // Wait buffer
            inv.setSelectedHotbarSlotIndex(hotbar);                                     // Select hotbar slot
            inv.close();                                                                // Close inventory
            return true;                                                                // pick() success
        }
    }
    inv.close();                                                                // Close inventory
    return false;                                                               // pick() fail
}

// Function that walks to the center of the given x, z coordinate; assumes flat y level
// If x, z is ommitted then centers the bot on the current block
// precise: true attempts to walk to the exact coordinate rather than the center of the block
// timeout: Set maximum amount of time walkTo() should spend walking
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
            KeyBind.keyBind('key.sneak', true);
        }
        if (Math.abs(pos.x - tx) < 0.075 && Math.abs(pos.z - tz) < 0.075) {
            break;
        }
        Client.waitTick();
        timer += 1;
        if (timeout != null && timer > timeout) {
            Chat.log("LOG: walkTo() timed out");
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

//  Function that returns time in ticks to mine a certain block with selected tool multiplier, plus a buffer
//  Does not account for mining fatigue, being in water w/o AA, and not on ground
//  Assumes tool assigned is best for the job and that it can harvest expected block
//      tool: Assign tool speed multiplier
//          nothing = 1; wood = 2; stone = 4; iron = 6; diamond = 8; netherite = 9; gold = 12;
//          Shears = 2 (1 on vine and glow lichen, 5 on wool, 15 on cobwebs and leaves)
//          Sword = 1.5 (15 on cobwebs);
//      hardness: Assign hardness value of block to be broken
//          log = 2; leaves = 0.2; crop = 0;
//      efficiency: Assign efficiency level of tool 0 - 5
//      haste: Assign haste level 0 - 2
//      buffer: Assign tick buffer to compensate for network & TPS variance, 7 is flawless in testing
function breakTicks(tool, hardness, efficiency = 0, haste = 0, buffer = 7) {
    speed = tool;
    if ((efficiency >= 1 && efficiency <= 5) && (speed != 1 && speed != 1.5 && speed != 5 && speed != 15)) {
        speed += efficiency ^ 2 + 1;
    }
    if (haste == 0) {
        damage = speed / hardness;
        damage /= 30;
        if (damage > 1) {
            ticks = 1;
            //Chat.log("LOG: Ticks = " + ticks);
            ticks += buffer;
            //Chat.log("LOG: Returning Ticks + Buffer = " + ticks);
            //seconds = ticks / 20;
            //Chat.log("LOG: Seconds (with buffer): " + seconds);
            return ticks;
        }
        ticks = Math.ceil(1 / damage);  // Round up
        //Chat.log("LOG: Ticks = " + ticks);
        ticks += buffer;
        //Chat.log("LOG: Returning Ticks + Buffer = " + ticks);
        //seconds = ticks / 20;
        //Chat.log("LOG: Seconds (with buffer): " + seconds);
        return ticks;
    } else if (haste == 1 || haste == 2) {
        speed *= 0.2 * haste + 1;

        damage = speed / hardness;
        damage /= 30;
        if (damage > 1) {
            ticks = 1;
            //Chat.log("LOG: Ticks = " + ticks);
            ticks += buffer;
            //Chat.log("LOG: Returning Ticks + Buffer = " + ticks);
            //seconds = ticks / 20;
            //Chat.log("LOG: Seconds (with buffer): " + seconds);
            return ticks;
        }
        ticks = Math.ceil(1 / damage);  // Round up
        //Chat.log("LOG: Ticks = " + ticks);
        ticks += buffer;
        //Chat.log("LOG: Returning Ticks + Buffer = " + ticks);
        //seconds = ticks / 20;
        //Chat.log("LOG: Seconds (with buffer): " + seconds);
        return ticks;
    } else {
        Chat.log("ERROR: Invalid haste value assigned!");
        return false;
    }
}

//  Function used in conjunction with breakTicks() to correctly assign tool values based on equipped tool
//      block: Assign either log or leaves
function breakTimes(block) {
    inv = Player.openInventory();
    slots = inv.getMap();
    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
    item = inv.getSlot(slot);

    if (block == "log") {
        if (item.getItemId().includes("_axe")) {
            if (item.getItemId().includes("gold")) {
                breakTime = breakTicks(tool = 12, hardness = 2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("netherite")) {
                breakTime = breakTicks(tool = 9, hardness = 2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("diamond")) {
                breakTime = breakTicks(tool = 8, hardness = 2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("iron")) {
                breakTime = breakTicks(tool = 6, hardness = 2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("stone")) {
                breakTime = breakTicks(tool = 4, hardness = 2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("wood")) {
                breakTime = breakTicks(tool = 2, hardness = 2, efficiency, haste);
                return breakTime;
            } else {
                Chat.log("ERROR: Invalid tool detected!");
                return false;
            }
        } else {
            breakTime = breakTicks(tool = 1, hardness = 2, efficiency = 0, haste);
            return breakTime;
        }
    } else if (block == "leaves") {
        if (item.getItemId().includes("_hoe")) {
            if (item.getItemId().includes("gold")) {
                breakTime = breakTicks(tool = 12, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("netherite")) {
                breakTime = breakTicks(tool = 9, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("diamond")) {
                breakTime = breakTicks(tool = 8, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("iron")) {
                breakTime = breakTicks(tool = 6, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("stone")) {
                breakTime = breakTicks(tool = 4, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else if (item.getItemId().includes("wood")) {
                breakTime = breakTicks(tool = 2, hardness = 0.2, efficiency, haste);
                return breakTime;
            } else {
                Chat.log("ERROR: Invalid tool detected!");
                return false;
            }
        } else if (item.getItemId().includes("shears")) {
            breakTime = breakTicks(tool = 15, hardness = 0.2, efficiency = 0, haste);
            return breakTime;
        } else if (item.getItemId().includes("_sword")) {
            breakTime = breakTicks(tool = 1.5, hardness = 0.2, efficiency = 0, haste);
            return breakTime;
        } else {
            breakTime = breakTicks(tool = 1, hardness = 0.2, efficiency = 0, haste);
            return breakTime;
        }
    } else {
        Chat.log("ERROR: Unsupported block type selected!");
        return false;
    }
}

//  Function to interact with blocks in a set direction for a set amount of time
//      yaw: Cardinal direction for bot to face
//      pitch: Vertical direction for bot to face
//      action: Key stroke, usually either key.attack (left-click) or key.use (right-click)
//      time: Time in ticks for bot to perform action
//      wait: Time in ticks for buffer between lookAt() and performing action
function interact(yaw, pitch, action, time, wait = 3) {
    //Chat.log("LOG: Start - interact()");
    Player.getPlayer().lookAt(yaw, pitch);  //  Look in set direction
    Client.waitTick(wait);                  //  Wait buffer to successfully break next block
    KeyBind.keyBind(action, true);          //  Start action
    Client.waitTick(time);                  //  Wait time while action performs
    KeyBind.keyBind(action, false);         //  Stop action
    //Chat.log("LOG: Stop - interact()");
    return true;
}

// Function for harvesting and replanting an entire tree
// yaw: Cardinal direction of tree to be harvested
// width: Distance between trees
// wait: Wait buffer
function chopTree(yaw, width, wait = 3) {
    //Chat.log("LOG: Start - chopTree(yaw: " + yaw + ")");
    pos = Player.getPlayer().getPos();                                          // Grab current coordinates
    Client.waitTick(wait);                                                      // Wait buffer
    pick(name = leafTool, hotbar = null, dmg = 10);                             // Equip tool used to break leaves
    Client.waitTick(wait);                                                      // Wait buffer
    if (width >= 5) {                                                           // If leaves to break go out of reach
        reach = 4;
        interact(yaw, 0, action = chop, time = breakTimes("leaves") * reach);       // Break leaves as far as reach allows, 4 blocks on CivMC
        Client.waitTick(wait);                                                      // Wait buffer
        pick(name = leafTool, hotbar = null, dmg = 10);                             // Equip leaf tool
        Client.waitTick(wait);                                                      // Wait buffer
        if (yaw == 0) {                                                             // If facing south
            walkTo(pos.x, pos.z + reach);                                                   // Walk to next leaves
            Client.waitTick(wait);                                                          // Wait buffer
            interact(yaw, 0, action = chop, time = breakTimes("leaves") * (width - reach)); // Chop remaining leaves
            walkTo(pos.x, pos.z + (width - reach));                                         // Walk to tree
        } else if (yaw == 90) {                                                     // Else if facing west
            walkTo(pos.x - reach, pos.z);                                                   // Walk to next leaves
            Client.waitTick(wait);                                                          // Wait buffer
            interact(yaw, 0, action = chop, time = breakTimes("leaves") * (width - reach)); // Chop remaining leaves
            walkTo(pos.x - (width - reach), pos.z);                                         // Walk to tree
        } else if (yaw == 180) {                                                    // Else if facing north
            walkTo(pos.x, pos.z - reach);                                                   // Walk to next leaves
            Client.waitTick(wait);                                                          // Wait buffer
            interact(yaw, 0, action = chop, time = breakTimes("leaves") * (width - reach)); // Chop remaining leaves
            walkTo(pos.x, pos.z - (width - reach));                                         // Walk to tree
        } else if (yaw == 270) {                                                    // Else if facing east
            walkTo(pos.x + reach, pos.z);                                                   // Walk to next leaves
            Client.waitTick(wait);                                                          // Wait buffer
            interact(yaw, 0, action = chop, time = breakTimes("leaves") * (width - reach)); // Chop remaining leaves
            walkTo(pos.x + (width - reach), pos.z);                                         // Walk to tree
        } else {                                                                    // Else error catcher
            Chat.log("ERROR: Invalid yaw value for farm!");
            return false;                                                               // chopTree() fail
        }
    } else if (width <= 4) {

        interact(yaw, 0, action = chop, time = breakTimes("leaves") * width);       // Break leaves in front of next tree, usually long enough to collect falling logs
        Client.waitTick(wait);                                                      // Wait buffer

        if (yaw == 0) {                                                             // If facing south
            walkTo(pos.x, pos.z + width);                                               // Walk to tree
        } else if (yaw == 90) {                                                     // Else if facing west
            walkTo(pos.x - width, pos.z);                                               // Walk to tree
        } else if (yaw == 180) {                                                    // Else if facing north
            walkTo(pos.x, pos.z - width);                                               // Walk to tree
        } else if (yaw == 270) {                                                    // Else if facing east
            walkTo(pos.x + width, pos.z);                                               // Walk to tree
        } else {                                                                    // Else error catcher
            Chat.log("ERROR: Invalid yaw value for farm!");
            return false;                                                               // chopTree() fail
        }
    }
    Client.waitTick(wait);                                                      // Wait buffer
    pick(name = logTool, hotbar = null, dmg = 10);                              // Equip logging tool
    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw + 5, 30, action = chop, time = breakTimes("log") * 2);         // Chop bottom 2 blocks of tree
    
    if (yaw == 0) {                                                             // If facing south
        walkTo(pos.x, pos.z + 1);                                                   // Walk under tree
    } else if (yaw == 90) {                                                     // Else if facing west
        walkTo(pos.x - 1, pos.z);                                                   // Walk under tree
    } else if (yaw == 180) {                                                    // Else if facing north
        walkTo(pos.x, pos.z - 1);                                                   // Walk under tree
    } else if (yaw == 270) {                                                    // Else if facing east
        walkTo(pos.x + 1, pos.z);                                                   // Walk under tree
    } else {                                                                    // Else error catcher
        Chat.log("ERROR: Invalid yaw value for farm!");
        return false;                                                               // chopTree() fail
    }

    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw, -90, action = chop, time = breakTimes("log") * (treeHeight - 2)); // Chop remaining floating tree
    pick(name = sapling, hotbar = null, dmg = -1);                              // Equip sapling
    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw, 90, action = chop, time = 1);                                 // Break existing sapling, if present
    Client.waitTick(wait);                                                      // Wait buffer
    interact(yaw, 90, action = plant, time = 1);                                // Replant tree
    //Chat.log("LOG: Stop - chopTree(yaw: " + yaw + ")");
    return true;                                                                // chopTree() success
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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
                chopTree(rowYaw, treeWidth);
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
                chopTree(oppositeYaw, treeWidth);
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