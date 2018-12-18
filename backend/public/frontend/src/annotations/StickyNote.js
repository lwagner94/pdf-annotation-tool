import Annotation from "./Annotation"
import {fabric} from "fabric";

const IMGSCALE = 1;


export default class StickyNote extends Annotation {
    constructor(context, x, y, width, height, scale, localID) {
        let placeholder = new fabric.Rect({
            width: 300,
            height: height,
            left: x,
            top: y,
            fill: '#999',
            scaleX: scale,
            scaleY: scale,
            // fireRightClick: true
        });


        super(context, placeholder, x, y, width, height, scale, localID);

        this.expandedView = new fabric.Textbox("foo", {
            width: 300,
            height: 300,
            backgroundColor: "rgba(255, 255, 200, 1)",
            fill: "black",
            lockScalingY: true,
            lockScalingX: true,
            fontSize: 20,
        });

        this._realScale = scale;
        this._scale = this._scale * IMGSCALE;

        const self = this;
        new fabric.Image.fromURL("/sticky.png", function (img) {
            img.set("scaleX", self._scale);
            img.set("scaleY", self._scale);
            img.set("left", self.x * self._scale / IMGSCALE);
            img.set("top", self.y * self._scale / IMGSCALE);
            // img.set("lockScalingX", true);
            // img.set("lockScalingY", true);


            self.context.remove(placeholder);
            img.annotationInstance = self;
            self.object = img;
            self.addToContext();
        });

        this.expandedView.annotationInstance = this;


        this.expanded = false;
    }

    toJSON() {
        const state = {
            type: "stickynote",
            data: {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                text: this.expandedView.text
            }
        };

        return JSON.stringify(state);
    }

    handleDoubleClick() {
        let self = this;

        setTimeout(() => {
            if (!self.expanded) {
                console.log("Adding");
                self.expandedView.set("left", self.x * self._scale);
                self.expandedView.set("top", self.y * self._scale);

                self.context.add(self.expandedView);
                self.context.setActiveObject(self.expandedView);
            }
            else {
                console.log("Removing");
                self.context.remove(self.expandedView);
            }
            self.expanded = !self.expanded;
        }, 50);
    }

    static fromJSON(context, properties, initialScale, localID) {
        const state = JSON.parse(properties);

        const annotation = new StickyNote(context, state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID);
        annotation.expandedView.text = state.data.text;
        return annotation;
    }

    static drawable() {
        return false;
    }

    set scale(s) {
        this._scale = s;

        this.object.set("scaleX", this._scale * IMGSCALE);
        this.object.set("scaleY", this._scale * IMGSCALE);

        this.object.set("left", this._x * this._scale);
        this.object.set("top", this._y * this._scale);
    }
}