const multiLib=require("multi-lib2/wrapper");
const missileFactory=multiLib.extend(GenericCrafter,"missile-factory",
[
  {
    input:{
      items:["steam-power-iron/2","plastanium/1","blast-compound/2"],
      power:3
    },
    output:{
      items:["steam-power-missile/1"]
    },
    craftTime:90
  },
  {
    input:{
      items:["steam-power-uranium/2","thorium/2","steam-power-missile/1"],
      power:10
    },
    output:{
      items:["steam-power-doom/1"]
    },
    craftTime:90
  },
],{},{});
missileFactory.dumpToggle=true;
