const heatLib=require("heatLibrary");
//객체 깊은 복사
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
    //상속
    const block=Object.create(heatLib.giver);
    //객체 합치기
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,/*객체합치기*/Object.assign(cloneObject(heatLib.heatProps),cloneObject(customEnt))));
    return heatBlock;
  },
  heatUser(Type,Entity,name,def,customEnt){
    const block=Object.create(heatLib.user);
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),cloneObject(customEnt))));
    return heatBlock;
  },
  heatRecator(Type,Entity,name,def,customEnt){
    const block=Object.create(heatLib.common);
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),cloneObject(customEnt))));
    return heatBlock;
  },
  heatBridge(Type,Entity,name,def,customEnt){
    const block=Object.create(heatLib.giver);
    Object.assign(block,def);
    const heatBlock=extendContent(Type,name,block);
    heatBlock.entityType=prov(()=>extend(Entity,Object.assign(cloneObject(heatLib.heatProps),cloneObject(customEnt))));
    return heatBlock;
  },
}
