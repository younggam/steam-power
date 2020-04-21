const common={
  onDestroyed(tile){
    this.super$onDestroyed(tile);
    Sounds.explosionbig.at(tile);
    const entity=tile.ent();
    if(entity.getHeat()<this.heatCapacity/2) return;
    Effects.effect(Fx.pulverize,tile.worldx(),tile.worldy());
    Damage.damage(tile.worldx(),tile.worldy(),16*this.size,50);
  }
};
const _user=Object.assign({
  inputsHeat(){
    return true;
  },
},common);
const _giver=Object.assign({
  giveHeat(tile){
    var proximity=tile.entity.proximity();
    var dump=tile.rotation();
    var index=0;
    var others=[];
    var totalHeat=0;
    for(var i=0;i<proximity.size;i++){
      this.incrementDump(tile,proximity.size);
      var other=proximity.get((i+dump)%proximity.size);
      if(other.getTeam()==tile.getTeam()&&typeof(other.block()["inputsHeat"])==="function"){
        if(other.entity.getHeat()<tile.entity.getHeat()){
          totalHeat+=other.entity.getHeat();
          others[index]=other;
          index++;
        }
      }
    }
    if(others.length>0){
      var avgHeat=(totalHeat+tile.entity.getHeat())/(others.length+1);
      for(var j=0;j<others.length;j++){
        others[j].entity.addHeat(avgHeat-others[j].entity.getHeat());
      }
      tile.entity.addHeat(-tile.entity.getHeat()+avgHeat);
    }
  }
},common);
const _heatProps={
  getHeat(){
    return this._heat;
  },
  modifyHeat(a){
    this._heat=a
  },
  addHeat(b){
    this._heat+=b
  },
  coolDownHeat(){
    if(this._heat>25){
      this._heat-=Time.delta()*this._heat/1200;
    }else if(this._heat<25){
      this._heat=25;
    }
  },
  _heat:25,
}
module.exports={
  user:_user,
  giver:_giver,
  heatProps:_heatProps
}
