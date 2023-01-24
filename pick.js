//  Function to equip a given item on the hotbar if located in inventory
//      name: "minecraft:item_name"
//      hotbar: Hotbar slot to swap item to, 0 - 9
//      dmg: Minimum damage value, intended for use with tools to prevent breakages
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
        Time.sleep(250);                                                            // Wait
        inv.setSelectedHotbarSlotIndex(parseInt(slot));                             // Select hotbar slot
        inv.close();                                                                // Close inventory
        return true;                                                                // pick() success
    }

    for (slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {   // For all slots in inventory
        item = inv.getSlot(slot);                                                   // Acquire item in slot
        dura = item.getMaxDamage() - item.getDamage();                              // Determine item durability
        if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {               // If item is target and item isn't sufficiently damaged
            //Chat.log(`Found ${item.getItemId()} in hand at slot ${slot}.`);
            inv.swap(slot, slots["hotbar"][hotbar]);                                    // Swap item in slot with hotbar slot
            Time.sleep(250);                                                            // Wait
            inv.setSelectedHotbarSlotIndex(hotbar);                             // Select hotbar slot
            inv.close();                                                                // Close inventory
            return true;                                                                // pick() success
        }
    }
    inv.close();                                                                // Close inventory
    return false;                                                               // pick() fail
}

pick("minecraft:diamond_axe", hotbar = 1);