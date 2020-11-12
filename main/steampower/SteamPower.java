package steampower;

import java.util.Arrays;
import mindustry.Vars;
import mindustry.ctype.ContentList;
import mindustry.mod.Mod;
import steampower.content.*;

public class SteamPower extends Mod{
    private final ContentList[] spContent = {
        new SPItems(),
        new SPLiquids(),
        new OverWriter(),
        new SPBlocks()
    };

    @Override
    public void init(){
        Vars.enableConsole = true;
    }

    @Override
    public void loadContent(){
        for(ContentList content : spContent) content.load();
    }

    public static void print(Object... objects){
        Vars.mods.getScripts().log("unity", Arrays.toString(objects));
    }
}
