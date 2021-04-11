import { Prop, Component, Vue } from "vue-property-decorator";
import { BIcon, BIconPencilSquare } from "bootstrap-vue";
import { Configuration, Element } from "@/models/configuration";

/**
 * Structure chart, used to show how architecture components are linked for a configuration
 */
@Component({
  components: {
    BIcon,
    BIconPencilSquare
  }
})
export default class CustomiseIndividualComponents extends Vue {
  // ChartData object, with all info required to render chart
  @Prop(Object) public readonly data: Configuration;

  // Configuration Id used to update config changes
  @Prop(String) public readonly configId: string;

  public symbolPaletteJsonFile: any = require("@/assets/symbol-palette/symbol-palette");
  public newComponentName: string = "";
  public editComponentNameClicked: boolean = false;
  public currentComponent: Element = {} as Element;
  public symbolPallete: Element[] = this.symbolPaletteJsonFile.symbolPalette;

  public getImgUrl(imageName: string) {
    return require("@/assets/symbol-palette/" + imageName);
  }

  public setNewSymbol(symbolSelected: Element) {
    this.currentComponent.symbol = symbolSelected.symbol;
    this.currentComponent.dataURI = symbolSelected.dataURI;
    this.$store.commit("updateConfiguration", this.data);
  }

  public onReset() {
    this.newComponentName = "";
  }

  public onSubmit() {
    let nameExists: boolean = false;
    for (const component of this.data.structure.components) {
      if (component.name === this.newComponentName) {
        nameExists = true;
      }
    }
    if (!nameExists) {
      for (const connection of this.data.structure.connections) {
        if (connection.from === this.currentComponent.name) {
          connection.from = this.newComponentName;
        }
        if (connection.to === this.currentComponent.name) {
          connection.to = this.newComponentName;
        }
      }
      this.currentComponent.name = this.newComponentName;
      this.$store.commit("updateConfiguration", this.data);
    }
    this.newComponentName = "";
  }
}
