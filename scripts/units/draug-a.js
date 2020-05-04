const draugA=extendContent(UnitType,"draug-a",{});
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
      var entity=this.super.getClosestCore();
      if(entity==null) return;
      this.super.findItem();
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
      if(this.super.item().amount==0){
        this.super.clearItem();
        this.super.stateSet(this.super.customMine);
        return;
      }
      this.super.target=this.super.getClosestCore();
      var tile=this.super.target;
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
  getClosestCore(){
    var targetT=null;
    while(targetT==null){
      targetT=Vars.tileGroup.find(boolf(tile=>{
        var searchScale=100;
        return this.dst(this)<=searchScale&&this.getTeam()==tile.getTeam()
        &&(tile.tile.block().acceptItem(Vars.content.getByName(ContentType.item,"steam-power-copper-ore"),tile.tile,tile.tile)||tile.tile.block().acceptItem(Vars.content.getByName(ContentType.item,"steam-power-lead-ore"),tile.tile,tile.tile)||tile.tile.block().acceptItem(Items.coal,tile.tile,tile.tile))
        &&(tile.tile.block()==Vars.content.getByName(ContentType.block,"steam-power-blast-furnace")||tile.tile.block()==Vars.content.getByName(ContentType.block,"steam-power-advanced-furnace"))
      }))
    }
    return targetT
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
  update(){
    if(this.isDead()){
      this.remove();
      return;
    }
    this.hitTime-=Time.delta();
    if(Vars.net.client()){
      this.interpolate();
      this.status.update(this);
      return;
    }else this.updateRotation();
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
