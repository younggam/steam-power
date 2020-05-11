const draugA=extendContent(UnitType,"draug-a",{});
draugA.isCounted={};
draugA.seconds={};
for(var i in Team.base()) {
  draugA.isCounted[Team.get(i)]=true;
  draugA.seconds[Team.get(i)]=true;
}
const furnaces=this.global.furnaces;
function CustomState(that){
  this.super=that;
}
draugA.create(prov(()=> new JavaAdapter(MinerDrone,{
  customStateMachine:{
    _state:null,
    update(){
      if(this._state!=null) this._state.update();
    },
    set(next){
      if(next==this._state) return;
      if(this._state!=null) this._state.exited();
      this._state=next;
      if(next!=null) next.entered();
    },
    current(){
      return this._state;
    },
    is(state){
      return this._state==state;
    }
  },
  initializer(){
    this.customMine=new CustomState(this)
    this.customMine.entered=function(){
      this.super.target=null;
    }
    this.customMine.update=function(){
      if(Time.time()%60<Time.delta()) this.super.getClosestFurnace();
      var entity=this.super._closestFurnace[0];
      if(entity==null) return;
      if(this.super==null) return;
      try{this.super.findItem();}
      catch(e){return;}
      if(this.super.targetItem!=null&&entity.block.acceptStack(this.super.targetItem,1,entity.tile,this.super)==0){
        this.super.clearItem();
        return;
      }
      if(this.super.item().amount>=this.super.getItemCapacity()||(this.super.targetItem!=null&&!this.super.acceptsItem(this.super.targetItem))||this.super.item().amount>=entity.block.acceptStack(this.super.targetItem,entity.block.itemCapacity-entity.items.get(this.super.targetItem),entity.tile,this.super)){
        this.super.stateSet(this.super.customDrop);
      }else{
        if(this.super.retarget()&&this.super.targetItem!=null){
          this.super.target=Vars.indexer.findClosestOre(this.super.x,this.super.y,this.super.targetItem);
        }
        if(this.super.target instanceof Tile){
          this.super.moveTo(this.super.type.range/1.5);
          if(this.super.dst(this.super.target)<this.super.type.range&&this.super.mineTile!=this.super.target){
            this.super.setMineTile(this.super.target);
          }
          if(this.super.target.block()!=Blocks.air){
            this.super.stateSet(this.super.customDrop);
          }
        }else{
          if(this.super.getSpawner()!=null){
            this.super.target=this.super.getSpawner();
            this.super.circle(40);
          }
        }
      }
    }
    this.customMine.exited=function(){
      this.super.setMineTile(null);
    }
    //
    this.customDrop=new CustomState(this)
    this.customDrop.entered=function(){
      this.super.target=null;
    }
    this.customDrop.update=function(){
      if(this.super==null) return;
      if(this.super.item().amount==0){
        this.super.clearItem();
        this.super.stateSet(this.super.customMine);
        return;
      }
      if(Time.time()%60<Time.delta()) this.super.getClosestFurnace();
      this.super.target=this.super._closestFurnace[0];
      var tile=this.super.target;
      if(this.super.target==null) return;
      if(this.super.dst(this.super.target)<this.super.type.range){
        if(tile.tile.block().acceptStack(this.super.item().item,this.super.item().amount,tile.tile,this.super)>0){
          Call.transferItemTo(this.super.item().item,Mathf.clamp(this.super.item().amount,0,tile.tile.block().itemCapacity-tile.items.get(this.super.item().item)),this.super.x,this.super.y,tile.tile);
        }
        this.super.clearItem();
        this.super.stateSet(this.super.customMine);
      }
      this.super.circle(this.super.type.range/1.8);
    }
    this.customDrop.exited=function(){

    }
    this.customRetreat=new CustomState(this);
    this.customRetreat.entered=function(){
      this.super.target=null;
    }
    this.customRetreat.update=function(){
      if(this.super==null) return;
      if(this.super.health>=this.super.maxHealth()){
        this.super.stateSet(this.super.customMine);
      }else if(!this.super.targetHasFlag(BlockFlag.repair)){
        if(this.super.retarget()){
          var repairPoint=Geometry.findClosest(this.super.x,this.super.y,Vars.indexer.getAllied(this.super.team,BlockFlag.repair));
          if(repairPoint!=null){
            this.super.target=repairPoint;
          }else{
            this.super.stateSet(this.super.customMine);
          }
        }
      }else{
        this.super.circle(40);
      }
    }
    this.customRetreat.exited=function(){

    }
  },
  _closestFurnace:[null,null],
  getClosestFurnace(){
    if(furnaces.sizes[this.team]==0) return;
    var escape=false;
    var candi=Object.keys(furnaces.entities[this.team]).find(x=>{
      if(escape) return false;
      if(!furnaces.isFurnace(Vars.world.tile(furnaces.entities[this.team][x][0].tile.x,furnaces.entities[this.team][x][0].tile.y).block())) {
        escape=true;
        furnaces.reset();
        return false;
      }
      if(this.dst(furnaces.entities[this.team][x][0].tile)>400) return false;
      if(furnaces.entities[this.team][x][1]<Math.ceil(furnaces.draugs[this.team]/furnaces.sizes[this.team])||(furnaces.entities[this.team][x][1]==Math.ceil(furnaces.draugs[this.team]/furnaces.sizes[this.team])&&this._closestFurnace==furnaces.entities[this.team][x])) {
        furnaces.updateCounts(furnaces.entities[this.team][x],this);
        return true;
      }
      return false;
    },this);
    if (candi!=null )this._closestFurnace=furnaces.entities[this.team][candi];
    else this._closestFurnace=[null,null];
  },
  getClosestCore(){
    return this._closestFurnace[0];
  },
  stateSet(state){
    this.customStateMachine.set(state);
  },
  added(){
    this.initializer();
    this.customStateMachine.set(this.customMine);
    if(!this.loaded){
      this.health(this.maxHealth());
    }
  },
  getStartState(){
    return null;
  },
  removed(){
    furnaces.updateCounts([null,null],this);
  },
  update(){
    if(this.isDead()){
      this.remove();
      return;
    }
    if(Vars.net.client()){
      this.interpolate();
      this.status.update(this);
      return;
    }else this.updateRotation();
    if(Time.time()%60<Time.delta()&&!this.type.seconds==Time.time()/60) {
      this.type.seconds[this.team]=Time.time()/60;
      this.type.isCounted[this.team]=false;
    }
    if(!this.type.isCounted) furnaces.updateDraugs(this.team);
    this.hitTime-=Time.delta();
    if(!this.isFlying()&&(Vars.world.tileWorld(this.x,this.y)!=null&&!(Vars.world.tileWorld(this.x,this.y).block() instanceof BuildBlock)&&Vars.world.tileWorld(this.x,this.y).solid())){
      this.kill();
    }
    this.avoidOthers();
    if(this.spawner!=this.noSpawner&&(Vars.world.tile(this.spawner)==null||!(Vars.world.tile(this.spawner).entity instanceof UnitFactory.UnitFactoryEntity))){
      this.kill();
    }
    this.updateTargeting();
    this.customStateMachine.update();
    this.updateVelocityStatus();
    if(this.target==null) this.behavior();
    if(!this.isFlying()){
      this.clampPosition();
    }
    this.wobble();
    this.updateMining();
  },
  behavior(){
    if(this.health<=this.maxHealth()*this.type.retreatPercent&&!this.customStateMachine.is(this.customRetreat)&&Geometry.findClosest(this.x,this.y,Vars.indexer.getAllied(this.team,BlockFlag.repair))!=null){
      this.stateSet(this.customRetreat);
    }
  },
  write(data){
    this.super$write(data);
    data.writeInt(this.mineTile==null||!this.customStateMachine.is(this.customMine)?Pos.invalid:this.mineTile.pos());
  },
  read(data){
    this.super$read(data);
    this.mineTile=Vars.world.tile(data.readInt());
  }
})));
