const multiLib=require("multi-lib/wrapper");
const furnaces=this.global.furnaces;
const blastFurnace=multiLib.extend(GenericCrafter,GenericCrafter.GenericCrafterEntity,"blast-furnace",{
  _configure(entity,value){
    for(var i=0;i<this.input.length;i++){
      if(entity.getToggle()==i){
        entity.saveProgress(entity.getToggle(),entity.progress);
        break;
      }
    }
    entity.progress=0;
    entity.modifyToggle(value);
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
  update(tile){
    const entity=tile.ent();
    if(entity!=null&&Time.time()%60<Time.delta()) {
      this.register(entity,1);
    }
    for(var i=0;i<this.itemList.length;i++){
      entity.getItemStat()[i]=entity.items.get(this.itemList[i]);
    }
    //calls customCons and customProd
    for(var z=0;z<this.input.length;z++){
      if(!this.checkoutput(tile,z)&&!this.checkinput(tile,z)&&!(this.hasPower==true&&entity.power.status<=0&&this.input[z][2]!=null)){
        this._configure(entity,z);
        this.customCons(tile,z);
        if(entity.getToggle()==z&&entity.progress>=1){
          this.customProd(tile,z);
        }
        break;
      }
    }
    if(z==this.input.length) entity.warmup=Mathf.lerpDelta(entity.warmup,0,0.002);
    //dump
    //dump
    var exitI=false;
    var exitL=false;
    //when normal button checked
    if(entity.getToggle()!=this.input.length){
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
    }
    //when trash button is checked. dump everything if possible/
    else if(entity.getToggle()==this.input.length){
      //dump items and liquids even input
      if(entity.timer.get(this.timerDump,this.dumpTime)&&entity.items.total()>0){
        this.tryDump(tile);
      }
      if(entity.liquids.total()>0.01){
        for(var i=0;i<this.liquidList.length;i++){
          if(entity.liquids.get(this.liquidList[i])>0.01){
            this.tryDumpLiquid(tile,this.liquidList[i]);
            break;
          }
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
      entity.progress+=(entity.items.get(Items.coal)>0?2.5:1)*entity.warmup*this.getProgressIncrease(entity,this.craftTimes[i]);
      if(entity.items.get(Items.coal)>0){
        var oldProgress=entity.totalProgress;
        var prog=entity.warmup*Time.delta()
        entity.totalProgress+=prog;
        if(entity.totalProgress>=120) {
          entity.items.remove(Items.coal,1);
          entity.totalProgress=0;
        }
      }
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
          ,floatp(()=>(entity.items.total()-entity.items.get(Items.coal))/(itemCapacity*itemList.length)))
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
  //decides which item to accept
  acceptItem(item,tile,source){
    const entity=tile.ent();
    if(entity==null) return;
    if(entity.items.get(item)>=this.itemCapacity) return false;
    if(item==Items.coal) return true;
    for(var i in this.inputItemList){
      if(item==this.inputItemList[i]){
        return true;
      }
    }
    return false;
  },
  //custom function that checks space for item and liquid
  checkoutput(tile,i){
    const entity=tile.ent();
    //items
    if(this.output[i][0][0]!=null){
      for(var j=0;j<this.output[i][0].length;j++){
        if(entity.items.get(this.output[i][0][j].item)+this.output[i][0][j].amount>this.itemCapacity) return true;
      }
    }
    return false;
  },
  random:new Rand(0),
  draw(tile){
    const entity=tile.ent();
    Draw.rect(this.region,tile.drawx(),tile.drawy());
    if(entity.warmup>0.01) {
      Draw.color(Color.salmon);
      Draw.alpha(entity.warmup);
      Draw.rect(this.topRegion,tile.drawx(),tile.drawy());
      if(entity.warmup>0.4) {
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
      }
      Draw.color();
    }
  },
  load(){
    this.super$load();
    this.topRegion=Core.atlas.find(this.name+"-top")
  }
},
{
  _output:[
    [[["copper",1] ]  ,[["slag",1]]   ,null],
    [[["lead",1]]     ,[["slag",1]]   ,null],
    [[["steam-power-iron",1]] ,[["slag",1] ]  ,null],
    [[["titanium",1]]     ,[["slag",1]]   ,null],
    [[["steam-power-glass",1]],null,null],
    [null,[["slag",2]],null]
  ],
  _input:[
    [[["steam-power-copper-ore",1]]   ,null    ,null],
    [[["steam-power-lead-ore",1]]    ,null    ,null],
    [[["steam-power-iron-ore",1]]    ,null    ,null],
    [[["steam-power-titanium-ore",1]]   ,null    ,null],
    [[["sand",1]],null,null],
    [[["scrap",1]],null,null]
  ],
  craftTimes:[100,100,100,100,100,50],
  output:[],
  input:[],
  itemList:[],
  liquidList:[],
  isSameOutput:[],
});
blastFurnace.enableInv=false;
blastFurnace.dumpToggle=false;
blastFurnace.configurable=false;
