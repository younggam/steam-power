const multiLib=require("multi-lib/wrapper");
const furnaces=this.global.furnaces;
const advancedFurnace=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"advanced-furnace",{
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
        new Bar(prov(()=>Core.bundle.format("bar.poweroutput",entity.block.getPowerProduction(entity.tile)*60*entity.timeScale)),prov(()=>Pal.powerBar),floatp(()=>entity!=null?entity.getPowerStat():0))
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
          new Bar(prov(()=>Core.bundle.format("bar.items",entity.getItemStat().join('/')))
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
      new Bar(prov(()=>Core.bundle.formatFloat("bar.efficiency",entity.warmup*100*(entity.items.get(Items.coal)>0?2.5:1),1)),prov(()=>Pal.ammo),floatp(()=>entity.warmup*(entity.items.get(Items.coal)>0?2.5:1)))
    ));
  },
  //for dislpying info
  setStats(){
    this.itemList[this.itemList.length]=Items.coal;
    this.super$setStats();
    this.stats.remove(BlockStat.powerUse);
    this.stats.remove(BlockStat.productionTime);
    this.stats.add(BlockStat.booster,new ItemListValue(ItemStack(Items.coal,1)))
    this.stats.add(BlockStat.boostEffect,2.5,StatUnit.timesSpeed);
    //crafTimes
    for(var i=0;i<this.craftTimes.length;i++){
      this.stats.add(BlockStat.productionTime,i+1,StatUnit.none);
      this.stats.add(BlockStat.productionTime,this.craftTimes[i]/60,StatUnit.seconds);
    }
    //output
    for(var j=0;j<this.output.length;j++){
      this.stats.add(BlockStat.output,j+1,StatUnit.none);
      //items
      if(this.output[j][0][0]!=null){
        for(var jj=0;jj<this.output[j][0].length;jj++){
          this.stats.add(BlockStat.output,this.output[j][0][jj]);
        }
      }
      //liquids
      if(this.output[j][1][0]!=null){
        for(var jj=0;jj<this.output[j][1].length;jj++){
          this.stats.add(BlockStat.output,this.output[j][1][jj].liquid,this.output[j][1][jj].amount,false);
        }
      }
    }
    //input
    for(var k=0;k<this.input.length;k++){
      this.stats.add(BlockStat.input,k+1,StatUnit.none);
      //items
      if(this.input[k][0][0]!=null){
        for(var l=0;l<this.input[k][0].length;l++){
          this.stats.add(BlockStat.input,this.input[k][0][l]);
        }
      }
      //liquids
      if(this.input[k][1][0]!=null){
        for(var l=0;l<this.input[k][1].length;l++){
          this.stats.add(BlockStat.input,this.input[k][1][l].liquid,this.input[k][1][l].amount,false);
        }
      }
    }
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
    //poweroutput
    if(powerBarO){
      for(var ii=0;ii<this.output.length;ii++){
        if(this.output[ii][2]!=null){
          this.stats.add(BlockStat.basePowerGeneration,ii+1,StatUnit.none);
          this.stats.add(BlockStat.basePowerGeneration,this.output[ii][2]*60,StatUnit.powerSecond);
        }else{
          this.stats.add(BlockStat.basePowerGeneration,ii+1,StatUnit.none);
          this.stats.add(BlockStat.basePowerGeneration,0,StatUnit.powerSecond);
        }
      }
    }
    if(powerBarI){
      //powerconsume
      for(var l=0;l<this.input.length;l++){
        if(this.input[l][2]!=null){
          this.stats.add(BlockStat.powerUse,l+1,StatUnit.none);
          this.stats.add(BlockStat.powerUse,this.input[l][2]*60,StatUnit.powerSecond);
        }else{
          this.stats.add(BlockStat.powerUse,l+1,StatUnit.none);
          this.stats.add(BlockStat.powerUse,0,StatUnit.powerSecond);
        }
      }
    }
  },
  //custom function for consumeing items and liquids
  customCons(tile,i){
    const entity=tile.ent();
    entity.saveCond(this.checkCond(tile,i));
    if(this.checkCond(tile,i)){
      //do produce
      if(entity.getProgress(i)!=0&&entity.getProgress(i)!=null){
        entity.progress=entity.getProgress(i);
        entity.saveProgress(i,0);
      }
      entity.progress+=(entity.items.get(Items.coal)>0?2.5:1)*entity.warmup*this.getProgressIncrease(entity,this.craftTimes[i]);
      if(entity.items.get(Items.coal)>0){
        var oldProgress=entity.totalProgress;
        var prog=Time.delta()
        entity.totalProgress+=prog;
        if(entity.totalProgress>=120) {
          entity.items.remove(Items.coal,1);
          entity.totalProgress=0;
        }
        if(entity.totalProgress%120<=prog&&entity.totalProgress!=0&&!(oldProgress<=prog)) entity.items.remove(Items.coal,1);
      }
      entity.warmup=Mathf.lerpDelta(entity.warmup,1,0.02);
      if(Mathf.equal(entity.warmup,1,0.02)){
        entity.warmup=1;
      }
      if(Mathf.chance(Time.delta()*this.updateEffectChance)){
        Effects.effect(this.updateEffect,entity.x+Mathf.range(this.size*4),entity.y+Mathf.range(this.size*4));
      }
    }else{
      entity.warmup=Mathf.lerp(entity.warmup,0,0.02);
    }
  },
  //decides which item to accept
  acceptItem(item,tile,source){
    const entity=tile.ent();
    if(entity.items.get(item)>=this.itemCapacity) return false;
    if(item==Items.coal) return true;
    for(var i in this.inputItemList){
      if(item==this.inputItemList[i]){
        return true;
      }
    }
    return false;
  },
  placed(tile){
    this.super$placed(tile);
    this.register(tile.entity,1);
  },
  register(entity,value){
    if(entity!=null)furnaces.update(entity,value);
  },
  removed(tile){
    this.register(tile.entity,1);
    this.register(tile.entity,0);
  },
  customUpdate(tile){
    const entity=tile.ent();
    if(entity==null) return;
    if(entity.getToggle()==-1||entity.getToggle()==this.input.length)entity.warmup=Mathf.lerp(entity.warmup,0,0.02);
    if(Time.time()%60<Time.delta()) {
      this.register(entity,1);
    }
  },
  random:new Rand(0),
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    if(entity.warmup<=0.01) return;
    Draw.color(Color.salmon);
    Draw.alpha(entity.warmup);
    Draw.rect(Core.atlas.find(this.name+"-top"),tile.drawx(),tile.drawy());
    if(entity.warmup<=0.4) return;
    var seeds=Math.round(entity.warmup*12);
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
  },
},
{
  _output:[
    [[["copper",1] ]  ,[["slag",1]]   ,null],
    [[["lead",1]]     ,[["slag",1] ]  ,null],
    [[["titanium",1]] ,[["slag",1]]   ,null],
    [[["steam-power-iron",1]]     ,[["slag",1]]   ,null],
    [[["steam-power-glass",1]],null,null],
    [null,[["slag",2]],null]
  ],
  _input:[
    [[["steam-power-copper-ore",1]    ]  ,null    ,0.6],
    [[["steam-power-lead-ore",1]      ]   ,null    ,0.6],
    [[["steam-power-titanium-ore",1] ]    ,null    ,0.6],
    [[["steam-power-iron-ore",1]     ]    ,null    ,0.6],
    [[["sand",1]],null,0.6],
    [[["scrap",1]],null,0.6]
  ],
  craftTimes:[50,50,50,50,50,25],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
advancedFurnace.enableInv=true;
advancedFurnace.dumpToggle=false;
//advancedFurnace.entityType=prov(()=>extend();
