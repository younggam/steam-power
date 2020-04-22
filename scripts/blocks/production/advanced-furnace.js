const multiLib=require("multi-lib/wrapper");
const advancedFurnace=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"advanced-furnace",{
  random:new Rand(0),
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    Draw.color(Color.salmon);
    Draw.alpha(entity.warmup);
    Draw.rect(Core.atlas.find(this.name+"-top"),tile.drawx(),tile.drawy());
    var seeds=Math.round(entity.warmup*18);
    Draw.color(Color.valueOf("474747"),Color.gold,entity.warmup);
    this.random.setSeed(tile.pos());
    for(var i=0;i<seeds;i++){
      var offset=this.random.nextFloat()*999999;
      var x=this.random.range(6),y=this.random.range(6);
      var life=1-(((Time.time()+offset)/50)%6);
      if(life>0){
        Lines.stroke(entity.warmup*(life*1+0.2));
        Lines.poly(tile.drawx()+x,tile.drawy()+y,8,(1-life)*3);
      }
    }
    Draw.color();
  }
},
{
  _output:[
    [[["copper",2] ]  ,[["slag",2]]   ,null],
    [[["lead",2]]     ,[["slag",2] ]  ,null],
    [[["titanium",2]] ,[["slag",2]]   ,null],
    [[["steam-power-iron",2]]     ,[["slag",2]]   ,null],
    [[["steam-power-glass",1]],null,null],
    [null,[["slag",4]],null]
  ],
  _input:[
    [[["steam-power-copper-ore",2]   ,["coal",1] ]  ,null    ,null],
    [[["steam-power-lead-ore",2]     ,["coal",1] ]   ,null    ,null],
    [[["steam-power-titanium-ore",2] ,["coal",1]]    ,null    ,null],
    [[["steam-power-iron-ore",2]     ,["coal",1]]    ,null    ,null],
    [[["sand",1]],null,0.5],
    [[["scrap",1]],null,1]
  ],
  craftTimes:[80,80,80,40,80],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
advancedFurnace.enableInv=true;
advancedFurnace.dumpToggle=false;
