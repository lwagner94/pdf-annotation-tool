import {fabric} from 'fabric';
import EventBus from "@/EventBus"

class Annotations {

    constructor(context, width, height) {
        this.context = new fabric.Canvas(context);

        this.enableDrawing = false;
        this.startedDrawing = false;
        this.drawStartPos = {
            x: 0,
            y: 0
        };

        this.context.setWidth(width);
        this.context.setHeight(height);


        var square = new fabric.Textbox("foo", {
            width: 100,
            height: 100,
            left: 100,
            top: 100,
            backgroundColor: "#000000",
            fill: "#FFFFFF",
            lockScalingY: true,
            fontSize: 20
        });

        this.context.add(square);
        this.context.renderAll();
        this.registerCallbacks();
    }

    registerCallbacks() {
        const self = this;
        EventBus.$on("set-drawing", enable => {
            self.enableDrawing = enable;
        });

        this.context.on("mouse:down", opt => {
            if (!self.enableDrawing)
                return;

            const mouse = self.context.getPointer(opt.e);
            self.startedDrawing = true;
            self.drawStartPos.x = mouse.x;
            self.drawStartPos.y = mouse.y;

            const square = new fabric.Textbox("foo", {
                width: 0,
                height: 0,
                left: self.drawStartPos.x,
                top: self.drawStartPos.y,
                backgroundColor: "#000000",
                fill: "#FFFFFF",
                lockScalingY: true,
                fontSize: 20
            });

            self.context.add(square);
            self.context.renderAll();
            self.context.setActiveObject(square);
        });
        this.context.on("mouse:move", opt => {
            if (!self.enableDrawing)
                return false;

            if(!self.startedDrawing) {
                return false;
            }

            const mouse = self.context.getPointer(opt.e);

            const w = Math.abs(mouse.x - self.drawStartPos.x);
            const h = Math.abs(mouse.y - self.drawStartPos.y);

            if (!w || !h) {
                return false;
            }

            const square = self.context.getActiveObject();
            square.set('width', w).set('height', h);
            self.context.renderAll();
        });
        this.context.on("mouse:up", opt => {
            console.log("Mouse up");
            if (!self.enableDrawing)
                return false;

            if(self.startedDrawing) {
                self.startedDrawing = false;
            }

            const square = self.context.getActiveObject();

            self.context.add(square);
            self.context.renderAll();

            EventBus.$emit("set-drawing", false);
        });
    }
    
    draw() {

    }
}


export default Annotations;