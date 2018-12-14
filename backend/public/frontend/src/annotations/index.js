import {fabric} from 'fabric';
import EventBus from "@/EventBus"

import getAnnotationClass from "./registry"


class Annotations {

    constructor(context, width, height) {
        this.context = new fabric.Canvas(context);

        this.drawMode = false;
        this.startedDrawing = false;
        this.drawStartPos = {
            x: 0,
            y: 0
        };

        this.context.setWidth(width);
        this.context.setHeight(height);
        this.registerCallbacks();
    }

    registerCallbacks() {
        const self = this;
        EventBus.$on("set-drawing", mode => {
            self.drawMode = mode;
        });

        this.context.on("mouse:down", opt => {
            if (!self.drawMode)
                return;

            const mouse = self.context.getPointer(opt.e);
            self.startedDrawing = true;
            self.drawStartPos.x = mouse.x;
            self.drawStartPos.y = mouse.y;

            const AnnotationClass = getAnnotationClass(self.drawMode);
            const annotation = new AnnotationClass(self.drawStartPos.x, self.drawStartPos.y, 0, 0);

            annotation.addToContext(self.context);
            self.context.renderAll();
            annotation.setAsActiveObject(self.context);
        });
        this.context.on("mouse:move", opt => {
            if (!self.drawMode)
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

            const object = self.context.getActiveObject();
            const annotation = object.annotationInstance;

            annotation.width = w;
            annotation.height = h;
            self.context.renderAll();
        });
        this.context.on("mouse:up", opt => {
            if (!self.drawMode)
                return false;

            if(self.startedDrawing) {
                self.startedDrawing = false;
            }

            const object = self.context.getActiveObject();
            const annotation = object.annotationInstance;
            annotation.addToContext(self.context);
            self.context.renderAll();

            EventBus.$emit("set-drawing", null);
        });

        this.context.on("object:moved", opt => {
            const annotation = opt.target.annotationInstance;
            annotation.x = opt.target.left;
            annotation.y = opt.target.top;
        });

        this.context.on("object:scaled", opt => {
            const annotation = opt.target.annotationInstance;
            annotation.width = opt.target.width * opt.target.scaleX;
            annotation.height = opt.target.height * opt.target.scaleY;
        });
    }

    draw() {

    }
}


export default Annotations;