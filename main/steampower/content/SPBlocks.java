package steampower.content;

import arc.func.Cons;
import arc.func.Prov;
import mindustry.content.Items;
import mindustry.content.Liquids;
import mindustry.ctype.*;
import mindustry.type.Category;
import mindustry.world.Block;
import mindustry.world.blocks.distribution.ArmoredConveyor;
import mindustry.world.blocks.distribution.Conveyor;
import mindustry.world.blocks.production.Pump;
import mindustry.world.blocks.production.Separator;
import mindustry.world.blocks.production.SolidPump;
import mindustry.world.blocks.storage.StorageBlock;
import mindustry.world.meta.Attribute;
import mindustry.world.meta.BuildVisibility;
import multilib.MultiCrafter;
import multilib.Recipe.*;

import static mindustry.type.ItemStack.with;

public class SPBlocks implements ContentList{

    public static Block
    //crafting
    crystallizer, semiconductorPlant, bulletMill, missileFactory,

    //distribution
    solarConveyor, electricConveyor, hyperloopConveyor,

    //liquid
    reservoir,

    //production
    well, blastWaterExtractor,

    //storage
    stoneContainer;

    public <T extends Block> Block newBlock(Prov<T> constructor, Cons<T> setter){
        Block target = constructor.get();
        setter.get((T) target);
        return target;
    }

    @Override
    public void load(){
        //region crafting

        crystallizer = newBlock(() -> new Separator("crystallizer"), (Separator t) -> {
            t.category = Category.crafting;
            t.requirements = with(SPItems.stone, 25);
            t.buildVisibility = BuildVisibility.shown;
            t.craftTime = 40f;
            t.alwaysUnlocked = true;
            t.size = 1;
            t.health = 60;
            t.results = with(Items.copper, 4, Items.lead, 3, SPItems.iron, 5);
            t.consumes.liquid(Liquids.slag, 0.05f);
        });

        semiconductorPlant = newBlock(() -> new MultiCrafter("semiconductor-plant", 3), (MultiCrafter t) -> {
            t.category = Category.crafting;
            t.requirements = with(Items.lead, 30, Items.graphite, 45, Items.silicon, 45, SPItems.iron, 30);
            t.buildVisibility = BuildVisibility.shown;
            t.addRecipe(new InputContents(with(Items.lead, 2, Items.silicon, 1), 1f), new OutputContents(with(SPItems.circuit, 1)), 120f);
            t.addRecipe(new InputContents(with(Items.graphite, 1, Items.silicon, 1, Items.plastanium, 1), 3f), new OutputContents(with(SPItems.semiconductor, 1)), 120f);
            t.addRecipe(new InputContents(with(SPItems.semiconductor, 1, SPItems.circuit, 1, Items.surgeAlloy, 1), 9f), new OutputContents(with(SPItems.computer, 1)), 240f);
            t.itemCapacity = 20;
            t.size = 3;
            t.health = -1;
            t.dumpToggle = true;
        });

        bulletMill = newBlock(() -> new MultiCrafter("bullet-mill", 4), (MultiCrafter t) -> {
            t.category = Category.crafting;
            t.requirements = with(SPItems.circuit, 5, Items.graphite, 30, SPItems.iron, 40);
            t.buildVisibility = BuildVisibility.shown;
            t.itemCapacity = 15;
            t.size = 3;
            t.health = -1;
            t.addRecipe(new InputContents(with(Items.lead, 2, Items.coal, 1), 0.5f), new OutputContents(with(SPItems.bullet, 2)), 90f);
            t.addRecipe(new InputContents(with(Items.pyratite, 1, Items.titanium, 1, SPItems.steel, 1), 1f), new OutputContents(with(SPItems.AP, 2)), 90f);
            t.addRecipe(new InputContents(with(Items.lead, 2, Items.pyratite, 2, SPItems.iron, 1), 1f), new OutputContents(with(SPItems.clusterBullet, 2)), 90f);
            t.addRecipe(new InputContents(with(Items.lead, 1, Items.blastCompound, 1, SPItems.iron, 1), 1f), new OutputContents(with(SPItems.HE, 2)), 90f);
        });

        missileFactory = newBlock(() -> new MultiCrafter("missile-factory", 2), (MultiCrafter t) -> {
            t.category = Category.crafting;
            t.requirements = with(SPItems.computer, 5, Items.plastanium, 60, SPItems.steel, 60);
            t.buildVisibility = BuildVisibility.shown;
            t.itemCapacity = 16;
            t.size = 3;
            t.health = -1;
            t.dumpToggle = true;
            t.addRecipe(new InputContents(with(Items.blastCompound, 2, Items.plastanium, 1, SPItems.iron, 2), 3f), new OutputContents(with(SPItems.missile, 1)), 90f);
            t.addRecipe(new InputContents(with(SPItems.missile, 1, Items.thorium, 2, SPItems.uranium, 2), 10f), new OutputContents(with(SPItems.doom, 1)), 90f);
        });

        //endregion
        //region distribution

        /*solarConveyor=newContent(() -> new Conveyor("solar-conveyor"),  (Conveyor t) -> {
            t.category = Category.distribution;
            t.requirements = with(Items.copper, 1, Items.silicon, 1, SPItems.iron, 1);
            t.buildVisibility = BuildVisibility.shown;
            t.health = 60;
            t.speed = 0.03f;
            t.displayedSpeed = 4.2f;
        });TODO*/

        //endregion
        //region liquid

        reservoir = newBlock(() -> new Pump("reservoir"), (Pump t) -> {
            t.category = Category.liquid;
            t.requirements = with(SPItems.stone, 80);
            t.buildVisibility = BuildVisibility.shown;
            t.size = 2;
            //t.pumpAmount=0.2f
            t.liquidCapacity = 24f;
            t.alwaysUnlocked = true;
        });

        //endregion
        //region production

        well = newBlock(() -> new SolidPump("well"), (SolidPump t) -> {
            t.category = Category.production;
            t.requirements = with(SPItems.stone, 40);
            t.buildVisibility = BuildVisibility.shown;
            t.size = 2;
            //t.pumpAmount=0.07f;TODO
            t.attribute = Attribute.water;
            t.alwaysUnlocked = true;
        });

        blastWaterExtractor = newBlock(() -> new SolidPump("blast-water-extractor"), (SolidPump t) -> {
            t.category = Category.production;
            t.requirements = with(SPItems.semiconductor, 5, Items.copper, 50, Items.graphite, 25, Items.silicon, 25, Items.plastanium, 25, SPItems.steel, 100);
            t.buildVisibility = BuildVisibility.shown;
            //t.pumpAmount=0.6f;TODO
            t.size = 3;
            t.liquidCapacity = 48f;
            t.rotateSpeed = 1.5f;
            t.attribute = Attribute.water;
            t.consumes.power(4f);
        });
        steampower.SteamPower.print(blastWaterExtractor);

        //endregion
        //region storage

        stoneContainer = newBlock(() -> new StorageBlock("stone-container"), (StorageBlock t) -> {
            t.category = Category.effect;
            t.requirements = with(SPItems.stone, 30);
            t.itemCapacity = 25;
            t.health = 60;
            t.buildVisibility = BuildVisibility.shown;
            t.alwaysUnlocked = true;
        });

        //endregion
    }

}
