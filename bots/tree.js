/*
    JSMacros Tree Farm Bot

    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Variable used to set buffer time for block break variables, compensating for variances in time to break
buffer = 6;

// Variable used to set time in ticks it takes to break a leaf block with selected unenchanted hoe
// Nothing: 6, Wooden: 3, Stone: 2, Iron: 1, Diamond: 1, Netherite: 1, Gold: 1
// Shears: 1, Sword: 2
leafBreakTime = buffer + 6;

// Variable used to set time in ticks it takes to break a log with selected unenchanted axe
// Nothing: 60, Wooden: 30, Stone: 15, Iron: 10, Diamond: 8, Netherite: 7, Gold: 5
logBreakTime = buffer + 10;

// Set to the maximum height of tree
// Oak: 6, Birch: 7
treeHeight = 6;

// Set to (in blocks) distance between trees
width = 4;

breakBottom = logBreakTime * 2;
breakTop = logBreakTime * (treeHeight - 2);
breakLeaves = leafBreakTime * width;

chop = 'key.attack';
plant = 'key.use';

// Grab current coordinates
pos = Player.getPlayer().getPos();

// Set to tools to be used in harvest
logTool = "minecraft:iron_axe";
leafTool = "minecraft:stick"

// Set to sapling type to replant
sapling = "minecraft:oak_sapling";

// Assign to exact coords of starting block, typically lodestone
// Testing coords
startX = -94.5;
startZ = 4.5;
// First level of tree farm
//startX = 3247.5;
//startZ = -2397.5;
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
endX = -104.5;
endZ = 14.5;
// First level of tree farm
//endX = 3172.5;
//endZ = -2332.5;
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

// Set to integer of cardinal direction when facing first tree from lodestone
// South: 0, West: 90, North: 180, East: 270
// Set to opposite yaw
if (startZ < endZ) {
    rowYaw = 0;
    oppositeYaw = 180;
} else {
    rowYaw = 180;
    oppositeYaw = 0;
}

// Set to integer of cardinal direction of traversals between rows
// South: 0, West: 90, North: 180, East: 270
turnYaw = 90;

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

// Function to interact with blocks in a set direction for a set amount of time
// yaw: Cardinal direction for bot to face
// pitch: Vertical direction for bot to face
// action: Key stroke, usually either key.attack (left-click) or key.use (right-click)
// tool: Set tool used to mine
// time: Time in ticks for bot to mine
// wait: Time in ticks for buffer, useful with anticheat issues
function interact(yaw, pitch, action, tool, time = 1, wait = 5) {
    //Chat.log("LOG: Start - mine()");
    pick(tool);                             // Equip tool to mine desired blocks
    Player.getPlayer().lookAt(yaw, pitch);  // Look in set direction
    Client.waitTick(wait);                  // Wait buffer to successfully break next block
    KeyBind.keyBind(action, true);          // Start mining
    Client.waitTick(time);                  // Wait until block(s) break
    KeyBind.keyBind(action, false);         // Stop mining
    //Chat.log("LOG: Stop - mine()");
}

// Function for harvesting and replanting an entire tree
// yaw: Cardinal direction of tree to be harvested
function chopTree(yaw) {
    //Chat.log("LOG: Start - chopTree()");
    interact(yaw, 0, action = chop, tool = leafTool, time = breakLeaves);   // Break leaves in front of next tree, and waits just long enough to collect falling logs too
    pos = Player.getPlayer().getPos();                                      // Grab current coordinates
    
    // Walk to next tree in row
    if (yaw == 0) {
        walkTo(pos.x, pos.z + width);
    } else if (yaw == 90) {
        walkTo(pos.x - width, pos.z);
    } else if (yaw = 180) {
        walkTo(pos.x, pos.z - width);
    } else if (yaw = 270) {
        walkTo(pos.x + width, pos.z);
    } else {
        Chat.log("ERROR: Invalid yaw value for farm!");
        throw 'Exception';
    }
    interact(yaw, 35, action = chop, tool = logTool, time = breakBottom);   // Chop first two blocks of tree
    
    // Walk exactly under floating tree
    if (yaw == 0) {
        walkTo(pos.x, pos.z + 1);
    } else if (yaw == 90) {
        walkTo(pos.x - 1, pos.z);
    } else if (yaw == 180) {
        walkTo(pos.x, pos.z - 1);
    } else if (yaw == 270) {
        walkTo(pos.x + 1, pos.z);
    } else {
        Chat.log("ERROR: Invalid yaw value for farm!");
        throw 'Exception';
    }
    interact(yaw, -90, action = chop, tool = logTool, time = breakTop);     // Chop remaining tree
    interact(yaw, 90, action = plant, tool = sapling);                      // Replant tree
    //Chat.log("LOG: Stop - chopTree()");
}

Chat.log("Starting!");

// Center bot on starting block
walkTo();

// North to South starting direction, West turns
while (pos.x > endX || pos.z < endZ) {                                          // While in confines of farm

    while (pos.z < endZ) {                                                          // While in row
        chopTree(rowYaw);
    }

    if (pos.x == endX) {                                                            // If at last row
        break;                                                                          // Break
    } else if (pos.x > endX) {                                                      // Else if not at last row
        chopTree(turnYaw);
    } else {                                                                        // Else anything else
        Chat.log("ERROR: Navigation Error!");                                           // Error catcher
    }

    while (pos.z > startZ) {                                                        // While facing opposite direction from first row
        chopTree(oppositeYaw);
    }

    if (pos.x == endX) {                                                            // If at last row
        break;                                                                          // Break
    } else if (pos.x > endX) {                                                      // Else if not at last row
        chopTree(turnYaw);
    } else {                                                                        // Else anything else
        Chat.log("ERROR: Navigation Error!");                                           // Error catcher
    }
}

Chat.log("Done!");