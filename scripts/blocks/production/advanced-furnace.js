const multiLib=require("multi-lib/wrapper");
const advancedFurnace=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"advanced-furnace",{

},
{
  _output:[
    [[["copper",2] ]  ,[["slag",2]]   ,null],
    [[["lead",2]]     ,[["slag",2] ]  ,null],
    [[["titanium",2]] ,[["slag",2]]   ,null],
    [[["steam-power-iron",2]]     ,[["slag",2]]   ,null],
    [null,[["slag",4]],null]
  ],
  _input:[
    [[["steam-power-copper-ore",2]   ,["coal",1] ]  ,null    ,null],
    [[["steam-power-lead-ore",2]     ,["coal",1] ]   ,null    ,null],
    [[["steam-power-titanium-ore",2] ,["coal",1]]    ,null    ,null],
    [[["steam-power-iron-ore",2]     ,["coal",1]]    ,null    ,null],
    [[["scrap",1]],null,1]
  ],
  craftTimes:[80,80,80,80],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
advancedFurnace.enableInv=true;
advancedFurnace.dumpToggle=false;
