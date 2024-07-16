import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { injectBeforeRender, NgtArgs, omit } from 'angular-three';
import { MeshWobbleMaterial, MeshWobbleMaterialOptions } from 'angular-three-soba/shaders';
import { mergeInputs } from 'ngxtension/inject-inputs';

export interface NgtsMeshWobbleMaterialOptions extends MeshWobbleMaterialOptions {
	speed: number;
}

const defaultOptions: NgtsMeshWobbleMaterialOptions = {
	speed: 1,
};

@Component({
	selector: 'ngts-mesh-wobble-material',
	standalone: true,
	template: `
		<ngt-primitive *args="[material()]" [parameters]="parameters()" [attach]="attach()">
			<ng-content />
		</ngt-primitive>
	`,
	imports: [NgtArgs],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgtsMeshWobbleMaterial {
	attach = input('material');
	options = input(defaultOptions, { transform: mergeInputs(defaultOptions) });
	parameters = omit(this.options, ['speed']);

	material = computed(() => new MeshWobbleMaterial());

	constructor() {
		injectBeforeRender(({ clock }) => {
			const material = this.material();
			material.time = clock.elapsedTime * this.options().speed;
		});
	}
}