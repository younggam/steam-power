package steampower.content;

import arc.graphics.Color;
import mindustry.content.StatusEffects;
import mindustry.ctype.ContentList;
import mindustry.type.Liquid;

public class SPLiquids implements ContentList{
    public static Liquid steam, highPressureSteam, hotCryofluid;

    @Override
    public void load(){
        steam = new Liquid("steam", Color.valueOf("c3c3c3"));
        steam.temperature = 0.7f;
        steam.heatCapacity = 0.3f;
        steam.effect = StatusEffects.wet;

        highPressureSteam = new Liquid("high-pressure-steam", Color.valueOf("d7d7d7"));
        highPressureSteam.temperature = 1f;
        highPressureSteam.heatCapacity = 0.2f;
        highPressureSteam.effect = StatusEffects.wet;

        hotCryofluid = new Liquid("hot-cryofluid", Color.valueOf("f05a5a"));
        hotCryofluid.heatCapacity = 0f;
        hotCryofluid.temperature = 1.2f;
        hotCryofluid.effect = StatusEffects.melting;
        hotCryofluid.flammability = 1.2f;
        hotCryofluid.lightColor = Color.valueOf("dc1c2428");
    }

}
