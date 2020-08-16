thermalCentrifuge=extendContent(Separator,"thermal-centrifuge",{
  update(tile){
    if(tile.entity.timer.get(this.timerDump,this.dumpTime)){
      for(var l=0;l<this.results.length;l++){
        if(tile.entity.items.has(this.results[l].item)){
          this.tryDump(tile,this.results[l].item);
          break;
        }
      }
    }
    this.super$update(tile);
  },
  shouldConsume(tile){
    for(var i=0;i<this.results.length;i++){
      if(this.results[i]!=null&&tile.entity.items.get(this.results[i].item)>=this.itemCapacity){
        return false;
      }
    }
    return true;
  },
  draw(tile){
    Draw.rect(this.region,tile.drawx(),tile.drawy());
  }
});
