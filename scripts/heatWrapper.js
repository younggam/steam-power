const heatLib=require("heatLibrary");
function cloneObject(obj){
  var clone={};
  for(var i in obj){
    if(typeof(obj[i])=="object"&&obj[i]!=null) clone[i]=cloneObject(obj[i]);
    else clone[i]=obj[i];
  }
  return clone;
}
module.exports={
  heatGiver(Type,Entity,name,def,customEnt){
    const block=Object.create(heatLib.giver);
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),customEnt)));
    return heatBlock;
  },
  heatUser(Type,Entity,name,def,customEnt){
    const block=Object.create(heatLib.user);
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),customEnt)));
    return heatBlock;
  },
  heatRecator(Type,Entity,name,def,customEnt){
    const block={drawLight(tile){
      Vars.renderer.lights.add(tile.drawx(),tile.drawy(),(10+tile.entity.getHeat()/20+Mathf.absin(10,0.5))*this.size,Color.scarlet,0.4);
    }};
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),customEnt)));
    return heatBlock;
  }
}
