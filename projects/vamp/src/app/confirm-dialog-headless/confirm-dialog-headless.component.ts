import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
    selector: "app-confirm-dialog-headless",
    templateUrl: "./confirm-dialog-headless.component.html",
    standalone: true,
    imports: [ConfirmDialogModule, ButtonModule],
    providers: [],
})
export class ConfirmDialogHeadless {
    @Input() accept: string = "Save";
    @Input() reject: string = "Cancel";
    @Output() onHide = new EventEmitter<any>();

    hide = (ev: any) => {
        this.onHide.emit(ev);
    };
}
