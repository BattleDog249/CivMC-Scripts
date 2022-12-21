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

// Function to break potential leaves before walking
function chopLeaves(direction) {
    Player.getPlayer().lookAt(direction, 0);                // Looks in correct direction
    pick(leafTool);                                         // Equip tool used to break leaves
    KeyBind.keyBind('key.attack', true);                    // Begin breaking leaves between trees
    Client.waitTick(leafBreakTime * treeWidth);             // Wait to break all leaves between trees before walking; prevents weird glitches on CivMC
    KeyBind.keyBind('key.attack', false);                   // Stop breaking leaves between trees
}

// Function to plant a sapling
function replant(direction) {
    Time.sleep(250);
    Player.getPlayer().lookAt(direction, 90);               // Look straight down
    pick(sapling);                                          // Equip sapling to replant
    Time.sleep(250);
    KeyBind.keyBind('key.use', true);
    Client.waitTick(1);
    KeyBind.keyBind('key.use', false);
    Time.sleep(250);
    Player.getPlayer().lookAt(direction, 0);
    Time.sleep(250);
}

// Function to harvest a single tree
function chopTree(direction) {
    //Chat.log("LOG: Start - chopTree()");
    KeyBind.keyBind('key.forward', false);                  // Stop walking to begin chopping
    Time.sleep(250);
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
    KeyBind.keyBind('key.forward', true);                   // Start walking under tree
    Client.waitTick(3);                                     // Should be time it takes in ticks to walk 1 block; not sure exact value
    KeyBind.keyBind('key.forward', false);                  // Stop under tree
    walkTo();                                               // Center bot exactly under tree
    Client.waitTick(recoveryBuffer);
    replant(direction);                                     // Replant sapling
    Client.waitTick(recoveryBuffer);
    pick(logTool);                                          // Equip tool used to break logs
    Client.waitTick(recoveryBuffer);
    Player.getPlayer().lookAt(direction, -90);              // Look straight up
    KeyBind.keyBind('key.attack', true);                    // Begin chopping rest of tree
    Client.waitTick(breakTime * treeHeight + breakTime);    // Time it takes to chop maximum height tree
    KeyBind.keyBind('key.attack', false);                   // Stop chopping tree
    chopLeaves(direction);                                  // Break leaves in front of next tree, and waits just long enough to collect falling logs too
    //Chat.log("LOG: End - chopTree()");
}

// Set to tools to be used in harvest
logTool = "minecraft:iron_axe";
leafTool = "minecraft:stick"

// Set to sapling type to replant
sapling = "minecraft:oak_sapling";

width = 4;

startX = -122.5;
startZ = 81.5;

endX = -132.5;
endZ = 6.5;

pos = Player.getPlayer().getPos();

walkTo();

//North to South start, turn West WORKING
while (pos.x > endX || pos.z < endZ) {

    while (pos.z < endZ) {
        chopLeaves();
        walkTo(pos.x, pos.z + width);
        chopTree();
        walkTo(pos.x, pos.z + 1);
        walkTo();
    }

    if (pos.x == endX) {
        break;
    } else if (pos.x > endX) {
        walkTo(pos.x - width, pos.z);
        walkTo(pos.x - 1, pos.z);
        walkTo();
    } else {
        Chat.log("ERROR: Navigation Error!");
    }
    
    while (pos.z > startZ) {
        walkTo(pos.x, pos.z - width);
        walkTo(pos.x, pos.z - 1);
        walkTo();
    }
    
    if (pos.x == endX) {
        break;
    } else if (pos.x > endX) {
        walkTo(pos.x - width, pos.z);
        walkTo(pos.x - 1, pos.z);
        walkTo();
    } else {
        Chat.log("ERROR: Navigation Error!");
    }
}

Chat.log("Done!");