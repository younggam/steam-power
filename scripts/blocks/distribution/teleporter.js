const selection=[Color.royal,Color.orange,Color.scarlet,Color.forest,Color.purple,Color.gold,Color.pink,Color.black];
const teleporters=this.global.teleporters;
const teleporter=extendContent(Block,"teleporter",{
  lastColor:-1,
  playerPlaced(tile){
    if(this.lastColor!=null) tile.configure(this.lastColor);
  },
  acceptItem(item,tile,source){
    return tile.entity.items.total()<this.itemCapacity;
  },
  outputsItems(){
    return true;
  },
  init(){
    this.hasPower=true;
    this.consumes.powerCond(2.5,boolf(entity=>entity!=null?entity.getDuration()>0:false));
    this.super$init();
  },
  draw(tile){
    const entity=tile.ent();
    this.super$draw(tile);
    if(entity.getToggle()!=-1){
      Draw.color(selection[entity.getToggle()]);
      Draw.rect(Core.atlas.find(this.name+"-blank"),tile.drawx(),tile.drawy());
    }
    Draw.color(Color.white);
    Draw.alpha(0.45+Mathf.absin(Time.time(),7,0.26));
    Draw.rect(Core.atlas.find(this.name+"-top"),tile.drawx(),tile.drawy());
    Draw.reset();
  },
  buildConfiguration(tile,table){
    const entity=tile.ent();
    const cont=new Table();
    const group=new ButtonGroup();
    group.setMinCheckCount(0);
    for(var i=0;i<selection.length;i++){
      (function(i,block){
        var button=cont.addImageButton(Tex.whiteui,Styles.clearToggleTransi,24,run(()=>{
          block.lastColor=button.isChecked()?i:-1;
          tile.configure(button.isChecked()?i:-1);
        })).size(34,34).group(group).get();
        button.getStyle().imageUpColor=selection[i];
        button.setChecked(tile.entity!=null?tile.entity.getToggle()==i?true:false:false);
      })(i,this)
      if(i%4==3) cont.row();
    }
    table.add(cont);
  },
  configured(tile,player,value){
    const entity=tile.ent();
    if(entity.getToggle()!=-1) delete teleporters[entity.getToggle()][tile.x+","+tile.y];
    if(value!=-1) teleporters[value][tile.x+","+tile.y]=tile;
    tile.entity.setToggle(value);
  },
  findLink(tile,value){
    const entity=tile.ent();
    var entries=Object.keys(teleporters[value]);
    if(entity.getEntry()>=entries.length) {
      entity.resetEntry();
    }
    if(entity.getEntry()==entries.length-1){
      var other_=teleporters[value][entries[entity.getEntry()]]
      if(other_==tile) {
        entity.resetEntry();}
    }
    for(var i=entity.getEntry();i<entries.length;i++){
      var other=teleporters[value][entries[i]]
      if(other==null){
        delete teleporters[value][entries[i]];
        continue;
      }else if(other==tile) {
        continue;
      }else if(other.block()!=Vars.content.getByName(ContentType.block,this.name)){
        delete teleporters[value][entries[i]];
        continue;
      }else if(other.getTeam()!=tile.getTeam()) continue;
      else{
        entity.setEntry(i+1);
        return other;
      }
    }
    return null;
  },
  update(tile){
    const entity=tile.ent();
    entity.onDuration();
    if(entity.items.total()>0) this.tryDump(tile);
  },
  acceptItem(item,tile,source){
    const entity=tile.ent();
    if(entity.getToggle()==-1) return false;
    entity.setTarget(this.findLink(tile,entity.getToggle()));
    if(entity.getTarget()==null) return false;
    return !(source.block()==Vars.content.getByName(ContentType.block,this.name))&&entity.cons.valid()&&Mathf.zero(1-entity.efficiency())&&entity.getTarget().entity.items.total()<this.itemCapacity;
  },
  handleItem(item,tile,source){
    tile.entity.getTarget().entity.items.add(item,1);
    tile.entity.resetDuration();
  }
});
teleporter.update=true;
teleporter.solid=true;
teleporter.configurable=true;
teleporter.unloadable=false;
teleporter.entityType=prov(()=>extend(TileEntity,{
  getToggle(){
    return this._toggle;
  },
  setToggle(a){
    this._toggle=a;
  },
  _toggle:-1,
  getEntry(){
    return this._entry;
  },
  setEntry(b){
    this._entry=b;
  },
  resetEntry(){
    this._entry=0;
  },
  _entry:0,
  getTarget(){
    return this._target;
  },
  setTarget(c){
    this._target=c;
  },
  _target:null,
  getDuration(){
    return this._duration;
  },
  resetDuration(){
    this._duration=60;
  },
  onDuration(){
    if(this._duration<=0) this._duration=0;
    else this._duration-=Time.delta();
  },
  _duration:0,
  config(){
    return this._toggle;
  },
  write(stream){
    this.super$write(stream);
    stream.writeShort(this._toggle);
  },
  read(stream,revision){
    this.super$read(stream,revision);
    this._toggle=stream.readShort();
    if(this._toggle!=-1)  teleporters[this._toggle][this.tile.x+","+this.tile.y]=this.tile;
  }
}));
