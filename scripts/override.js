function hide(block){
  Blocks[block].buildVisibility=BuildVisibility.sandboxOnly;
}
var hideArray=[/*"copperWall","copperWallLarge","titaniumWall","titaniumWallLarge",
"plastaniumWall","plastaniumWallLarge","thoriumWall","thoriumWallLarge","door",
"doorLarge","phaseWall","phaseWallLarge","surgeWall","surgeWallLarge",
"siliconSmelter","kiln","graphitePress","plastaniumCompressor","multiPress","phaseWeaver",
*/"surgeSmelter",/*"pyratiteMixer","blastMixer","cryofluidMixer",*/"melter",/*"separator",
"sporePress","pulverizer","incinerator","coalCentrifuge",
"mender","mendProjector","overdriveProjector","forceProjector",
"shockMine",*/"conveyor","titaniumConveyor","armoredConveyor",/*"junction",
"itemBridge","phaseConveyor","sorter","invertedSorter","router","distributor",
"overflowGate","underflowGate","massDriver",*/"mechanicalPump",/*"rotaryPump",
"thermalPump","conduit","pulseConduit","platedConduit","liquidRouter","liquidJunction",
"liquidTank","bridgeConduit","phaseConduit","powerNode","powerNodeLarge",
"surgeTower","diode","battery","batteryLarge","combustionGenerator",*/"thermalGenerator",
"turbineGenerator","differentialGenerator",/*"rtgGenerator","solarPanel","largeSolarPanel",
*/"thoriumReactor","impactReactor",/*"mechanicalDrill","pneumaticDrill","laserDrill",
"blastDrill","waterExtractor","cultivator","oilExtractor","vault","container",
"unloader","launchPad","launchPadLarge","duo","scatter","scorch","hail","wave",
"lancer","arc","swarmer","salvo","fuse","ripple","cyclone","spectre","meltdown",
"draugFactory","spiritFactory","phantomFactory","commandCenter","wraithFactory",
"ghoulFactory","revenantFactory","daggerFactory","crawlerFactory","titanFactory",
"fortressFactory","repairPoint","dartPad","deltaPad","tauPad","omegaPad","javelinPad",
"tridentPad","glaivePad","message"*/];
for(var i=0;i<hideArray.length;i++){
  hide(hideArray[i]);
};
