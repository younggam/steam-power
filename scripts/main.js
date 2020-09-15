importPackage(Packages.arc.graphics.gl);
importPackage(Packages.arc.audio);
importPackage(Packages.arc.mock);
this.global.furnaces = {};
this.global.draugSizes = {};
this.global.teleporters = {};
for(var i in Team.base()){
    var tmp=Team.get(i).toString()
    this.global.furnaces[tmp]=new ObjectIntMap();
    this.global.draugSizes[tmp]=0;
    this.global.teleporters[tmp]=[];
    for (var j = 0; j < 8; j++) this.global.teleporters[tmp].push(new ObjectSet());
}
this.global.sounds = {};
var sounds = this.global.sounds
function loadsound(name) {
    if (Vars.headless) {
        sounds[name] = new MockSound();
        return;
    }
    var path = "sounds/" + name + ".ogg";
    if (Core.assets.contains(path, Sound)) sounds[name] = Core.assets.get(path, Sound);
    else Core.assets.load(path, Sound).loaded = cons(a => sounds[name] = a);
}
loadsound("yamato-charge");
loadsound("yamato-fire");
loadsound("laser-0");
loadsound("laser-1");
loadsound("laser-2");
loadsound("laserMain");
loadsound("laserNoise");
this.global.funcs = {};
this.global.funcs.floatc = method => new Floatc() {
    get: method
};
this.global.funcs.floatc2 = method => new Floatc2() {
    get: method
};
this.global.funcs.cons2 = method => new Cons2() {
    get: method
};
require("override");
require("initializer");
require("blocks/distribution/item-liquid-junction");
require("blocks/distribution/electric-conveyor");
require("blocks/distribution/hyperloop-conveyor");
require("blocks/distribution/heat-bridge");
require("blocks/distribution/heat-phase-bridge");
require("blocks/distribution/teleporter");
//
require("blocks/production/blast-furnace");
require("steam-power/blocks/production/advanced-furnace");
require("steam-power/blocks/production/burner");
require("blocks/production/electric-burner");
require("blocks/production/total-burner");
require("blocks/production/steam-generator");
require("blocks/production/advanced-steam-generator");
require("blocks/production/heat-regulator");
require("blocks/production/semiconductor-plant");
require("steam-power/blocks/production/bullet-mill");
require("steam-power/blocks/production/missile-factory");
require("steam-power/blocks/production/thermal-centrifuge");
require("blocks/production/metal-smelter");
require("steam-power/blocks/production/matter-disintegrator");
//
require("blocks/power/geothermal-system");
require("blocks/power/turbine");
require("blocks/power/nuclear-reactor");
require("blocks/power/nuclear-fusion-reactor");
//
require("blocks/liquid/reservoir");
require("blocks/liquid/liquid-heat-exchanger");
//
require("blocks/turrets/tesla");
require("blocks/turrets/ray");
require("blocks/turrets/penetrate");
require("blocks/turrets/ravage");
require("blocks/turrets/launchpad");
require("blocks/turrets/breakthrough");
require("blocks/turrets/guardian");
//
require("blocks/walls");
//
require("units/draug-a");
require("units/younggam");
require("units/longinus");
