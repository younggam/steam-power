const multiLib=require("multi-lib/wrapper");
const semiconductorPlant=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"semiconductor-plant",{

},
{
  _output:[
    [[["steam-power-circuit",1] ]    ,null   ,null],
    [[["steam-power-semiconductor",1]] ,null   ,null],
    [[["steam-power-computer",1] ]    ,null   ,null],
  ],
  _input:[
    [[["lead",2]   ,["silicon",1] ]  ,null    ,1],
    [[["silicon",1] ,["graphite",1],["plastanium",1]]    ,null    ,3],
    [[["steam-power-semiconductor",1] ,["steam-power-circuit",1],["surge-alloy",1]]    ,null    ,9],
  ],
  craftTimes:[120,120,240],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
semiconductorPlant.enableInv=true;
semiconductorPlant.dumpToggle=true;
