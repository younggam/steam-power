const draugA=extendContent(UnitType,"draug-a",{});
const furnaces=this.global.furnaces;
var sex=0;
draugA.create(prov(()=>{
  const e=new JavaAdapter(MinerDrone,{
    added(){
      this.state=extend(StateMachine,{
        state:null,
        update(){
          if(this.state!=null) this.state.update();
        },
        set(next){
          if(next==this.state) return;
          if(this.state!=null)  this.state.exited();
          this.state=next;
          if(next!=null) next.entered();
        },
        current(){
          return this.state;
        },
        is(state){
          return this.state==state;
        }
      }),
      this.super$added();
    },
    customMine:extend(UnitState,{
      entered(){
        e.target=null;
      },
      update(){
        if(Time.time()%60<Time.delta()) e.getClosestFurnace();
        var entity=e._closestFurnace[0];
        if(entity==null||entity instanceof BuildBlock.BuildEntity) return;
        if(e==null) return;
        try{e.findItem();}
        catch(err){
          print(err)
          return;}
        if(e.targetItem!=null&&entity.block.acceptStack(e.targetItem,1,entity.tile,e)==0){
          e.clearItem();
          return;
        }
        if(e.item().amount>=e.getItemCapacity()||(e.targetItem!=null&&!e.acceptsItem(e.targetItem))||e.item().amount>=entity.block.acceptStack(e.targetItem,entity.block.itemCapacity-entity.items.get(e.targetItem),entity.tile,e)){
          e.setState(e.customDrop);
        }else{
          if(e.retarget()&&e.targetItem!=null){
            e.target=Vars.indexer.findClosestOre(e.x,e.y,e.targetItem);
          }
          if(e.target instanceof Tile){
            e.moveTo(e.type.range/1.5);
            if(e.dst(e.target)<e.type.range&&e.mineTile!=e.target){
              e.setMineTile(e.target);
            }
            if(e.target.block()!=Blocks.air){
              e.setState(e.customDrop);
            }
          }else{
            if(e.getSpawner()!=null){
              e.target=e.getSpawner();
              e.circle(40);
            }
          }
        }
      },
      exited(){
        e.setMineTile(null);
      }
    }),
    customDrop:new UnitState(){
      entered(){
        e.target=null;
      },
      update(){
        if(e==null) return;
        if(e.item().amount==0){
          e.clearItem();
          e.setState(e.customMine);
          return;
        }
        if(Time.time()%60<Time.delta()) e.getClosestFurnace();
        e.target=e._closestFurnace[0];
        var tile=e.target;
        if(tile==null||tile instanceof BuildBlock.BuildEntity) return;
        if(e.dst(e.target)<e.type.range){
          if(tile.tile.block().acceptStack(e.item().item,e.item().amount,tile.tile,e)>0){
            Call.transferItemTo(e.item().item,Mathf.clamp(e.item().amount,0,tile.tile.block().itemCapacity-tile.items.get(e.item().item)),e.x,e.y,tile.tile);
          }
          e.clearItem();
          e.setState(e.customMine);
        }
        e.circle(e.type.range/1.8);
      },
      exited(){

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
        if(furnaces.entities[this.team][x][0].block==Vars.content.getByName(ContentType.block,"steam-power-advanced-furnace")&&(furnaces.entities[this.team][x][0].getToggle()!=0&&furnaces.entities[this.team][x][0].getToggle()!=1)) return false;
        if(this.dst(furnaces.entities[this.team][x][0].tile)>400&&this._closestFurnace!=furnaces.entities[this.team][x]) return false;
        if(furnaces.entities[this.team][x][1]<Math.ceil(furnaces.draugs[this.team]/furnaces.sizes[this.team])||(furnaces.entities[this.team][x][1]==Math.ceil(furnaces.draugs[this.team]/furnaces.sizes[this.team])&&this._closestFurnace==furnaces.entities[this.team][x])) return true;
        return false;
      },this);

      if (candi!=null ){
        furnaces.updateCounts(furnaces.entities[this.team][candi],this);
        this._closestFurnace=furnaces.entities[this.team][candi];
      }else {
        furnaces.updateCounts([null,null],this);
        this._closestFurnace=[null,null];
      }
    },
    getClosestCore(){
      return this._closestFurnace[0];
    },
    getStartState(){
      return this.customMine;
    },
    removed(){
      furnaces.updateCounts([null,null],this);
    },
    update(){
      this.super$update();
      if(Vars.net.client()) return;
      this.updateMining();
      if(Time.time()%60<Time.delta()&&this.type.seconds!=Time.time()/60) {
        furnaces.seconds[this.team]=Time.time()/60;
        furnaces.isCounted[this.team]=false;
      }
      if(!furnaces.isCounted[this.team]) furnaces.updateDraugs(this.team);
    },
    write(data){
      this.super$write(data);
      data.writeInt(this.mineTile==null||!this.state.is(this.customMine)?Pos.invalid:this.mineTile.pos());
    },
    read(data){
      this.super$read(data);
      this.mineTile=Vars.world.tile(data.readInt());
    }
  });
  return e;
}));
