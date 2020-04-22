const multiLib=require("multi-lib/wrapper");
const metalSmelter=multiLib.extend(GenericSmelter,GenericCrafter.GenericCrafterEntity,"metal-smelter",{

},
{
  _output:[
    [[["surge-alloy",1]]   ,null   ,null],
    [[["steam-power-steel",1]]     ,null   ,null],
    [[["steam-power-dense-alloy",1]] ,null   ,null],
  ],
  _input:[
    [[["copper",3],["lead",4],["titanium",2],["steam-power-iron",3]]   ,null    ,4],
    [[["steam-power-iron",2]     ,["graphite",1] ]   ,null    ,6],
    [[["steam-power-steel",2] ,["surge-alloy",1],["plastanium",1]]    ,null    ,8],
  ],
  craftTimes:[75,90,90,90],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
metalSmelter.enableInv=true;
metalSmelter.dumpToggle=true;
