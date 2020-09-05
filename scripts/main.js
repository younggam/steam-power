importPackage(Packages.arc.graphics.gl);
importPackage(Packages.arc.audio);
importPackage(Packages.arc.mock);
/*if (this.global.furnaces === undefined)
{
    this.global.furnaces = {
        reset()
        {
            print("reset");
            this.entities = {};
            this.sizes = {};
            this.draugs = {};
            this.isCounted = {};
            this.seconds = {};
            for (var i in Team.base())
            {
                var tmp = Team.get(i)
                this.sizes[tmp] = 0;
                this.entities[tmp] = {};
                this.draugs[tmp] = 0;
                this.isCounted[tmp] = true;
                this.seconds[tmp] = 0;
            }
        },
        isFurnace(block)
        {
            return block == Vars.content.getByName(ContentType.block, "steam-power-blast-furnace") || block == Vars.content.getByName(ContentType.block, "steam-power-advanced-furnace")
        },
        updateDraugs(team)
        {
            this.draugs[team] = Vars.unitGroup.count(boolf(unit =>
            {
                return unit.type.name == "steam-power-draug-a";
            }));
            this.isCounted[team] = true;
        },
        updateCounts(ent, unit)
        {
            if (ent[0] == unit._closestFurnace[0]) return;
            if (unit._closestFurnace[0] == null) ent[1]++;
            else if (ent[0] != null)
            {
                unit._closestFurnace[1]--;
                ent[1]++;
            }
            else
            {
                unit._closestFurnace[1]--;
            }
        },
        update(ent, mode)
        {
            if (mode == 1)
            {
                if (this.entities[ent.tile.x] == null)
                {
                    this.entities[ent.tile.x] = [];
                    this.sizes[ent.getTeam()]++;
                    this.entities[ent.tile.x][ent.tile.y] = [ent, ent.getTeam()];
                    this.entities[ent.getTeam()][ent.tile.x + "l" + ent.tile.y] = [ent, 0];
                }
                else if (this.entities[ent.tile.x][ent.tile.y] == null)
                {
                    this.sizes[ent.getTeam()]++;
                    this.entities[ent.tile.x][ent.tile.y] = [ent, ent.getTeam()];
                    this.entities[ent.getTeam()][ent.tile.x + "l" + ent.tile.y] = [ent, 0];
                }
                else if (this.entities[ent.tile.x][ent.tile.y] != null)
                {
                    if (!this.isFurnace(this.entities[ent.tile.x][ent.tile.y][0].tile.block()))
                    {
                        this.reset();
                    }
                    if (this.entities[ent.tile.x][ent.tile.y][1] != ent.getTeam())
                    {
                        var team = this.entities[ent.tile.x][ent.tile.y][1];
                        this.sizes[team]--;
                        delete this.entities[team][ent.tile.x + "l" + ent.tile.y];
                        this.sizes[ent.getTeam()]++;
                        this.entities[ent.tile.x][ent.tile.y][1] = ent.getTeam();
                        this.entities[ent.getTeam()][ent.tile.x + "l" + ent.tile.y] = [ent, 0];
                    }
                }
            }
            else if (mode == 0)
            {
                delete this.entities[ent.tile.x][ent.tile.y];
                delete this.entities[ent.getTeam()][ent.tile.x + "l" + ent.tile.y];
                this.sizes[ent.getTeam()]--;
            }
            //print(Object.keys(this.entities[ent.getTeam()]));
        },
    };
}
this.global.furnaces.reset();*/
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
this.global.funcs.floatc2 = method => new Floatc2() {
    get: method
};
this.global.funcs.cons2 = method => new Cons2() {
    get: method
};
require("override");
require("initializer");
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
