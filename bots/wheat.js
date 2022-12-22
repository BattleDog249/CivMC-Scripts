/*
    JSMacros Wheat Farm Bot REFACTOR

    @author TheOrangeWizard
    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Must start at northwest corner! For now...

tool = "minecraft:air"; // to be used when clicking crops
threshold = 8; // bot will perform a dropoff once it has this amount of inventory space left

// Starting corner of the crop field
startx = 2464;
startz = -1848;

// Opposite corner of the crop field
endx = 2531;
endz = -1714;

// Item config
seeditem = "minecraft:wheat_seeds";
deposititem = "minecraft:wheat";

// coordinates for the Player to walk to when depositing items
depositwheatx = 2451;
depositwheatz = -1848;

depositseedx = startx;
depositseedz = startz;

// yaw and pitch for the Player to look at when depositing items
// note that 0 yaw is south, 90 is west, 180 is north, and 270 is east
depositwheatyaw = 180;
depositwheatpitch = -75;

depositseedyaw = 180;
depositseedpitch = 0;

if (startz < endz) {
    hyaw = 0;
    pyaw = 180;
} else {
    hyaw = 180;
    pyaw = 0;
}

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

function deposit(name, timeout = 500) {
    KeyBind.keyBind("key.mouse.right", true);
    KeyBind.keyBind("key.mouse.right", false);
    
    t = 0;
    while (Hud.getOpenScreenName() == null && t < timeout) {
        t += 1;
        Client.waitTick();
    }
    
    if (!(t < timeout)) {
        Chat.log("failed to open inventory, cancelling");
        return false;
    }
    
    inv = Player.openInventory();
    slots = inv.getMap();
    
    if (!!("container" in slots)) {
        Chat.log("inventory not a container, cancelling");
        inv.close();
    }

    for (let slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {
        item = inv.getSlot(slot);
        num = item.getCount();
        if (item.getItemId() === name) {
            inv.quick(slot);
            Client.waitTick();
        }
    }
    
    Time.sleep(500);
    
    inv.close();
}

// helper function which can be configured for (almost) any crop farm
// tx, tz: target coordinates, bot will exit cleanly when it arrives
// yaw, pitch: angle the bot will look at
// item: e.g. minecraft:diamond_axe for harvesting or minecraft:wheat_seeds etc. for replanting
// pause: tick delay between each mouse key press. may be useful to increase if the bot encounters anticheat issues
// error: whether or not the bot should abort if it is unable to pick the specified item

function farmLine(tx, tz, yaw, pitch = 90, item = null, pause = 1, dura = 15, error = false) {

    pos = Player.getPlayer().getPos();

    Player.getPlayer().lookAt(yaw, pitch);

    if (item != null) {
        pick(item);
    }

    Client.waitTick(pause);
    KeyBind.keyBind('key.use', true);
    Client.waitTick(pause);
    KeyBind.keyBind('key.use', false);
    Client.waitTick(pause);

    KeyBind.keyBind('key.forward', true);
    while ((parseInt(pos.z) == tz || parseInt(pos.x) == tx) && !(parseInt(pos.z) == tz && parseInt(pos.x) == tx)) {
        Player.getPlayer().lookAt(yaw, pitch);
        /*
        if (item != null) {
            if (!pick(item, dmg = dura) && error) {
                Chat.log("ERROR: Failed to pick item, aborting");
                KeyBind.keyBind('key.forward', false);
                throw 'Exception';
            }
        }
        */

        Client.waitTick(pause);
        KeyBind.keyBind('key.use', true);
        Client.waitTick(pause);
        KeyBind.keyBind('key.use', false);
        Client.waitTick(pause);
        pos = Player.getPlayer().getPos();
    }

    KeyBind.keyBind('key.forward', false);
    Client.waitTick(pause);
}

// Function to reset Minecraft's window focus variable
// Useful for when clicks stop being registered after using a menu while tabbed out
function resetFocus() {
    focused = Reflection.getDeclaredField(Client.getMinecraft().getClass(), "field_1695");
    focused.setAccessible(true);
    focused.set(Client.getMinecraft(), true);
    Client.waitTick();
}

function countItems(name, location = null) {
    count = 0;
    inv = Player.openInventory();
    slots = inv.getMap();
    for (section in slots) {
        for (slot in slots[section]) {
            item = inv.getSlot(slot);
            if (item.getItemId() == name && (location == null || location == inv.getLocation(slot))) {
                count += item.getCount();
            }
        }
    }
    return count;
}

function countInventorySpace() {
    let count = 0;
    let inv = Player.openInventory();
    let slots = inv.getMap();
    for (let slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {
        let item = inv.getSlot(slot);
        if (item.getItemId() === "minecraft:air") {
            count += 1;
        }
    }
    return count;
}

function dropoff(tx, tz, item) {
    walkTo(tx, tz);
    if (item == deposititem) {
        Player.getPlayer().lookAt(depositwheatyaw, depositwheatpitch);
    }
    if (item == seeditem) {
        Player.getPlayer().lookAt(depositseedyaw, depositseedpitch);
    }
    Time.sleep(100);
    deposit(item);
    resetFocus();
    Time.sleep(250);
    walkTo(startx, startz);
}

pos = Player.getPlayer().getPos();

walkTo(startx, startz);

rx = startx;

for (let rx = parseInt(pos.x); rx + 1; rx++) {
    countInventorySpace();
    if (countInventorySpace() < threshold) {
        dropoff(depositwheatx, depositwheatz, deposititem);
        dropoff(depositseedx, depositseedz, seeditem);
    }

    walkTo(rx, startz);
    if (!!tool) {
        pick(tool);
    }
    Time.sleep(250);
    farmLine(rx, endz, hyaw, pitch = 30, item = tool, pause = 1, dura = 15, error = false);
    rx += 1;
    walkTo(rx, endz)
    Time.sleep(250);
    farmLine(rx, startz, pyaw, pitch = 30, item = tool, pause = 1, dura = 15, error = false);
    Time.sleep(250);
    if (GlobalVars.getBoolean("stopall") == true) {
        Chat.log("STOPALL");
        throw 'Exception';
    }
}
