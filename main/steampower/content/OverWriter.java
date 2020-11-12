package steampower.content;

import arc.func.Cons;
import mindustry.content.Bullets;
import mindustry.content.Items;
import mindustry.content.Liquids;
import mindustry.content.UnitTypes;
import mindustry.ctype.ContentList;
import mindustry.ctype.UnlockableContent;
import mindustry.type.ItemStack;
import mindustry.type.UnitType;
import mindustry.world.blocks.environment.Floor;
import mindustry.world.blocks.production.*;

import static mindustry.content.Blocks.*;
import static mindustry.type.ItemStack.with;

public class OverWriter implements ContentList{
    public <T extends UnlockableContent> void forceOverWrite(UnlockableContent target, Cons<T> setter){
        setter.get((T) target);
    }

    //TODO balancing with 6.0. especially turrets
    @Override
    public void load(){
        //region distribution

        itemBridge.requirements = with(Items.copper, 16, Items.lead, 16, SPItems.iron, 16);
        itemBridge.health = 60;

        distributor.requirements = with(Items.copper, 16, Items.lead, 16, SPItems.iron, 16);
        distributor.health = 60;

        invertedSorter.requirements = with(Items.copper, 8, Items.lead, 8, SPItems.iron, 16);
        invertedSorter.health = 60;

        junction.requirements = with(Items.copper, 12, SPItems.iron, 12);
        junction.health = 60;

        overflowGate.requirements = with(Items.copper, 16, Items.lead, 8, SPItems.iron, 16);
        overflowGate.health = 60;

        phaseConveyor.requirements = with(SPItems.semiconductor, 1, Items.lead, 7, Items.graphite, 7, Items.silicon, 5, Items.phaseFabric, 4);

        router.requirements = with(Items.copper, 12, SPItems.iron, 12);
        router.health = 60;

        sorter.requirements = with(Items.copper, 8, Items.lead, 8, SPItems.iron, 16);
        sorter.health = 60;

        underflowGate.requirements = with(Items.copper, 16, Items.lead, 8, SPItems.iron, 16);
        underflowGate.health = 60;

        //endregion
        //region production

        blastDrill.requirements = with(SPItems.semiconductor, 5, Items.copper, 65, Items.silicon, 20, Items.titanium, 50, Items.thorium, 75);

        cultivator.requirements = with(SPItems.circuit, 5, SPItems.stone, 40);

        laserDrill.requirements = with(SPItems.circuit, 5, Items.copper, 40, Items.graphite, 30, SPItems.iron, 50);

        forceOverWrite(mechanicalDrill, (Drill t) -> {
            t.requirements = with(SPItems.stone, 20, Items.copper, 10);
            t.drillTime = 210f;
            t.liquidBoostIntensity = 1f;
            t.consumes.liquid(SPLiquids.steam, 0.05f);
        });

        oilExtractor.requirements = with(SPItems.semiconductor, 10, Items.copper, 150, Items.lead, 60, Items.graphite, 125, Items.silicon, 45, Items.thorium, 115);

        forceOverWrite(pneumaticDrill, (Drill t) -> {
            t.requirements = with(SPItems.stone, 20, Items.copper, 20, Items.graphite, 10);
            t.drillTime = 144f;
            t.liquidBoostIntensity = 1f;
            t.consumes.liquid(SPLiquids.steam, 0.05f);
        });

        /*forceOverWrite(waterExtractor, (SolidPump t)->{
            t.pumpAmount=0.2f;
        });TODO*/

        //endregion
        //region environment

        forceOverWrite(craters, (Floor t) -> {
            t.itemDrop = SPItems.stone;
        });

        forceOverWrite(darksand, (Floor t) -> {
            t.playerUnmineable = false;
        });

        forceOverWrite(dacite, (Floor t) -> {
            t.itemDrop = SPItems.stone;
        });

        forceOverWrite(basalt, (Floor t) -> {
            t.itemDrop = SPItems.stone;
        });

        forceOverWrite(oreCopper, (Floor t) -> {
            t.itemDrop = SPItems.copperOre;
        });

        forceOverWrite(oreLead, (Floor t) -> {
            t.itemDrop = SPItems.leadOre;
        });

        forceOverWrite(oreThorium, (Floor t) -> {
            t.itemDrop = SPItems.thoriumOre;
        });

        forceOverWrite(oreTitanium, (Floor t) -> {
            t.itemDrop = SPItems.titaniumOre;
        });

        forceOverWrite(sand, (Floor t) -> {
            t.playerUnmineable = false;
        });

        forceOverWrite(stone, (Floor t) -> {
            t.itemDrop = SPItems.stone;
        });

        //endregion
        //region defense

        forceProjector.requirements = with(SPItems.semiconductor, 5, Items.lead, 70, Items.silicon, 85, Items.titanium, 50);

        mendProjector.requirements = with(SPItems.circuit, 5, Items.lead, 70, Items.silicon, 25, Items.titanium, 16);

        overdriveProjector.requirements = with(SPItems.semiconductor, 10, Items.lead, 70, Items.silicon, 50, Items.titanium, 50, Items.plastanium, 20);

        shockMine.requirements = with(SPItems.circuit, 1, Items.lead, 16, Items.silicon, 8);

        conduit.requirements = with(SPItems.glass, 1);
        conduit.alwaysUnlocked = true;

        liquidRouter.requirements = with(SPItems.glass, 4, SPItems.iron, 4);

        phaseConduit.requirements = with(SPItems.semiconductor, 1, Items.metaglass, 14, Items.silicon, 5, Items.titanium, 14, Items.phaseFabric, 4);

        thermalPump.requirements = with(SPItems.circuit, 10, Items.copper, 65, Items.metaglass, 50, Items.silicon, 20, Items.titanium, 25, Items.thorium, 25);

        combustionGenerator.requirements = with(SPItems.stone, 30, Items.copper, 30, Items.lead, 20);

        coalCentrifuge.requirements = with(SPItems.circuit, 5, Items.lead, 30, Items.graphite, 40, Items.titanium, 20);

        cryofluidMixer.requirements = with(SPItems.circuit, 5, Items.lead, 40, Items.silicon, 30, Items.titanium, 60);

        graphitePress.requirements = with(Items.copper, 50, Items.lead, 30);
        graphitePress.consumes.liquid(SPLiquids.steam, 0.05f);

        forceOverWrite(kiln, (GenericCrafter t) -> {
            t.requirements = with(SPItems.stone, 60, Items.copper, 30, Items.lead, 30, Items.graphite, 30);
            t.consumes.items(with(Items.lead, 1, SPItems.glass, 2));
            t.craftTime = 60f;
            t.outputItem = new ItemStack(Items.metaglass, 2);
        });

        multiPress.requirements = with(SPItems.circuit, 10, Items.graphite, 40, SPItems.iron, 40, Items.titanium, 80);

        phaseWeaver.requirements = with(SPItems.computer, 5, Items.lead, 40, Items.silicon, 40, Items.thorium, 75);

        plastaniumCompressor.requirements = with(SPItems.circuit, 10, Items.lead, 45, Items.graphite, 45, Items.silicon, 30, Items.titanium, 60);

        pyratiteMixer.requirements = with(SPItems.circuit, 5, Items.copper, 50, Items.lead, 40, SPItems.iron, 20);

        forceOverWrite(separator, (Separator t) -> {
            t.requirements = with(SPItems.circuit, 5, Items.copper, 30, Items.titanium, 25);
            t.craftTime = 20f;
            t.consumes.liquid(Liquids.slag, 0.1f);
            t.results = with(Items.copper, 4, Items.lead, 3, Items.graphite, 2, SPItems.iron, 2, Items.titanium, 1);
        });

        siliconSmelter.requirements = with(SPItems.stone, 60, Items.copper, 25, Items.lead, 25);

        sporePress.requirements = with(SPItems.circuit, 10, Items.lead, 30, Items.silicon, 30, SPItems.iron, 40);

        //endregion
        //region turrets

        cyclone.requirements = with(SPItems.circuit, 5, Items.copper, 175, SPItems.iron, 125, Items.titanium, 125, Items.plastanium, 80);

        //duo

        fuse.requirements = with(SPItems.semiconductor, 5, Items.copper, 200, Items.graphite, 200, Items.thorium, 100);

        meltdown.requirements = with(SPItems.computer, 5, Items.copper, 200, Items.lead, 300, Items.graphite, 250, Items.silicon, 275, SPItems.steel, 150, Items.surgeAlloy, 150);

        ripple.requirements = with(SPItems.circuit, 5, Items.copper, 120, Items.graphite, 108, Items.titanium, 48);

        salvo.requirements = with(Items.copper, 90, Items.graphite, 75, Items.titanium, 50);

        spectre.requirements = with(SPItems.semiconductor, 10, Items.copper, 300, Items.graphite, 260, Items.plastanium, 150, Items.thorium, 225, SPItems.steel, 150, Items.surgeAlloy, 150);

        //swarmer

        //endregion
        //region units

        commandCenter.requirements = with(SPItems.circuit, 5, Items.copper, 135, Items.lead, 165, Items.graphite, 70, Items.silicon, 165);

        //groundFactory

        //airFactory

        //navalFactory

        //additiveReconstructor

        //multiplicativeReconstructor

        //exponentialReconstructor

        //tetrativeReconstructor

        repairPoint.requirements = with(SPItems.circuit, 1, Items.copper, 10, Items.lead, 10, Items.silicon, 10);

        //resupplyPoint

        //endregion
        //region logic

        //switchBlock

        //microProcessor

        //logicProcessor

        //hyperProcessor

        //memoryCell

        //memoryBank

        //logicDisplay

        //largeLogicDisplay

        //endregion
        //region UnitType

        forceOverWrite(UnitTypes.alpha, (UnitType t) -> {
            t.mineTier = 2;
        });

        forceOverWrite(UnitTypes.beta, (UnitType t) -> {
            t.mineTier = 2;
        });

        forceOverWrite(UnitTypes.gamma, (UnitType t) -> {
            t.mineTier = 2;
        });

        forceOverWrite(UnitTypes.mono, (UnitType t) -> {
            t.mineTier = 2;
        });

        //endregion
        //region Bullets

        //Bullets.standardDense

        //Bullets.standardIncendiary

        //Bullets.standardHoming

        //Bullets.basicFlame

        //Bullets.pyraFlame

        //Bullets.artilleryDense

        //Bullets.artilleryHoming

        //Bullets.artilleryIncendiary

        //Bullets.slagShot

        //Bullets.missileExplosive

        //Bullets.missileIncendiary

        //Bullets.missileSurge

        //Bullets.standardThorium

        //Bullets.artilleryExplosive

        //Bullets.artilleryPlastic

        //Bullets.fragExplosive

        //Bullets.fragPlastic

        //Bullets.fragSurge

        //Bullets.standardDenseBig

        //Bullets.standardIncendiaryBig

        //Bullets.standardThoriumBig

        //endregion
    }

}
