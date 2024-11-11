import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class BodyStyleService {
    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    setStyles(styles: { [style: string]: string }) {
        const keys = Object.keys(styles);
        for (var i = 0; i < keys.length; i++) {
            this.renderer.setStyle(document.body, keys[i], styles[keys[i]]);
        }
    }
    addClass(className: string) {
        this.renderer.addClass(document.body, className);
    }
    removeClass(className: string) {
        this.renderer.removeClass(document.body, className);
    }
}
