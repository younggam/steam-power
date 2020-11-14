package steampower.content;

import arc.struct.Seq;
import mindustry.content.TechTree;
import mindustry.content.TechTree.TechNode;
import mindustry.ctype.ContentList;
import mindustry.ctype.UnlockableContent;
import mindustry.game.Objectives.Objective;
import mindustry.type.ItemStack;

import static mindustry.content.Blocks.*;
import static mindustry.type.ItemStack.with;;

public class SPTechTree implements ContentList{
    private static TechNode context = null;

    @Override
    public void load(){
        /*
        commented way replaces whole TechTree but causes incompatibility for other mods.
        TechTree.setup();
        TechTree.root=*/
        attachNode(waterExtractor, () -> {
            node(SPBlocks.blastWaterExtractor);
        });
        attachNode(siliconSmelter, () -> {
            node(SPBlocks.semiconductorPlant);
        });
        attachNode(pyratiteMixer, () -> {
            node(SPBlocks.bulletMill, () -> {
                node(SPBlocks.missileFactory);
            });
        });
    }

    private static void attachNode(UnlockableContent parent, Runnable children){
        TechNode parnode = TechTree.all.find(t -> t.content == parent);
        context = parnode;
        children.run();
    }

    private static void node(UnlockableContent content, ItemStack[] requirements, Seq<Objective> objectives, Runnable children){
        TechNode node = new TechNode(context, content, requirements);
        if(objectives != null) node.objectives = objectives;
        TechNode prev = context;
        context = node;
        children.run();
        context = prev;
        //return node;
    }

    private static void node(UnlockableContent content, ItemStack[] requirements, Runnable children){
        /*return */node(content, requirements, null, children);
    }

    private static void node(UnlockableContent content, Seq<Objective> objectives, Runnable children){
        /*return */node(content, content.researchRequirements(), objectives, children);
    }

    private static void node(UnlockableContent content, Runnable children){
        /*return */node(content, content.researchRequirements(), children);
    }

    private static void node(UnlockableContent block){
        /*return */node(block, () -> {});
    }
}
