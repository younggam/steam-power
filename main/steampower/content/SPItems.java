package steampower.content;

import arc.graphics.Color;
import mindustry.ctype.ContentList;
import mindustry.type.Item;

public class SPItems implements ContentList{
    public static Item stone, copperOre, leadOre, ironOre, titaniumOre, thoriumOre, glass, iron, uranium, depletedUranium, circuit, semiconductor, computer, steel, denseAlloy, dimensionArmour, quantumMass, bullet, AP, clusterBullet, HE, missile, doom;

    @Override
    public void load(){
        stone = new Item("stone", Color.valueOf("989aa4"));
        stone.cost = 0.7f;
        stone.alwaysUnlocked = true;

        copperOre = new Item("copper-ore", Color.valueOf("b8705c"));
        copperOre.hardness = 1;
        copperOre.alwaysUnlocked = true;

        leadOre = new Item("lead-ore", Color.valueOf("6f687e"));
        leadOre.hardness = 1;
        leadOre.alwaysUnlocked = true;

        ironOre = new Item("iron-ore", Color.valueOf("966e5a"));
        ironOre.hardness = 3;

        titaniumOre = new Item("titanium-ore", Color.valueOf("7575c8"));
        titaniumOre.hardness = 3;

        thoriumOre = new Item("thorium-ore", Color.valueOf("cb8ebf"));
        thoriumOre.radioactivity = 0.3f;
        thoriumOre.hardness = 4;

        glass = new Item("glass", Color.valueOf("ffffff"));
        glass.cost = 0.8f;

        iron = new Item("iron", Color.valueOf("b0bac0"));

        uranium = new Item("uranium", Color.valueOf("cce745"));
        uranium.explosiveness = 0.2f;
        uranium.radioactivity = 1.3f;
        uranium.cost = 1.6f;

        depletedUranium = new Item("depleted-uranium", Color.valueOf("89a015"));
        depletedUranium.explosiveness = 0.1f;
        depletedUranium.radioactivity = 0.4f;

        circuit = new Item("circuit", Color.valueOf("4cb482"));
        circuit.flammability = 0.19f;
        circuit.cost = 3f;

        semiconductor = new Item("semiconductor", Color.valueOf("b4b428"));
        semiconductor.explosiveness = 0.1f;
        semiconductor.flammability = 0.19f;
        semiconductor.cost = 4;

        computer = new Item("computer", Color.valueOf("6e7080"));
        computer.explosiveness = 0.2f;
        computer.flammability = 0.19f;
        computer.cost = 5f;

        steel = new Item("steel", Color.valueOf("767a84"));
        steel.cost = 1.6f;

        denseAlloy = new Item("dense-alloy", Color.valueOf("8c8c78"));
        denseAlloy.radioactivity = 0.1f;
        denseAlloy.cost = 2f;

        dimensionArmour = new Item("dimension-armour", Color.valueOf("d0e0ff"));
        dimensionArmour.cost = 2.4f;

        quantumMass = new Item("quantum-mass", Color.valueOf("000080"));
        quantumMass.cost = 3.2f;
//
        //TODO 새 값 추가하기
        bullet = new Item("bullet", Color.valueOf("c88c50"));
        bullet.explosiveness = 0.1f;

        AP = new Item("armor-piercing-shell", Color.valueOf("ffff00"));
        AP.explosiveness = 0.1f;

        clusterBullet = new Item("cluster-bullet", Color.valueOf("ff8080"));
        clusterBullet.explosiveness = 0.3f;

        HE = new Item("high-explosive", Color.valueOf("ec1c24"));
        HE.explosiveness = 0.8f;
        HE.flammability = 0.19f;

        missile = new Item("missile", Color.valueOf("88001b"));
        missile.explosiveness = 1f;
        missile.flammability = 0.19f;

        doom = new Item("doom", Color.valueOf("96c80e"));
        doom.explosiveness = 1f;
        doom.flammability = 0.19f;
        doom.radioactivity = 0.6f;
    }

}
