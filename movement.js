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

Chat.log("Starting!");

width = 4;

startX = -122.5;
startZ = 81.5;

endX = -132.5;
endZ = 6.5;

pos = Player.getPlayer().getPos();

walkTo();

//North to South start WORKING
while (pos.x > endX || pos.z < endZ) {

    while (pos.z < endZ) {
        walkTo(pos.x, pos.z + width);
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