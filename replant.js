
let item = event.item;
let damage = event.damage;
const sapling = "minecraft:oak_sapling";

function pick(sapling) {
    inv = Player.openInventory();
    totalInv = inv.getTotalSlots();
    count = 0
    thing = 0;
    namer = ""
    thing = Player.openInventory().getSlot(count);
    namer = thing.getName().getString();
    Chat.log(`Found item ${thing}`)
}

/*
thing = Player.openInventory().getSlot(1);
namer = thing.getName().getString();
Chat.log(`Found item ${namer}`)
*/

function replant(sapling) {
    Player.getPlayer().lookAt(0, 90);               //Look straight down
    pick(sapling);                            //Probably old function
    //Look down
    //Place sapling
    //Look back up
    //continue
    
}

replant(sapling);

Chat.log("LOG: Stop replant.js");