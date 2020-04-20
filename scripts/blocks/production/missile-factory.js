const multiLib=require("multi-lib/wrapper");
const missileFactory=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"missile-factory",{

},
{
  _output:[
    [[["steam-power-missile",1]]   ,null  ,null],
    [[["steam-power-doom",1]]     ,null  ,null],
  ],
  _input:[
    [[["steam-power-iron",2],["plastanium",1]   ,["blast-compound",2]]   ,null    ,null],
    [[["steam-power-uranium",2],["thorium",2]     ,["steam-power-missile",1]]    ,null    ,null],
  ],
  craftTimes:[90,90],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
missileFactory.enableInv=true;
missileFactory.dumpToggle=true;
