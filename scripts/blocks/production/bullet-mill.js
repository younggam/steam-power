const multiLib=require("multi-lib/wrapper");
const bulletMill=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"bullet-mill",{

},
{
  _output:[
    [[["steam-power-bullet",2]]   ,null   ,null],
    [[["steam-power-armor-piercing-shell",2]]     ,null   ,null],
    [[["steam-power-cluster-bullet",2]] ,null   ,null],
    [[["steam-power-high-explosive",1] ]    ,null   ,null],
  ],
  _input:[
    [[["lead",2]   ,["pyratite",1]]   ,null    ,0.5],
    [[["steam-power-steel",1]     ,["pyratite",1],["titanium",1]]    ,null    ,1],
    [[["lead",2],["steam-power-iron",1] ,["pyratite",2] ]   ,null    ,1],
    [[["lead",1],["steam-power-iron",1]     ,["blast-compound",1] ]   ,null    ,1],
  ],
  craftTimes:[80,90,90,90],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
bulletMill.enableInv=true;
bulletMill.dumpToggle=false;
