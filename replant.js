const { replace } = require("./inventory/replacer/replace.js");

const sapling = "minecraft:oak_sapling";

function replant(sapling) {
    Player.getPlayer().lookAt(0, 90);               //Look straight down
    //pick(sapling);                            //Probably old function
    //Look down
    //Place sapling
    //Look back up
    //continue
    
}

replant(sapling);
Chat.log("Finished replant.js");
/*
module.exports = {
    replant: replant,
}
*/