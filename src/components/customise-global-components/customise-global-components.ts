import { Configuration, Element } from "@/models/configuration";
import { Component, Vue } from "vue-property-decorator";

/**
 * Structure chart, used to show how architecture components are linked for a configuration
 */
@Component({
  components: {
  }
})
export default class CustomiseGlobalComponents extends Vue {
    // Get configuration list
    public data: Configuration[] = this.$store.getters.configurations;
    public symbolPaletteJsonFile: any = require("@/assets/symbol-palette/symbol-palette");
    public symbolPallete: Element[] = this.symbolPaletteJsonFile.symbolPalette;
    public currentComponent: string = "";
    public currentComponentSymbol: string = "";
    public newComponentName: string = "";

    public getComponentCategories(): string[] {
        const allComponents: string[] = [];
        this.data.forEach((configuration) => {
            configuration.structure.components.forEach((component) => {
                let componentCategory: string[] = [];
                componentCategory = this.getComponentCategory(component);
                if (!allComponents.some((el) => el === componentCategory[0])) {
                    allComponents.push(componentCategory[0]);
                }
            });
        });
        return allComponents;
    }

    public getImgUrl(imageName: string) {
        return require("@/assets/symbol-palette/" + imageName);
    }

    public setCurrentComponent(componentCategory: string) {
        this.currentComponent = componentCategory;
        this.data.forEach((configuration) => {
            configuration.structure.components.forEach((component) => {
                const category = this.getComponentCategory(component);
                if (category[0] === this.currentComponent) {
                    this.currentComponentSymbol = component.symbol;
                }
            });
        });
    }

    public setNewSymbol(s: Element) {
        this.data.forEach((configuration) => {
            configuration.structure.components.forEach((component) => {
                const category = this.getComponentCategory(component);
                if (category[0] === this.currentComponent) {
                    component.symbol = s.symbol;
                    component.dataURI = s.dataURI;
                }
                component.subStructure?.components.forEach((subComponent) => {
                    const subComponentCategory = this.getComponentCategory(subComponent);
                    if (subComponentCategory[0] === this.currentComponent) {
                        subComponent.symbol = s.symbol;
                        subComponent.dataURI = s.dataURI;
                    }
                });
            });
        });
        this.currentComponentSymbol = s.symbol;
        this.$store.commit("updateConfiguration", this.data);
    }

    private getComponentCategory(comp: Element): string[] {
        return comp.name?.replace(/\s+/g, "").match(/[a-zA-Z]+/g)!;
    }
}
