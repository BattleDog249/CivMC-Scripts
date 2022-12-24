/*
    JSMacros Tree Farm Bot

    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Variable used to set time in ticks it takes to break a log with selected unenchanted tool + 5 for buffer
// Nothing: 65, Wooden: 35, Stone: 20, Iron: 15, Diamond: 13, Netherite: 12, Gold: 10
breakTime = 15;

// Variable used to set time in ticks it takes to break a leaf block with selected unenchanted tool + 7 for buffer
leafBreakTime = 13;

// Set amount of time it takes to recover from swing with an axe
// Wooden: 25, Gold: 20, Stone: 25, Iron: 23, Diamond: 20, Netherite: 20
recoveryBuffer = 20;

// Set to integer of cardinal direction when facing first tree from lodestone
// South: 0, West: 90, North: 180, East: 270
rowDirection = 0;

// Set to integer of cardinal direction of the first change of direction of tree farm
// South: 0, West: 90, North: 180, East: 270
turnDirection = 90;

// Set to the maximum height of tree; should be 6 for oak I think
// The - 2 is to subtract the two bottom blocks already broken by the bot, so only change the first number if need be!
treeHeight = 6 - 2;

// Set to tools to be used in harvest
logTool = "minecraft:iron_axe";
leafTool = "minecraft:stick"

// Set to sapling type to replant
sapling = "minecraft:oak_sapling";

// Set to (in blocks) distance between trees
width = 4;

// Assign to exact coords of starting block, typically lodestone
// Testing coords
//startX = 3247.5;
//startZ = -2396.5;
// First level of Mehri tree farm
startX = 3217.5;
startZ = -2397.5;
// Second level of Mehri tree farm
//startX = 3247.5;
//startZ = -2396.5;
// Third level of Mehri tree farm
//startX = 3247.5;
//startZ = -2395.5;
// Fourth level of Mehri tree farm
//startX = 3247.5;
//startZ = -2394.5;
// Fifth level of Mehri tree farm
//startX = 3247.5;
//startZ = -2393.5;

// Assign coords of last tree opposite of starting coords
// Testing coords
//endX = -132.5;
//endZ = 6.5;
// First level of Mehri tree farm
endX = 3172.5;
endZ = -2332.5;
// Second level of Mehri tree farm
//endX = 3172.5;
//endZ = -2331.5;
// Third level of Mehri tree farm
//endX = 3172.5;
//endZ = -2330.5;
// Fourth level of Mehri tree farm
//endX = 3172.5;
//endZ = -2329.5;
// Fifth level of Mehri tree farm
//endX = 3172.5;
//endZ = -2328.5;

// Function to equip a given item on the hotbar if located in inventory
// name = "minecraft:itemname"
// hotbar = Preferred hotbar slot (may not be used)
// dmg = Minimum damage value, intended for use with tools to prevent breakages
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
// precise=true attempts to walk to the exact coordinate rather than the centre of the block
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

// Function to plant a sapling
function replant(direction) {
    //Chat.log("LOG: Start - replant()");
    pick(sapling);                              // Equip sapling to replant
    Player.getPlayer().lookAt(direction, 90);   // Look straight down
    Time.sleep(100);                            // Wait buffer
    KeyBind.keyBind('key.use', true);           // Start placing sapling
    Client.waitTick(1);                         // Wait to plant
    KeyBind.keyBind('key.use', false);          // Stop placing sapling
    Time.sleep(100);                            // Wait buffer
    //Chat.log("LOG: Stop - replant()");
}

// Function to mine blocks in a set direction for a set amount of time
// yaw: Cardinal direction for bot to face
// pitch: Vertical direction for bot to face
// tool: Set tool used to mine
// time: Time in ticks for bot to mine
// wait: Time in ticks for buffer, useful with anticheat issues
function mine(yaw, pitch, tool, time, wait = 1) {
    //Chat.log("LOG: Start - mine()");
    pick(tool);                             // Equip tool to mine desired blocks
    Player.getPlayer().lookAt(yaw, pitch);  // Look in set direction
    Client.waitTick(wait);                  // Wait buffer to successfully break next block
    KeyBind.keyBind('key.attack', true);    // Start mining
    Client.waitTick(time);                  // Wait until block(s) break
    KeyBind.keyBind('key.attack', false);   // Stop mining
    //Chat.log("LOG: Stop - mine()");
}

Chat.log("Starting!");

// Grab current coordinates
pos = Player.getPlayer().getPos();

// Center bot on starting block
walkTo();

// North to South starting direction, West turns | WORKING, TESTING
while (pos.x > endX || pos.z < endZ) {              // While in confines of farm

    while (pos.z < endZ) {                                                      // While in row
        mine(rowDirection, 0, tool = leafTool, time = leafBreakTime * width);       // Break leaves in front of next tree, and waits just long enough to collect falling logs too
        walkTo(pos.x, pos.z + width);                                               // Walk to next tree in row
        mine(rowDirection, 35, tool = logTool, time = breakTime * 2);               // Chop first two blocks of tree
        walkTo(pos.x, pos.z + 1);                                                   // Walk exactly under floating tree
        mine(rowDirection, -90, tool = logTool, time = breakTime * treeHeight);     // Chop remaining tree
        replant(rowDirection);                                                      // Replant tree
    }

    if (pos.x == endX) {                                // If at last row
        break;                                              // Break
    } else if (pos.x > endX) {                          // If not at last row
        mine(turnDirection, 0, tool = leafTool, time = leafBreakTime * width);       // Break leaves in front of next tree, and waits just long enough to collect falling logs too
        walkTo(pos.x - width, pos.z);                       // Walk to first tree in next row
        mine(turnDirection, 35, tool = logTool, time = breakTime * 2);  // Chop first two blocks of tree
        walkTo(pos.x - 1, pos.z);                           // Walk under first tree in next row
        mine(turnDirection, -90, tool = logTool, time = breakTime * treeHeight); // Chop remaining tree
        replant(turnDirection);                             // Replant tree
    } else {                                            // Else anything else
        Chat.log("ERROR: Navigation Error!");               // Error catcher
    }

    flipDirection = rowDirection + 180;                 // Assign opposite direction

    while (pos.z > startZ) {                            // While facing opposite direction from first row
        mine(flipDirection, 0, tool = leafTool, time = leafBreakTime * width);       // Break leaves in front of next tree, and waits just long enough to collect falling logs too
        walkTo(pos.x, pos.z - width);                       // Walk to first tree in next row
        mine(flipDirection, 35, tool = logTool, time = breakTime * 2);  // Chop first two blocks of tree
        walkTo(pos.x, pos.z - 1);                           // Walk under first tree in next row
        mine(flipDirection, -90, tool = logTool, time = breakTime * treeHeight); // Chop remaining tree
        replant(flipDirection);                             // Replant tree
    }

    if (pos.x == endX) {                                // If at last row
        break;                                              // Break
    } else if (pos.x > endX) {                          // If not at last row
        mine(turnDirection, 0, tool = leafTool, time = leafBreakTime * width);       // Break leaves in front of next tree, and waits just long enough to collect falling logs too
        walkTo(pos.x - width, pos.z);                       // Walk to first tree in next row
        mine(turnDirection, 35, tool = logTool, time = breakTime * 2);  // Chop first two blocks of tree
        walkTo(pos.x - 1, pos.z);                           // Walk under first tree in next row
        mine(turnDirection, -90, tool = logTool, time = breakTime * treeHeight); // Chop remaining tree
        replant(rowDirection);                              // Replant tree
    } else {                                            // Else anything else
        Chat.log("ERROR: Navigation Error!");               // Error catcher
    }
}

Chat.log("Done!");