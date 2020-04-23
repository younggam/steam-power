const multiLib=require("multi-lib/wrapper");
const blastFurnace=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"blast-furnace",{
  update(tile){
    const entity=tile.ent();
    for(var i=0;i<this.itemList.length;i++){
      entity.getItemStat()[i]=entity.items.get(this.itemList[i]);
    }
    //calls customCons and customProd
    for(var z=0;z<this.input.length;z++){
      if(!this.checkoutput(tile,z)&&!this.checkinput(tile,z)&&!(this.hasPower==true&&entity.power.status<=0&&this.input[z][2]!=null)){
        entity.modifyToggle(z);
        this.customCons(tile,z);
        if(entity.getToggle()==z&&entity.progress>=1){
          this.customProd(tile,z);
        }
        break;
      }
    }
    if(z==this.input.length) entity.warmup=Mathf.lerpDelta(entity.warmup,0,0.002);
    //dump
    var exitI=false;
    var exitL=false;
    if(entity.timer.get(this.timerDump,this.dumpTime)){
      //dump items in order
      for(var ii=0;ii<this.output.length;ii++){
        if(this.output[ii][0][0]!=null){
          for(var ij=0;ij<this.output[ii][0].length;ij++){
            if(entity.items.get(this.output[ii][0][ij].item)>0&&((!this.dumpToggle)||entity.getToggle()==ii)){
              this.tryDump(tile,this.output[ii][0][ij].item);
              exitI=true;
              break;
            }
          }
          if(exitI){
            exitI=false;
            break;
          }
        }
      }
    }
    //dump liquids in order
    for(var jj=0;jj<this.output.length;jj++){
      if(this.output[jj][1][0]!=null){
        for(var i=0;i<this.output[jj][1].length;i++){
          if(entity.liquids.get(this.output[jj][1][i].liquid)>0.001&&((!this.dumpToggle)||entity.getToggle()==jj)){
            this.tryDumpLiquid(tile,this.output[jj][1][i].liquid);
            exitL=true;
            break;
          }
        }
        if(exitL){
          exitL=false;
          break;
        }
      }
    }
  },
  customCons(tile,i){
    const entity=tile.ent();
    entity.saveCond(this.checkCond(tile,i));
    if(this.checkCond(tile,i)){
      //do produce
      if(entity.getProgress(i)!=0&&entity.getProgress(i)!=null){
        entity.progress=entity.getProgress(i);
        entity.saveProgress(i,0);
      }
      entity.progress+=entity.warmup*this.getProgressIncrease(entity,this.craftTimes[i]);
      entity.totalProgress+=entity.delta();
      entity.warmup=Mathf.lerpDelta(entity.warmup,1,0.002);
      if(Mathf.equal(entity.warmup,1,0.002)){
        entity.warmup=1;
      }
      if(Mathf.chance(Time.delta()*this.updateEffectChance)){
        Effects.effect(this.updateEffect,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }
  },
  setBars(){
    this.super$setBars();
    //initialize
    this.bars.remove("liquid");
    //this.bars.remove("items");
    var powerBarI=false;
    var powerBarO=false;
    //decdes whether show poweroutput bar
    for(var i=0;i<this.output.length;i++){
      if(this.output[i][2]!=null){
        powerBarO|=true;
      }
    }
    //decides whether show powerUse bar
    for(var i=0;i<this.input.length;i++){
      if(this.input[i][2]!=null){
        powerBarI|=true;
      }
    }
    if(!powerBarI){
      this.bars.remove("power");
    }
    if(powerBarO){
      this.outputsPower=true;
      this.bars.add("poweroutput",func(entity=>
        new Bar(prov(()=>Core.bundle.format("bar.poweroutput",entity.block.getPowerProduction(entity.tile)*60*entity.timeScale)),prov(()=>Pal.powerBar),floatp(()=>entity.tile.entity!=null?entity.tile.entity.getPowerStat():0))
      ));
    }else if(!powerBarI){
      this.outputsPower=true;
    }else{
      this.outputsPower=false;
    }
    //show current Items amount
    if(this.itemList[0]!=null){
      (function(itemCapacity,itemList,bars){
        bars.add("items",func(entity=>
          new Bar(prov(()=>Core.bundle.format("bar.items",entity.tile.entity.getItemStat().join('/')))
          ,prov(()=>Pal.items)
          ,floatp(()=>entity.items.total()/(itemCapacity*itemList.length)))
        ));
      })(this.itemCapacity,this.itemList,this.bars)
    }
    //display every Liquids that can contain
    if(this.liquidList[0]!=null){
      for(var i=0;i<this.liquidList.length;i++){
        (function(i,liquidList,liquidCapacity,bars){
          bars.add("liquid"+i,func(entity=>
            new Bar(prov(()=>liquidList[i].localizedName),prov(()=>liquidList[i].barColor()),floatp(()=>entity.liquids.get(liquidList[i])/liquidCapacity))
          ));
        })(i,this.liquidList,this.liquidCapacity,this.bars)
      }
    }
    this.bars.add("multiplier",func(entity=>
      new Bar(prov(()=>Core.bundle.formatFloat("bar.efficiency",entity.warmup*100,1)),prov(()=>Pal.ammo),floatp(()=>entity.warmup))
    ));
  },
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
    [[["copper",1] ]  ,[["slag",1]]   ,null],
    [[["lead",1]]     ,[["slag",1]]   ,null],
    [[["steam-power-iron",1]] ,[["slag",1] ]  ,null],
    [[["titanium",1]]     ,[["slag",1]]   ,null],
    [[["steam-power-glass",1]],null,null],
    [null,[["slag",4]],null]
  ],
  _input:[
    [[["steam-power-copper-ore",2]   ,["coal",1]]   ,null    ,null],
    [[["steam-power-lead-ore",2]     ,["coal",1]]    ,null    ,null],
    [[["steam-power-iron-ore",2] ,["coal",1]]    ,null    ,null],
    [[["steam-power-titanium-ore",2]     ,["coal",1] ]   ,null    ,null],
    [[["sand",2],["coal",1]],null,null],
    [[["scrap",2],["coal",1]],null,null]
  ],
  craftTimes:[80,80,80,80,80,80],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
blastFurnace.enableInv=false;
blastFurnace.dumpToggle=false;
blastFurnace.configurable=false;
